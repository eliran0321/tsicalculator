'use client';
import { useState, useEffect } from 'react';
import Button from '../UI/Button';
import { saveFormulas, loadFormulas } from '../../../lib/firestore';
import { DEFAULT_FORMULAS } from '../../../lib/calculations';
import { notify } from '../UI/Notification';

export default function FormulaEditor() {
  const [formulas, setFormulas] = useState(DEFAULT_FORMULAS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrentFormulas();
  }, []);

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

  const handleFormulaChange = (type, value) => {
    setFormulas(prev => ({ ...prev, [type]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const success = await saveFormulas(formulas);
      if (success) {
        notify('נוסחאות נשמרו בהצלחה!');
      } else {
        notify('שגיאה בשמירת הנוסחאות', 'error');
      }
    } catch (error) {
      notify('שגיאה בשמירת הנוסחאות', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('האם אתה בטוח שברצונך לאפס את הנוסחאות לברירת מחדל?')) {
      setFormulas(DEFAULT_FORMULAS);
      notify('נוסחאות אופסו לברירת מחדל');
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">עורך נוסחאות</h2>
      
      <div className="formula-editor">
        <h3 style={{ color: '#FFD700', marginBottom: '20px' }}>נוסחאות חישוב</h3>
        <p style={{ marginBottom: '20px', color: '#ccc' }}>
          ערוך את הנוסחאות שישפיעו על החישובים של התלמידים.<br/>
          משתנים זמינים: pe, eps, revenue, netIncome, growth, shares, currentPrice, marketCap
        </p>
        
        <div className="formula-item">
          <div className="formula-name">מחיר יעד:</div>
          <input 
            type="text" 
            className="formula-input" 
            value={formulas.target}
            onChange={(e) => handleFormulaChange('target', e.target.value)}
          />
        </div>
        
        <div className="formula-item">
          <div className="formula-name">שווי הוגן:</div>
          <input 
            type="text" 
            className="formula-input" 
            value={formulas.fair}
            onChange={(e) => handleFormulaChange('fair', e.target.value)}
          />
        </div>
        
        <div className="formula-item">
          <div className="formula-name">תשואה שנתית:</div>
          <input 
            type="text" 
            className="formula-input" 
            value={formulas.annual}
            onChange={(e) => handleFormulaChange('annual', e.target.value)}
          />
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Button onClick={handleSave} loading={loading} style={{ marginLeft: '10px' }}>
            שמור נוסחאות
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            אפס לברירת מחדל
          </Button>
        </div>
      </div>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '20px', 
        borderRadius: '10px', 
        marginTop: '20px' 
      }}>
        <h4 style={{ color: '#FFD700', marginBottom: '15px' }}>דוגמאות לנוסחאות:</h4>
        <ul style={{ color: '#ccc', lineHeight: 1.8 }}>
          <li><strong>חיבור:</strong> eps + 5</li>
          <li><strong>חיסור:</strong> pe - 2</li>
          <li><strong>כפל:</strong> currentPrice * 1.2</li>
          <li><strong>חילוק:</strong> revenue / shares</li>
          <li><strong>אחוזים:</strong> growth / 100</li>
          <li><strong>סוגריים:</strong> (eps + 2) * (pe - 1)</li>
        </ul>
      </div>
    </div>
  );
}