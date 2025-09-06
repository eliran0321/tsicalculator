'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { notify } from '../UI/Notification';

const ADMIN_PASSWORD = 'tsi_admin2024';

export default function AdminLogin({ onBackToMain }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password === ADMIN_PASSWORD) {
      // Save admin session
      sessionStorage.setItem('tsi_current_user', 'admin');
      sessionStorage.setItem('tsi_user_type', 'admin');
      
      notify('כניסת מנהל מוצלחת');
      router.push('/admin');
    } else {
      setError('סיסמת מנהל שגויה');
    }
    
    setLoading(false);
  };

  return (
    <div className="section">
      <h2 className="section-title">כניסת מנהל</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Input
          label="סיסמת מנהל"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="הכנס סיסמת מנהל"
          required
        />
        
        <Button type="submit" size="full" loading={loading}>
          כניסה
        </Button>
        
        {error && <div className="error-msg">{error}</div>}
        
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#ccc', fontSize: '14px' }}>
          <button 
            type="button"
            onClick={onBackToMain}
            style={{ 
              color: '#FFD700', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 700,
              textDecoration: 'underline'
            }}
          >
            חזרה לעמוד הראשי
          </button>
        </p>
      </form>
    </div>
  );
}