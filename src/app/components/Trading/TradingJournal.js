'use client';
import { useState, useEffect } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import PortfolioChart from './PortfolioChart';
import { 
  saveTrade, 
  getUserTrades, 
  getUserPortfolio, 
  savePortfolio,
  deleteTrade 
} from '../../../lib/firestore';
import { calculatePortfolioStats } from '../../../lib/calculations';
import { notify } from '../UI/Notification';

export default function TradingJournal({ userId, userData, onStatsUpdate }) {
  const [trades, setTrades] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [currentView, setCurrentView] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTrade, setNewTrade] = useState({
    type: 'buy',
    symbol: '',
    shares: '',
    price: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tradesData, portfolioData] = await Promise.all([
        getUserTrades(userId),
        getUserPortfolio(userId)
      ]);
      
      setTrades(tradesData || []);
      setPortfolio(portfolioData || []);
      
      if (onStatsUpdate) {
        onStatsUpdate(userId);
      }
    } catch (error) {
      console.error('Error loading trading data:', error);
      notify('שגיאה בטעינת נתוני המסחר', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    
    if (!newTrade.symbol || !newTrade.shares || !newTrade.price) {
      notify('נא למלא את כל השדות', 'error');
      return;
    }

    if (parseFloat(newTrade.shares) <= 0 || parseFloat(newTrade.price) <= 0) {
      notify('כמות ומחיר חייבים להיות חיוביים', 'error');
      return;
    }

    setLoading(true);
    try {
      const tradeData = {
        type: newTrade.type,
        symbol: newTrade.symbol.toUpperCase(),
        shares: parseFloat(newTrade.shares),
        price: parseFloat(newTrade.price),
        date: newTrade.date,
        total: parseFloat(newTrade.shares) * parseFloat(newTrade.price)
      };

      if (tradeData.type === 'sell') {
        const existingStock = portfolio.find(stock => stock.symbol === tradeData.symbol);
        if (!existingStock || existingStock.shares < tradeData.shares) {
          notify('אין מספיק מניות למכירה', 'error');
          setLoading(false);
          return;
        }
      }

      const tradeId = await saveTrade(userId, tradeData);
      
      if (tradeId) {
        await updatePortfolio(tradeData);
        await loadData();
        
        setNewTrade({
          type: 'buy',
          symbol: '',
          shares: '',
          price: '',
          date: new Date().toISOString().split('T')[0]
        });
        
        setCurrentView('overview');
        notify('עסקה נשמרה בהצלחה!');
      } else {
        notify('שגיאה בשמירת העסקה', 'error');
      }
    } catch (error) {
      console.error('Error saving trade:', error);
      notify('שגיאה בשמירת העסקה', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolio = async (tradeData) => {
    try {
      const currentPortfolio = [...portfolio];
      const existingStock = currentPortfolio.find(stock => stock.symbol === tradeData.symbol);
      
      if (tradeData.type === 'buy') {
        if (existingStock) {
          const totalShares = existingStock.shares + tradeData.shares;
          const totalValue = (existingStock.shares * existingStock.avgPrice) + (tradeData.shares * tradeData.price);
          existingStock.shares = totalShares;
          existingStock.avgPrice = totalValue / totalShares;
          existingStock.currentPrice = tradeData.price;
        } else {
          currentPortfolio.push({
            symbol: tradeData.symbol,
            shares: tradeData.shares,
            avgPrice: tradeData.price,
            currentPrice: tradeData.price
          });
        }
      } else {
        if (existingStock) {
          existingStock.shares -= tradeData.shares;
          existingStock.currentPrice = tradeData.price;
          
          if (existingStock.shares <= 0) {
            const index = currentPortfolio.indexOf(existingStock);
            currentPortfolio.splice(index, 1);
          }
        }
      }
      
      await savePortfolio(userId, currentPortfolio);
    } catch (error) {
      console.error('Error updating portfolio:', error);
    }
  };

  const handleDeleteTrade = async (tradeId) => {
    if (confirm('האם אתה בטוח שברצונך למחוק עסקה זו?')) {
      setLoading(true);
      try {
        const success = await deleteTrade(tradeId);
        if (success) {
          await loadData();
          notify('העסקה נמחקה');
        } else {
          notify('שגיאה במחיקת העסקה', 'error');
        }
      } catch (error) {
        console.error('Error deleting trade:', error);
        notify('שגיאה במחיקת העסקה', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteStock = async (stockSymbol) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את ${stockSymbol} מהתיק?`)) {
      setLoading(true);
      try {
        const updatedPortfolio = portfolio.filter(stock => stock.symbol !== stockSymbol);
        await savePortfolio(userId, updatedPortfolio);
        await loadData();
        notify(`${stockSymbol} נמחק מהתיק`);
      } catch (error) {
        console.error('Error deleting stock:', error);
        notify('שגיאה במחיקת המניה', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const portfolioStats = calculatePortfolioStats(portfolio);

  return (
    <div className="section">
      <h2 className="section-title">יומן המסחר</h2>
      
      {/* כפתורי ניווט יפים ונגישים */}
      <div className="modern-navigation">
        <button 
          className={`nav-tab ${currentView === 'overview' ? 'active' : ''}`}
          onClick={() => {setCurrentView('overview'); setEditMode(false);}}
        >
          <span className="nav-text">סקירה כללית</span>
          {portfolio.length > 0 && (
            <span className="nav-badge">{portfolio.length}</span>
          )}
        </button>
        
        <button 
          className={`nav-tab ${currentView === 'add-trade' ? 'active' : ''}`}
          onClick={() => {setCurrentView('add-trade'); setEditMode(false);}}
        >
          <span className="nav-text">הוסף עסקה</span>
        </button>
        
        <button 
          className={`nav-tab ${currentView === 'trades' ? 'active' : ''}`}
          onClick={() => {setCurrentView('trades'); setEditMode(false);}}
        >
          <span className="nav-text">היסטוריה</span>
          {trades.length > 0 && (
            <span className="nav-badge">{trades.length}</span>
          )}
        </button>
      </div>

      {loading && <div className="loading">טוען נתונים...</div>}

      {/* סקירה כללית */}
      {currentView === 'overview' && (
        <div>
          {/* סטטיסטיקות מהירות */}
          <div className="stats-summary">
            <div className="stat-item primary">
              <div className="stat-value">${portfolioStats.totalValue.toLocaleString()}</div>
              <div className="stat-label">שווי תיק נוכחי</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{portfolioStats.stockCount}</div>
              <div className="stat-label">מניות בתיק</div>
            </div>
            <div className={`stat-item ${portfolioStats.totalPnL >= 0 ? 'positive' : 'negative'}`}>
              <div className="stat-value">
                {portfolioStats.totalPnL >= 0 ? '+' : ''}${Math.round(portfolioStats.totalPnL).toLocaleString()}
              </div>
              <div className="stat-label">רווח/הפסד כולל</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{trades.length}</div>
              <div className="stat-label">סה"כ עסקאות</div>
            </div>
          </div>

          {portfolio.length > 0 ? (
            <div className="portfolio-dashboard">
              {/* עוגת פילוח */}
              <div className="chart-section">
                <PortfolioChart portfolio={portfolio} />
              </div>
              
              {/* טבלת מניות יחידה ויפה */}
              <div className="portfolio-section">
                <div className="section-header">
                  <h3 className="section-subtitle">המניות בתיק שלי</h3>
                  <Button 
                    variant={editMode ? "danger" : "secondary"}
                    size="small"
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? 'סיום עריכה' : 'ערוך תיק'}
                  </Button>
                </div>
                
                <div className="beautiful-table-container">
                  <table className="beautiful-table">
                    <thead>
                      <tr>
                        <th>סמל המניה</th>
                        <th>כמות</th>
                        <th>מחיר קנייה ממוצע</th>
                        <th>מחיר נוכחי</th>
                        <th>שווי נוכחי</th>
                        <th>רווח/הפסד</th>
                        <th>אחוז שינוי</th>
                        {editMode && <th>פעולות</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((stock, index) => {
                        const invested = (stock.shares || 0) * (stock.avgPrice || 0);
                        const current = (stock.shares || 0) * (stock.currentPrice || 0);
                        const pnl = current - invested;
                        const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
                        
                        return (
                          <tr key={index} className="table-row">
                            <td className="stock-symbol">
                              <span className="symbol-badge">{stock.symbol}</span>
                            </td>
                            <td className="shares-cell">{stock.shares.toLocaleString()}</td>
                            <td className="price-cell">${(stock.avgPrice || 0).toFixed(2)}</td>
                            <td className="price-cell">${(stock.currentPrice || 0).toFixed(2)}</td>
                            <td className="value-cell">${current.toLocaleString()}</td>
                            <td className={`pnl-cell ${pnl >= 0 ? 'profit' : 'loss'}`}>
                              <div className="pnl-amount">
                                {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                              </div>
                            </td>
                            <td className={`percent-cell ${pnlPercent >= 0 ? 'profit' : 'loss'}`}>
                              <div className="percent-badge">
                                {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
                              </div>
                            </td>
                            {editMode && (
                              <td className="actions-cell">
                                <Button 
                                  variant="danger" 
                                  size="small"
                                  onClick={() => handleDeleteStock(stock.symbol)}
                                >
                                  מחק
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>התיק שלך ריק</h3>
              <p>הוסף עסקה ראשונה כדי להתחיל</p>
              <Button variant="success" onClick={() => setCurrentView('add-trade')}>
                הוסף עסקה ראשונה
              </Button>
            </div>
          )}
        </div>
      )}

      {/* טופס הוספת עסקה */}
      {currentView === 'add-trade' && (
        <div className="add-trade-section">
          <div className="form-header">
            <h3>הוסף עסקה חדשה</h3>
            <p>הזן פרטי עסקה כדי לעדכן את התיק שלך</p>
          </div>
          
          <form onSubmit={handleTradeSubmit} className="beautiful-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">סוג עסקה</label>
                <select 
                  className="form-select"
                  value={newTrade.type}
                  onChange={(e) => setNewTrade({...newTrade, type: e.target.value})}
                >
                  <option value="buy">קנייה</option>
                  <option value="sell">מכירה</option>
                </select>
              </div>
              
              <Input
                label="סמל המניה"
                type="text"
                value={newTrade.symbol}
                onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value.toUpperCase()})}
                placeholder="לדוגמה: AAPL, MSFT, GOOGL"
                required
              />
            </div>
            
            <div className="form-row">
              <Input
                label="כמות מניות"
                type="number"
                step="0.001"
                min="0.001"
                value={newTrade.shares}
                onChange={(e) => setNewTrade({...newTrade, shares: e.target.value})}
                placeholder="0"
                required
              />
              
              <Input
                label="מחיר למניה ($)"
                type="number"
                step="0.01"
                min="0.01"
                value={newTrade.price}
                onChange={(e) => setNewTrade({...newTrade, price: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="form-row">
              <Input
                label="תאריך העסקה"
                type="date"
                value={newTrade.date}
                onChange={(e) => setNewTrade({...newTrade, date: e.target.value})}
                required
              />
              
              <div className="form-group">
                <label className="form-label">סכום כולל</label>
                <div className="total-amount">
                  ${(parseFloat(newTrade.shares || 0) * parseFloat(newTrade.price || 0)).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <Button type="submit" variant="success" loading={loading}>
                שמור עסקה
              </Button>
              <Button 
                type="button"
                variant="secondary" 
                onClick={() => setCurrentView('overview')}
              >
                ביטול
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* היסטוריית עסקאות */}
      {currentView === 'trades' && (
        <div className="trades-section">
          <div className="section-header">
            <h3>היסטוריית עסקאות</h3>
            <span className="trades-count">סה"כ {trades.length} עסקאות</span>
          </div>
          
          {trades.length > 0 ? (
            <div className="trades-table-container">
              <table className="trades-table">
                <thead>
                  <tr>
                    <th>תאריך</th>
                    <th>סוג</th>
                    <th>מניה</th>
                    <th>כמות</th>
                    <th>מחיר</th>
                    <th>סכום כולל</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade, index) => (
                    <tr key={trade.id || index} className="trade-row">
                      <td className="date-cell">
                        {new Date(trade.date).toLocaleDateString('he-IL')}
                      </td>
                      <td className="type-cell">
                        <span className={`trade-badge ${trade.type}`}>
                          {trade.type === 'buy' ? 'קנייה' : 'מכירה'}
                        </span>
                      </td>
                      <td className="symbol-cell">
                        <span className="symbol-badge">{trade.symbol}</span>
                      </td>
                      <td className="amount-cell">{trade.shares.toLocaleString()}</td>
                      <td className="price-cell">${trade.price.toLocaleString()}</td>
                      <td className="total-cell">
                        ${(trade.total || (trade.shares * trade.price)).toLocaleString()}
                      </td>
                      <td className="actions-cell">
                        <Button 
                          variant="danger" 
                          size="small"
                          onClick={() => handleDeleteTrade(trade.id)}
                          loading={loading}
                        >
                          מחק
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>אין עסקאות בהיסטוריה</h3>
              <p>כל העסקאות שתבצע יופיעו כאן</p>
              <Button 
                variant="success" 
                onClick={() => setCurrentView('add-trade')}
              >
                הוסף עסקה ראשונה
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}