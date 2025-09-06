'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { getUser } from '../../../lib/firestore';
import { notify } from '../UI/Notification';

export default function LoginForm({ onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.username || !formData.password) {
      setError('נא למלא שם משתמש וסיסמה');
      setLoading(false);
      return;
    }

    try {
      const userData = await getUser(formData.username.trim());
      
      if (userData && userData.password === formData.password) {
        if (userData.status === 'pending') {
          setError('החשבון ממתין לאישור');
          setLoading(false);
          return;
        }
        if (userData.status === 'rejected' || userData.status === 'blocked') {
          setError('החשבון לא פעיל');
          setLoading(false);
          return;
        }
        
        // Save user session
        sessionStorage.setItem('tsi_current_user', formData.username);
        sessionStorage.setItem('tsi_user_type', 'user');
        sessionStorage.setItem('tsi_user_data', JSON.stringify(userData));
        
        notify(`ברוך הבא ${formData.username}!`);
        router.push('/dashboard');
      } else {
        setError('שם משתמש או סיסמה שגויים');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('שגיאה בחיבור למערכת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">כניסה למערכת</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
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
          required
        />
        
        <Button type="submit" size="full" loading={loading}>
          כניסה
        </Button>
        
        {error && <div className="error-msg">{error}</div>}
        
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#ccc', fontSize: '14px' }}>
          אין לך חשבון?{' '}
          <button 
            type="button"
            onClick={onSwitchToRegister}
            style={{ 
              color: '#FFD700', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 700,
              textDecoration: 'underline'
            }}
          >
            לחץ להרשמה
          </button>
        </p>
      </form>
    </div>
  );
}