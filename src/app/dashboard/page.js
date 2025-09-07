'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../components/UI/Button';
import Notification, { useNotification } from '../components/UI/Notification';
import ManualCalc from '../components/Calculator/ManualCalc';
import AutoCalc from '../components/Calculator/AutoCalc';
import ResultsDisplay from '../components/Calculator/ResultsDisplay';
import TradingJournal from '../components/Trading/TradingJournal';
import { 
  calculateFormula, 
  calculateProjections, 
  DEFAULT_FORMULAS,
  calculatePortfolioStats
} from '../../lib/calculations';
import { loadFormulas, getUserPortfolio } from '../../lib/firestore';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'calculator', 'trading'
  const [mode, setMode] = useState('manual'); // 'manual' or 'auto'
  const [results, setResults] = useState(null);
  const [projections, setProjections] = useState(null);
  const [symbol, setSymbol] = useState(null);
  const [formulas, setFormulas] = useState(DEFAULT_FORMULAS);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    stockCount: 0,
    totalPnL: 0,
    avgChange: 0
  });
  
  const { notification, notify } = useNotification();
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const savedUser = sessionStorage.getItem('tsi_current_user');
    const userType = sessionStorage.getItem('tsi_user_type');
    const storedUserData = sessionStorage.getItem('tsi_user_data');
    
    if (!savedUser || userType !== 'user') {
      router.push('/');
      return;
    }
    
    setCurrentUser(savedUser);
    
    // Parse user data
    try {
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    
    // Load formulas and portfolio
    loadCurrentFormulas();
    loadPortfolioStats(savedUser);
  }, [router]);

  const loadCurrentFormulas = async () => {
    try {
      const savedFormulas = await loadFormulas();
      if (savedFormulas) {
        setFormulas({ ...DEFAULT_FORMULAS, ...savedFormulas });
      }
    } catch (error) {
      console.log('Using default formulas');
    }
  };

  const loadPortfolioStats = async (userId) => {
    try {
      const portfolio = await getUserPortfolio(userId);
      const stats = calculatePortfolioStats(portfolio);
      setPortfolioStats(stats);
    } catch (error) {
      console.error('Error loading portfolio stats:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/');
    notify('יצאת מהמערכת');
  };

  const handleManualCalculation = (calculationData) => {
    try {
      const variables = {
        pe: calculationData.pe,
        eps: calculationData.eps,
        revenue: calculationData.revenue,
        netIncome: calculationData.netIncome,
        growth: calculationData.growth,
        shares: calculationData.shares,
        currentPrice: calculationData.currentPrice,
        marketCap: calculationData.marketCap
      };

      const targetPrice = calculateFormula(formulas.target, variables);
      const fairValue = calculateFormula(formulas.fair, variables);
      const annualReturn = calculateFormula(formulas.annual, variables);

      const calculationResults = {
        marketCap: `${calculationData.marketCap.toFixed(2)} מיליון $`,
        pe: calculationData.pe.toFixed(2),
        targetPrice: `$${targetPrice.toFixed(2)}`,
        fairValue: `$${fairValue.toFixed(2)}`,
        annualReturn: `${annualReturn.toFixed(2)}%`
      };

      const projectionData = calculateProjections(calculationData, calculationData.years + 1);

      setResults(calculationResults);
      setProjections(projectionData);
      setSymbol(null);
      notify('החישוב הושלם!');
    } catch (error) {
      notify('שגיאה בחישוב', 'error');
    }
  };

  const handleAutoCalculation = (estimatedData, stockSymbol) => {
    try {
      const variables = {
        pe: estimatedData.pe,
        eps: estimatedData.eps,
        revenue: estimatedData.revenue,
        netIncome: estimatedData.netIncome,
        growth: estimatedData.growth,
        shares: estimatedData.shares,
        currentPrice: estimatedData.currentPrice,
        marketCap: estimatedData.marketCap
      };

      const targetPrice = calculateFormula(formulas.target, variables);
      const fairValue = calculateFormula(formulas.fair, variables);
      const annualReturn = calculateFormula(formulas.annual, variables);

      const calculationResults = {
        marketCap: `${estimatedData.marketCap.toFixed(2)} מיליון $ (מוערך)`,
        pe: estimatedData.pe.toFixed(2),
        targetPrice: `$${targetPrice.toFixed(2)}`,
        fairValue: `$${fairValue.toFixed(2)}`,
        annualReturn: `${annualReturn.toFixed(2)}%`
      };

      const projectionData = calculateProjections(estimatedData, 6); // 5 years + current

      setResults(calculationResults);
      setProjections(projectionData);
      setSymbol(stockSymbol);
      notify('תחזית הושלמה בהתבסס על נתונים מהשוק!');
    } catch (error) {
      notify('שגיאה בחישוב', 'error');
    }
  };

  const handlePortfolioUpdate = (userId) => {
    loadPortfolioStats(userId);
  };

  if (!currentUser) {
    return <div className="container">טוען...</div>;
  }

  return (
    <div className="container">
      <Notification notification={notification} />

      {/* Header with navigation */}
      <div className="header">
        <div className="nav-buttons">
          <button className="nav-btn" onClick={handleLogout}>
            יציאה
          </button>
          <button 
            className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            בית
          </button>
          <button 
            className={`nav-btn ${currentView === 'calculator' ? 'active' : ''}`}
            onClick={() => setCurrentView('calculator')}
          >
            מחשבון
          </button>
          <button 
            className={`nav-btn ${currentView === 'trading' ? 'active' : ''}`}
            onClick={() => setCurrentView('trading')}
          >
            יומן מסחר
          </button>
        </div>
        
        <div className="logo">TSI</div>
        <div className="subtitle">פלטפורמת השקעות מתקדמת</div>
      </div>

      {/* Home View */}
      {currentView === 'home' && (
        <div className="section">
          <div className="welcome-section">
            <h1 className="welcome-title">
              שלום {userData?.name || currentUser}!
            </h1>
            <h3 className="welcome-subtitle">
              טוב לראות אותך שוב
            </h3>
          </div>

          {/* Dashboard Stats */}
          <div className="stats-grid dashboard-stats">
            <div className="stat-card">
              <div className="stat-number">₪{portfolioStats.totalValue.toLocaleString()}</div>
              <div className="stat-label">שווי תיק השקעות</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(45deg, #28a745, #20c997)' }}>
              <div className="stat-number">{portfolioStats.stockCount}</div>
              <div className="stat-label">מניות בתיק</div>
            </div>
            <div className="stat-card" style={{ 
              background: portfolioStats.totalPnL >= 0 
                ? 'linear-gradient(45deg, #28a745, #20c997)' 
                : 'linear-gradient(45deg, #dc3545, #c82333)' 
            }}>
              <div className="stat-number">
                {portfolioStats.totalPnL >= 0 ? '+' : ''}₪{portfolioStats.totalPnL.toLocaleString()}
              </div>
              <div className="stat-label">רווח/הפסד כולל</div>
            </div>
            <div className="stat-card" style={{ 
              background: portfolioStats.avgChange >= 0 
                ? 'linear-gradient(45deg, #28a745, #20c997)' 
                : 'linear-gradient(45deg, #dc3545, #c82333)'
            }}>
              <div className="stat-number">
                {portfolioStats.avgChange >= 0 ? '+' : ''}{portfolioStats.avgChange.toFixed(2)}%
              </div>
              <div className="stat-label">שינוי ממוצע</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="action-buttons">
            <Button 
              size="full" 
              onClick={() => setCurrentView('calculator')}
            >
              עבור למחשבון הערכת שווי
            </Button>
            <Button 
              variant="success"
              size="full" 
              onClick={() => setCurrentView('trading')}
            >
              עבור ליומן המסחר
            </Button>
          </div>

          {/* Quick Portfolio Overview */}
          {portfolioStats.stockCount > 0 && (
            <div className="quick-portfolio">
              <h4>התיק שלך</h4>
              <p>
                יש לך {portfolioStats.stockCount} מניות בתיק בשווי כולל של ₪{portfolioStats.totalValue.toLocaleString()}
              </p>
              <p style={{ 
                color: portfolioStats.totalPnL >= 0 ? '#28a745' : '#dc3545',
                fontWeight: 800 
              }}>
                רווח/הפסד: {portfolioStats.totalPnL >= 0 ? '+' : ''}₪{portfolioStats.totalPnL.toFixed(2)} 
                ({portfolioStats.totalPnLPercent >= 0 ? '+' : ''}{portfolioStats.totalPnLPercent.toFixed(2)}%)
              </p>
              <Button 
                variant="secondary" 
                onClick={() => setCurrentView('trading')}
                style={{ marginTop: '10px' }}
              >
                צפה בפרטים מלאים
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Calculator View */}
      {currentView === 'calculator' && (
        <div className="section">
          <h2 className="section-title">מחשבון הערכת שווי</h2>

          {/* Mode Selector */}
          <div className="mode-selector">
            <button 
              className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
              onClick={() => {
                setMode('manual');
                setResults(null);
                setProjections(null);
              }}
            >
              חישוב ידני
            </button>
            <button 
              className={`mode-btn ${mode === 'auto' ? 'active' : ''}`}
              onClick={() => {
                setMode('auto');
                setResults(null);
                setProjections(null);
              }}
            >
              נתונים מהשוק
            </button>
          </div>

          {/* Calculator Components */}
          {mode === 'manual' ? (
            <ManualCalc onCalculate={handleManualCalculation} />
          ) : (
            <AutoCalc onCalculate={handleAutoCalculation} />
          )}

          {/* Results */}
          {results && (
            <ResultsDisplay 
              results={results}
              projections={projections}
              symbol={symbol}
            />
          )}
        </div>
      )}

      {/* Trading Journal View */}
      {currentView === 'trading' && (
        <TradingJournal 
          userId={currentUser}
          userData={userData}
          onStatsUpdate={handlePortfolioUpdate}
        />
      )}
    </div>
  );
}