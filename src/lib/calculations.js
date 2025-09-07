// Default formulas
export const DEFAULT_FORMULAS = {
  target: 'eps * pe * (1 + growth/100)',
  fair: 'eps * pe',
  annual: '((eps * pe * (1 + growth/100)) / currentPrice - 1) * 100'
};

// Calculate formula safely
export const calculateFormula = (formula, variables) => {
  try {
    let expression = formula;
    
    // Replace variables with their values
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      expression = expression.replace(regex, variables[key]);
    });
    
    // Security check - only allow basic math operations
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      throw new Error('נוסחה לא תקינה');
    }
    
    // Calculate result
    const result = Function(`"use strict"; return (${expression})`)();
    return isNaN(result) ? 0 : result;
  } catch (error) {
    console.error('Formula calculation error:', error);
    return 0;
  }
};

// Calculate projections
export const calculateProjections = (inputs, years) => {
  const projections = [];
  
  for (let i = 0; i < years; i++) {
    const year = 2025 + i;
    
    if (i === 0) {
      // Current year
      const fair = inputs.eps * inputs.pe;
      projections.push({
        year,
        eps: inputs.eps,
        pe: inputs.pe,
        revenue: inputs.revenue,
        netIncome: inputs.netIncome,
        fair,
        marketPrice: inputs.currentPrice,
        cagr: null
      });
    } else {
      // Future years
      const prev = projections[i - 1];
      const growthMultiplier = 1 + (inputs.growth / 100);
      
      const eps = prev.eps * growthMultiplier;
      const pe = Math.max(prev.pe * (1 - (inputs.growth / 100 * 0.1)), 5);
      const revenue = prev.revenue * growthMultiplier;
      const netIncome = prev.netIncome * growthMultiplier;
      const fair = eps * pe;
      const cagr = ((fair / projections[0].fair) ** (1 / i)) - 1;
      
      projections.push({
        year,
        eps,
        pe,
        revenue,
        netIncome,
        fair,
        marketPrice: inputs.currentPrice,
        cagr
      });
    }
  }
  
  return projections;
};

// Update investment scale position
export const calculateInvestmentPosition = (annualReturn, expectedReturn = 10) => {
  let position = 0;
  
  if (annualReturn <= 0) {
    position = 16.67; // Red zone
  } else if (annualReturn < expectedReturn * 0.8) {
    position = 16.67; // Red zone
  } else if (annualReturn < expectedReturn * 1.2) {
    position = 50; // Yellow zone
  } else if (annualReturn < expectedReturn * 2) {
    position = 66.67; // Green zone start
  } else {
    position = 83.33; // Green zone end
  }
  
  return position;
};

// Auto calculate market data
export const autoCalculateMarketData = (shares, currentPrice, marketCap) => {
  const result = { shares, currentPrice, marketCap };
  
  // If we have 2 out of 3 values, calculate the third
  if (shares > 0 && currentPrice > 0) {
    // Calculate market cap
    result.marketCap = shares * currentPrice;
  } else if (marketCap > 0 && shares > 0 && currentPrice === 0) {
    // Calculate price per share
    result.currentPrice = marketCap / shares;
  } else if (marketCap > 0 && currentPrice > 0 && shares === 0) {
    // Calculate number of shares
    result.shares = marketCap / currentPrice;
  }
  
  return result;
};

// Fetch stock data from API
export const fetchStockData = async (symbol) => {
  try {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)}`;
    const response = await fetch(url);
    const data = await response.json();
    const stockInfo = JSON.parse(data.contents);
    
    if (stockInfo.chart && stockInfo.chart.result && stockInfo.chart.result[0]) {
      const result = stockInfo.chart.result[0];
      const meta = result.meta;
      
      return {
        name: meta.longName || meta.shortName || symbol,
        symbol: symbol,
        price: meta.regularMarketPrice || meta.previousClose,
        change: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100),
        volume: meta.regularMarketVolume || 0,
        marketCap: meta.marketCap,
        type: 'CS'
      };
    }
    
    throw new Error('לא ניתן לטעון נתונים');
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

// Real-time price fetching
export const fetchRealTimePrice = async (symbol) => {
  try {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)}`;
    const response = await fetch(url);
    const data = await response.json();
    const stockInfo = JSON.parse(data.contents);
    
    if (stockInfo.chart && stockInfo.chart.result && stockInfo.chart.result[0]) {
      const result = stockInfo.chart.result[0];
      const meta = result.meta;
      
      const currentPrice = meta.regularMarketPrice || meta.previousClose;
      const previousClose = meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      return {
        symbol: symbol,
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        currency: meta.currency || 'USD',
        lastUpdate: new Date().toISOString(),
        volume: meta.regularMarketVolume || 0
      };
    }
    
    throw new Error('לא ניתן לטעון מחיר עדכני');
  } catch (error) {
    console.error('Error fetching real-time price:', error);
    throw error;
  }
};

// Update portfolio with real-time prices
export const updatePortfolioWithRealTimePrices = async (portfolio) => {
  const updatedPortfolio = [];
  
  for (const stock of portfolio) {
    try {
      const realTimeData = await fetchRealTimePrice(stock.symbol);
      updatedPortfolio.push({
        ...stock,
        currentPrice: realTimeData.price,
        change: realTimeData.change,
        changePercent: realTimeData.changePercent,
        lastUpdate: realTimeData.lastUpdate,
        volume: realTimeData.volume
      });
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Error updating ${stock.symbol}:`, error);
      // Keep original data if update fails
      updatedPortfolio.push({
        ...stock,
        changePercent: 0,
        lastUpdate: new Date().toISOString()
      });
    }
  }
  
  return updatedPortfolio;
};

// Calculate portfolio statistics
export const calculatePortfolioStats = (portfolio) => {
  if (!portfolio || portfolio.length === 0) {
    return {
      totalValue: 0,
      totalInvested: 0,
      totalPnL: 0,
      totalPnLPercent: 0,
      stockCount: 0,
      avgChange: 0
    };
  }

  let totalValue = 0;
  let totalInvested = 0;
  let totalChange = 0;

  portfolio.forEach(stock => {
    const invested = stock.shares * stock.avgPrice;
    const current = stock.shares * stock.currentPrice;
    
    totalValue += current;
    totalInvested += invested;
    totalChange += (stock.changePercent || 0);
  });

  const totalPnL = totalValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const avgChange = portfolio.length > 0 ? totalChange / portfolio.length : 0;

  return {
    totalValue,
    totalInvested,
    totalPnL,
    totalPnLPercent,
    stockCount: portfolio.length,
    avgChange
  };
};

// Generate auto calculation estimates
export const generateAutoEstimates = (stockData) => {
  let growth = 12;
  let estimatedPE = 15;
  
  // Adjust based on stock performance
  if (stockData.change > 20) {
    growth = 18;
    estimatedPE = 20;
  } else if (stockData.change > 10) {
    growth = 15;
    estimatedPE = 17;
  } else if (stockData.change < -10) {
    growth = 6;
    estimatedPE = 12;
  } else if (stockData.change < -20) {
    growth = 3;
    estimatedPE = 10;
  }
  
  const currentPrice = stockData.price;
  const estimatedEPS = currentPrice / 20;
  const estimatedRevenue = estimatedEPS * 100;
  const estimatedShares = 100;
  const estimatedMarketCap = currentPrice * estimatedShares;
  
  return {
    pe: estimatedPE,
    eps: estimatedEPS,
    revenue: estimatedRevenue,
    netIncome: estimatedEPS * estimatedShares,
    growth,
    shares: estimatedShares,
    currentPrice,
    marketCap: estimatedMarketCap
  };
};