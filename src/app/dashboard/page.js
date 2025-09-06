'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../components/UI/Button';
import Notification, { useNotification } from '../components/UI/Notification';
import ManualCalc from '../components/Calculator/ManualCalc';
import AutoCalc from '../components/Calculator/AutoCalc';
import ResultsDisplay from '../components/Calculator/ResultsDisplay';
import { 
  calculateFormula, 
  calculateProjections, 
  DEFAULT_FORMULAS 
} from '../../lib/calculations';
import { loadFormulas } from '../../lib/firestore';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [mode, setMode] = useState('manual'); // 'manual' or 'auto'
  const [results, setResults] = useState(null);
  const [projections, setProjections] = useState(null);
  const [symbol, setSymbol] = useState(null);
  const [formulas, setFormulas] = useState(DEFAULT_FORMULAS);
  
  const { notification, notify } = useNotification();
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const savedUser = sessionStorage.getItem('tsi_current_user');
    const userType = sessionStorage.getItem('tsi_user_type');
    
    if (!savedUser || userType !== 'user') {
      router.push('/');
      return;
    }
    
    setCurrentUser(savedUser);
    
    // Load formulas
    loadCurrentFormulas();
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

  if (!currentUser) {
    return <div>טוען...</div>;
  }

  return (
    <div className="container">
      <Notification notification={notification} />

      {/* Header with logout */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Button variant="secondary" onClick={handleLogout}>
            יציאה
          </Button>
          <span style={{ fontWeight: 700, color: '#FFD700' }}>
            ברוך הבא {currentUser}
          </span>
        </div>

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
      </div>

      {/* Results */}
      {results && (
        <ResultsDisplay 
          results={results}
          projections={projections}
          symbol={symbol}
        />
      )}
    </div>
  );
}