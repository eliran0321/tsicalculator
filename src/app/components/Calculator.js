'use client';
import { useState } from 'react';

export default function Calculator({ onBack }) {
  const [mode, setMode] = useState('manual');
  const [showResults, setShowResults] = useState(false);
  
  // Manual calculation fields
  const [pe, setPe] = useState('');
  const [eps, setEps] = useState('');
  const [revenue, setRevenue] = useState('');
  const [netIncome, setNetIncome] = useState('');
  const [growth, setGrowth] = useState('');
  const [shares, setShares] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [marketCap, setMarketCap] = useState('');
  const [years, setYears] = useState('5');
  
  // Results
  const [results, setResults] = useState({});

  const autoCalculateMarketData = () => {
    const sharesNum = parseFloat(shares) || 0;
    const priceNum = parseFloat(currentPrice) || 0;
    
    if (sharesNum > 0 && priceNum > 0) {
      setMarketCap((sharesNum * priceNum).toFixed(2));
    }
  };

  const calculateManual = () => {
    const peNum = parseFloat(pe);
    const epsNum = parseFloat(eps);
    const growthNum = parseFloat(growth);
    const priceNum = parseFloat(currentPrice);
    
    if (!peNum || !epsNum || !growthNum || !priceNum) {
      alert('נא למלא את כל השדות');
      return;
    }
    
    const targetPrice = epsNum * peNum * (1 + growthNum/100);
    const fairValue = epsNum * peNum;
    const annualReturn = ((targetPrice / priceNum - 1) * 100);
    
    setResults({
      marketCap: marketCap || (shares * currentPrice),
      pe: peNum,
      targetPrice: targetPrice.toFixed(2),
      fairValue: fairValue.toFixed(2),
      annualReturn: annualReturn.toFixed(2)
    });
    
    setShowResults(true);
  };

  return (
    <div className="section">
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
        <button className="btn btn-secondary" onClick={onBack}>חזרה לדאשבורד</button>
      </div>
      
      <h2 className="section-title">מחשבון הערכת שווי</h2>
      
      <div className="mode-selector">
        <button 
          className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
          onClick={() => setMode('manual')}
        >
          חישוב ידני
        </button>
        <button 
          className={`mode-btn ${mode === 'auto' ? 'active' : ''}`}
          onClick={() => setMode('auto')}
        >
          נתונים מהשוק
        </button>
      </div>
      
      {mode === 'manual' ? (
        <div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">מכפיל רווח (P/E)</label>
              <input 
                type="number" 
                className="form-input" 
                value={pe}
                onChange={(e) => setPe(e.target.value)}
                step="0.01"
                placeholder="הכנס מכפיל רווח"
              />
            </div>
            <div className="form-group">
              <label className="form-label">רווח למניה (EPS)</label>
              <input 
                type="number" 
                className="form-input"
                value={eps}
                onChange={(e) => setEps(e.target.value)}
                step="0.01"
                placeholder="הכנס רווח למניה"
              />
            </div>
            <div className="form-group">
              <label className="form-label">הכנסות (מיליון $)</label>
              <input 
                type="number" 
                className="form-input"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                step="0.01"
                placeholder="הכנס הכנסות"
              />
            </div>
            <div className="form-group">
              <label className="form-label">רווח נקי (מיליון $)</label>
              <input 
                type="number" 
                className="form-input"
                value={netIncome}
                onChange={(e) => setNetIncome(e.target.value)}
                step="0.01"
                placeholder="הכנס רווח נקי"
              />
            </div>
            <div className="form-group">
              <label className="form-label">צמיחה שנתית (%)</label>
              <input 
                type="number" 
                className="form-input"
                value={growth}
                onChange={(e) => setGrowth(e.target.value)}
                step="0.1"
                placeholder="הכנס צמיחה צפויה"
              />
            </div>
            <div className="form-group">
              <label className="form-label">מספר מניות (מיליון)</label>
              <input 
                type="number" 
                className="form-input"
                value={shares}
                onChange={(e) => {
                  setShares(e.target.value);
                  autoCalculateMarketData();
                }}
                step="0.01"
                placeholder="הכנס מספר מניות"
              />
            </div>
            <div className="form-group">
              <label className="form-label">מחיר למניה ($)</label>
              <input 
                type="number" 
                className="form-input"
                value={currentPrice}
                onChange={(e) => {
                  setCurrentPrice(e.target.value);
                  autoCalculateMarketData();
                }}
                step="0.01"
                placeholder="הכנס מחיר למניה"
              />
            </div>
            <div className="form-group">
              <label className="form-label">שווי שוק (מיליון $)</label>
              <input 
                type="number" 
                className="form-input"
                value={marketCap}
                onChange={(e) => setMarketCap(e.target.value)}
                step="0.01"
                placeholder="יחושב אוטומטית"
              />
            </div>
            <div className="form-group">
              <label className="form-label">שנים לתחזית</label>
              <select 
                className="form-input"
                value={years}
                onChange={(e) => setYears(e.target.value)}
              >
                <option value="3">3 שנים</option>
                <option value="5">5 שנים</option>
                <option value="7">7 שנים</option>
                <option value="10">10 שנים</option>
              </select>
            </div>
          </div>
          <button className="btn btn-full" onClick={calculateManual}>חישוב</button>
        </div>
      ) : (
        <div style={{textAlign: 'center', padding: '50px'}}>
          <h3>נתונים מהשוק - בפיתוח</h3>
        </div>
      )}
      
      {showResults && (
        <div className="results" style={{display: 'block'}}>
          <h3 className="results-title">תוצאות החישוב</h3>
          <div className="results-grid">
            <div className="result-card">
              <div className="result-label">שווי שוק נוכחי</div>
              <div className="result-value">{results.marketCap} מיליון $</div>
            </div>
            <div className="result-card">
              <div className="result-label">מכפיל רווח (P/E)</div>
              <div className="result-value">{results.pe}</div>
            </div>
            <div className="result-card">
              <div className="result-label">מחיר יעד</div>
              <div className="result-value">${results.targetPrice}</div>
            </div>
            <div className="result-card">
              <div className="result-label">שווי הוגן</div>
              <div className="result-value">${results.fairValue}</div>
            </div>
            <div className="result-card">
              <div className="result-label">תשואה שנתית</div>
              <div className="result-value">{results.annualReturn}%</div>
            </div>
          </div>
          
          <div style={{background: 'rgba(255, 0, 0, 0.1)', border: '2px solid #ff4444', borderRadius: '10px', padding: '20px', marginTop: '20px', textAlign: 'center'}}>
            <div style={{fontSize: '1.2em', fontWeight: 800, color: '#ff4444', marginBottom: '10px'}}>⚠️ הערה חשובה ⚠️</div>
            <div style={{fontWeight: 700, color: '#ffffff', fontSize: '16px'}}>
              זהו כלי אקדמי לתרגול בלבד ואינו מהווה המלצה להשקעה.<br/>
              לפני כל השקעה יש להתייעץ עם יועץ השקעות מוסמך.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}