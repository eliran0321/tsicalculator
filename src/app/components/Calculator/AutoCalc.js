'use client';
import { useState } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { fetchStockData, generateAutoEstimates } from '../../../lib/calculations';
import { notify } from '../UI/Notification';

export default function AutoCalc({ onCalculate }) {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetchStock = async () => {
    if (!symbol.trim()) {
      notify('נא להכניס סימול', 'error');
      return;
    }

    setLoading(true);
    setStockData(null);

    try {
      const data = await fetchStockData(symbol.trim().toUpperCase());
      setStockData(data);
      notify('נתונים אמיתיים נטענו בהצלחה!');
    } catch (error) {
      notify('לא ניתן לטעון נתונים אמיתיים מהשוק. בדוק את הסימול ונסה שוב.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStockValue = (field, currentValue) => {
    const newValue = prompt(`הכנס ערך חדש עבור ${field}:`, currentValue);
    if (newValue !== null && !isNaN(newValue) && newValue.trim() !== '') {
      setStockData(prev => ({
        ...prev,
        [field]: parseFloat(newValue)
      }));
      notify('הערך עודכן');
    }
  };

  const handleCalculate = () => {
    if (!stockData) {
      notify('נא למשוך נתונים תחילה', 'error');
      return;
    }

    const estimates = generateAutoEstimates(stockData);
    onCalculate(estimates, stockData.symbol);
  };

  return (
    <div>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Input
          label="סימול מניה"
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="AAPL, MSFT, GOOGL..."
        />
        
        <Button 
          variant="success" 
          size="full" 
          onClick={handleFetchStock}
          loading={loading}
        >
          משוך נתונים מהשוק
        </Button>
      </div>

      {stockData && (
        <div className="stock-data">
          <h3 style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 800, fontSize: '1.5em' }}>
            {stockData.name} ({stockData.symbol})
          </h3>
          
          <div className="stock-grid">
            <div 
              className="stock-item editable-stock" 
              onClick={() => handleEditStockValue('price', stockData.price)}
            >
              <div className="stock-price">${stockData.price.toFixed(2)}</div>
              <div className="stock-label">מחיר נוכחי</div>
              <div className="edit-hint">לחץ לעריכה</div>
            </div>
            
            <div 
              className="stock-item" 
              style={{ 
                background: stockData.change >= 0 ? '#28a745' : '#dc3545' 
              }}
            >
              <div className="stock-price">
                {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)}%
              </div>
              <div className="stock-label">שינוי יומי</div>
            </div>
            
            <div className="stock-item" style={{ background: '#6f42c1', color: 'white' }}>
              <div className="stock-price">{stockData.type === 'CS' ? 'מניה' : 'ETF'}</div>
              <div className="stock-label">סוג</div>
            </div>
            
            <div className="stock-item" style={{ background: '#ffc107', color: '#333' }}>
              <div className="stock-price">{stockData.volume.toLocaleString()}</div>
              <div className="stock-label">נפח</div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button onClick={handleCalculate} size="full">
              חישוב תחזית
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}