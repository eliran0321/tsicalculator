'use client';
import { useState } from 'react';

export default function ResultsDisplay({ results, projections, symbol }) {
  const [editableResults, setEditableResults] = useState(results);

  const handleEditResult = (field, currentValue) => {
    const newValue = prompt('הכנס ערך חדש:', currentValue);
    if (newValue !== null && newValue.trim() !== '') {
      setEditableResults(prev => ({
        ...prev,
        [field]: newValue.trim()
      }));
    }
  };

  // Calculate investment scale position
  const calculateInvestmentPosition = (annualReturn, expectedReturn = 10) => {
    let position = 0;
    
    if (annualReturn <= 0) {
      position = 16.67;
    } else if (annualReturn < expectedReturn * 0.8) {
      position = 16.67;
    } else if (annualReturn < expectedReturn * 1.2) {
      position = 50;
    } else if (annualReturn < expectedReturn * 2) {
      position = 66.67;
    } else {
      position = 83.33;
    }
    
    return position;
  };

  const investmentPosition = calculateInvestmentPosition(parseFloat(editableResults.annualReturn));

  return (
    <div className="results">
      <h3 className="results-title">תוצאות החישוב</h3>
      
      <div className="results-grid">
        <div className="result-card">
          <div className="result-label">שווי שוק נוכחי</div>
          <div 
            className="result-value editable" 
            onClick={() => handleEditResult('marketCap', editableResults.marketCap)}
          >
            {editableResults.marketCap}
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">מכפיל רווח (P/E)</div>
          <div 
            className="result-value editable" 
            onClick={() => handleEditResult('pe', editableResults.pe)}
          >
            {editableResults.pe}
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">מחיר יעד</div>
          <div 
            className="result-value editable" 
            onClick={() => handleEditResult('targetPrice', editableResults.targetPrice)}
          >
            {editableResults.targetPrice}
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">שווי הוגן</div>
          <div 
            className="result-value editable" 
            onClick={() => handleEditResult('fairValue', editableResults.fairValue)}
          >
            {editableResults.fairValue}
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">תשואה שנתית</div>
          <div 
            className="result-value editable" 
            onClick={() => handleEditResult('annualReturn', editableResults.annualReturn)}
          >
            {editableResults.annualReturn}
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">האם שווה השקעה?</div>
          <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '12px', fontWeight: 700, color: '#ff4444' }}>
            אין במידע זה המלצה להשקעה
          </div>
          <div className="investment-scale">
            <div className="scale-labels">
              <span style={{ color: '#000' }}>לא</span>
              <span style={{ color: '#000' }}>נטרלי</span>
              <span style={{ color: '#000' }}>כן</span>
            </div>
            <div className="scale-bar">
              <div className="scale-sections">
                <div className="section-color no"></div>
                <div className="section-color neutral"></div>
                <div className="section-color yes"></div>
              </div>
              <div 
                className="scale-indicator" 
                style={{ left: `calc(${investmentPosition}% - 10px)` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {projections && (
        <ProjectionsTable projections={projections} symbol={symbol} />
      )}

      {/* הערה חשובה */}
      <div style={{ 
        background: 'rgba(255, 0, 0, 0.1)', 
        border: '2px solid #ff4444', 
        borderRadius: '10px', 
        padding: '20px', 
        marginTop: '20px', 
        textAlign: 'center' 
      }}>
        <div style={{ fontSize: '1.2em', fontWeight: 800, color: '#ff4444', marginBottom: '10px' }}>
          ⚠️ הערה חשובה ⚠️
        </div>
        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '16px' }}>
          זהו כלי אקדמי לתרגול בלבד ואינו מהווה המלצה להשקעה.<br/>
          לפני כל השקעה יש להתייעץ עם יועץ השקעות מוסמך.
        </div>
      </div>
    </div>
  );
}

function ProjectionsTable({ projections, symbol }) {
  return (
    <div>
      {symbol && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '8px', 
          fontSize: '14px', 
          textAlign: 'center' 
        }}>
          <strong>הערה:</strong> החישוב מבוסס על נתונים אמיתיים עבור {symbol} עם אמידות לנתונים חסרים.
        </div>
      )}
      
      <table className="table">
        <thead>
          <tr>
            <th>שנה</th>
            <th>EPS ($)</th>
            <th>P/E יעד</th>
            <th>הכנסות (מיליון $)</th>
            <th>רווח נקי (מיליון $)</th>
            <th>שווי הוגן ($)</th>
            <th>CAGR (%)</th>
          </tr>
        </thead>
        <tbody>
          {projections.map((projection, index) => {
            const isLast = index === projections.length - 1;
            const isCurrent = index === 0;
            const style = isLast 
              ? { background: 'rgba(255, 215, 0, 0.2)', fontWeight: 800 }
              : isCurrent 
              ? { background: 'rgba(173, 216, 230, 0.2)' }
              : {};

            return (
              <tr key={projection.year} style={style}>
                <td style={{ fontWeight: 800 }}>
                  {projection.year}{isCurrent ? ' (נוכחי)' : ''}
                </td>
                <td>${projection.eps.toFixed(2)}</td>
                <td>{projection.pe.toFixed(2)}</td>
                <td>${projection.revenue.toFixed(2)}</td>
                <td>${projection.netIncome.toFixed(2)}</td>
                <td style={{ fontWeight: 800 }}>${projection.fair.toFixed(2)}</td>
                <td style={{ 
                  color: projection.cagr !== null && projection.cagr > 0 ? '#28a745' : '#666',
                  fontWeight: 700 
                }}>
                  {projection.cagr !== null ? (projection.cagr * 100).toFixed(1) + '%' : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '8px', 
        fontSize: '14px' 
      }}>
        <strong>הסבר:</strong><br/>
        • P/E יעד - המכפיל שהגדרת<br/>
        • שווי הוגן - מבוסס על P/E היעד שלך<br/>
        • צמיחה גבוהה יכולה להצדיק P/E גבוה יותר<br/><br/>
        <div style={{ color: '#ff4444', fontWeight: 800, textAlign: 'center' }}>
          אין במידע זה המלצה להשקעה
        </div>
      </div>
    </div>
  );
}