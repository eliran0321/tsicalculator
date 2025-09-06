'use client';
import { useState } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { saveUser, getUser } from '../../../lib/firestore';
import { notify } from '../UI/Notification';

export default function RegisterForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.username || !formData.password) {
      setError('נא למלא את כל השדות החובה');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('כתובת אימייל לא תקינה');
      setLoading(false);
      return;
    }

    try {
      // Check if user exists
      const existingUser = await getUser(formData.username.trim());
      if (existingUser) {
        setError('שם המשתמש כבר קיים');
        setLoading(false);
        return;
      }

      // Create user
      const userDetails = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        username: formData.username.trim()
      };

      const success = await saveUser(formData.username.trim(), formData.password, userDetails);

      if (success) {
        setSuccess('נרשמת בהצלחה! ממתין לאישור מנהל.');
        notify('הרשמה הושלמה בהצלחה!');
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          phone: '',
          username: '',
          password: ''
        });

        // Switch to login after 3 seconds
        setTimeout(() => {
          onSwitchToLogin();
        }, 3000);
      } else {
        setError('שגיאה בהרשמה, נסה שוב');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('שגיאה בחיבור למערכת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">הרשמה חדשה</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <Input
            label="שם מלא"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
          
          <Input
            label="אימייל"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
          
          <Input
            label="טלפון"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="אופציונלי"
          />
          
          <Input
            label="שם משתמש"
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            required
          />
          
          <Input
            label="סיסמה"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="לפחות 6 תווים"
            required
          />
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <Button type="submit" loading={loading} style={{ marginLeft: '10px' }}>
            הירשם
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onSwitchToLogin}
          >
            חזרה לכניסה
          </Button>
        </div>
        
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
      </form>
    </div>
  );
}