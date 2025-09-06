'use client';
import { useState, useEffect } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';

export default function ManualCalc({ onCalculate }) {
  const [formData, setFormData] = useState({
    pe: '',
    eps: '',
    revenue: '',
    netIncome: '',
    growth: '',
    shares: '',
    currentPrice: '',
    marketCap: '',
    years: '5'
  });
  
  const [autoCalcFields, setAutoCalcFields] = useState(new Set());

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Remove auto-calc styling when user manually changes field
    setAutoCalcFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
  };

  // Auto calculate market data when shares or price change
  useEffect(() => {
    const shares = parseFloat(formData.shares) || 0;
    const currentPrice = parseFloat(formData.currentPrice) || 0;
    const marketCap = parseFloat(formData.marketCap) || 0;

    if (shares > 0 && currentPrice > 0) {
      // Calculate market cap
      const calculated = shares * currentPrice;
      if (Math.abs(calculated - marketCap) > 0.01) {
        setFormData(prev => ({ ...prev, marketCap: calculated.toFixed(2) }));
        setAutoCalcFields(prev => new Set(prev).add('marketCap'));
      }
    } else if (marketCap > 0 && shares > 0 && currentPrice === 0) {
      // Calculate price per share
      const calculated = marketCap / shares;
      setFormData(prev => ({ ...prev, currentPrice: calculated.toFixed(2) }));
      setAutoCalcFields(prev => new Set(prev).add('currentPrice'));
    } else if (marketCap > 0 && currentPrice > 0 && shares === 0) {
      // Calculate number of shares
      const calculated = marketCap / currentPrice;
      setFormData(prev => ({ ...prev, shares: calculated.toFixed(2) }));
      setAutoCalcFields(prev => new Set(prev).add('shares'));
    }
  }, [formData.shares, formData.currentPrice, formData.marketCap]);

  // Clear auto-calc styling after delay
  useEffect(() => {
    if (autoCalcFields.size > 0) {
      const timer = setTimeout(() => {
        setAutoCalcFields(new Set());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoCalcFields]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['pe', 'eps', 'revenue', 'netIncome', 'growth', 'shares', 'currentPrice'];
    const missingFields = requiredFields.filter(field => !formData[field] || isNaN(parseFloat(formData[field])));
    
    if (missingFields.length > 0) {
      alert('נא למלא את כל השדות בערכים תקינים');
      return;
    }

    // Convert to numbers
    const calculationData = {
      pe: parseFloat(formData.pe),
      eps: parseFloat(formData.eps),
      revenue: parseFloat(formData.revenue),
      netIncome: parseFloat(formData.netIncome),
      growth: parseFloat(formData.growth),
      shares: parseFloat(formData.shares),
      currentPrice: parseFloat(formData.currentPrice),
      marketCap: parseFloat(formData.marketCap) || (parseFloat(formData.shares) * parseFloat(formData.currentPrice)),
      years: parseInt(formData.years)
    };

    onCalculate(calculationData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <Input
            label="מכפיל רווח (P/E)"
            type="number"
            step="0.01"
            value={formData.pe}
            onChange={(e) => handleInputChange('pe', e.target.value)}
            placeholder="הכנס מכפיל רווח"
            required
          />
          
          <Input
            label="רווח למניה (EPS)"
            type="number"
            step="0.01"
            value={formData.eps}
            onChange={(e) => handleInputChange('eps', e.target.value)}
            placeholder="הכנס רווח למניה"
            required
          />
          
          <Input
            label="הכנסות (מיליון $)"
            type="number"
            step="0.01"
            value={formData.revenue}
            onChange={(e) => handleInputChange('revenue', e.target.value)}
            placeholder="הכנס הכנסות"
            required
          />
          
          <Input
            label="רווח נקי (מיליון $)"
            type="number"
            step="0.01"
            value={formData.netIncome}
            onChange={(e) => handleInputChange('netIncome', e.target.value)}
            placeholder="הכנס רווח נקי"
            required
          />
          
          <Input
            label="צמיחה שנתית (%)"
            type="number"
            step="0.1"
            value={formData.growth}
            onChange={(e) => handleInputChange('growth', e.target.value)}
            placeholder="הכנס צמיחה צפויה"
            required
          />
          
          <Input
            label="מספר מניות (מיליון)"
            type="number"
            step="0.01"
            value={formData.shares}
            onChange={(e) => handleInputChange('shares', e.target.value)}
            placeholder="הכנס מספר מניות"
            autoCalc={autoCalcFields.has('shares')}
            required
          />
          
          <Input
            label="מחיר למניה ($)"
            type="number"
            step="0.01"
            value={formData.currentPrice}
            onChange={(e) => handleInputChange('currentPrice', e.target.value)}
            placeholder="הכנס מחיר למניה"
            autoCalc={autoCalcFields.has('currentPrice')}
            required
          />
          
          <div className="form-group">
            <Input
              label="שווי שוק (מיליון $)"
              type="number"
              step="0.01"
              value={formData.marketCap}
              onChange={(e) => handleInputChange('marketCap', e.target.value)}
              placeholder="יחושב אוטומטית"
              autoCalc={autoCalcFields.has('marketCap')}
            />
            <small style={{ color: '#87CEEB', fontSize: '12px', display: 'block', marginTop: '5px' }}>
              יחושב אוטומטית: מניות × מחיר למניה
            </small>
          </div>
          
          <div className="form-group">
            <label className="form-label">שנים לתחזית</label>
            <select 
              className="form-input"
              value={formData.years}
              onChange={(e) => handleInputChange('years', e.target.value)}
            >
              <option value="3">3 שנים</option>
              <option value="5">5 שנים</option>
              <option value="7">7 שנים</option>
              <option value="10">10 שנים</option>
            </select>
          </div>
        </div>
        
        <Button type="submit" size="full">
          חישוב
        </Button>
      </form>
    </div>
  );
}