'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../components/UI/Button';
import Notification, { useNotification } from '../components/UI/Notification';
import UserManagement from '../components/Admin/UserManagement';
import FormulaEditor from '../components/Admin/FormulaEditor';

export default function AdminPage() {
  const [currentView, setCurrentView] = useState('users'); // 'users' or 'formulas'
  const [currentUser, setCurrentUser] = useState(null);
  
  const { notification, notify } = useNotification();
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const savedUser = sessionStorage.getItem('tsi_current_user');
    const userType = sessionStorage.getItem('tsi_user_type');
    
    if (!savedUser || userType !== 'admin') {
      router.push('/');
      return;
    }
    
    setCurrentUser(savedUser);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/');
    notify('יצאת מהמערכת');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (!currentUser) {
    return <div>טוען...</div>;
  }

  return (
    <div className="container">
      <Notification notification={notification} />

      {/* Header */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <Button variant="secondary" onClick={handleLogout} style={{ marginLeft: '10px' }}>
              יציאה
            </Button>
            <Button 
              onClick={() => setCurrentView('formulas')} 
              style={{ marginLeft: '10px' }}
              variant={currentView === 'formulas' ? 'primary' : 'secondary'}
            >
              עורך נוסחאות
            </Button>
            <Button 
              onClick={() => setCurrentView('users')}
              variant={currentView === 'users' ? 'primary' : 'secondary'}
            >
              ניהול משתמשים
            </Button>
          </div>
          <span style={{ fontWeight: 700, color: '#FFD700' }}>
            פאנל מנהל
          </span>
        </div>

        <h2 className="section-title">
          {currentView === 'users' ? 'ניהול משתמשים' : 'עורך נוסחאות'}
        </h2>
      </div>

      {/* Content */}
      {currentView === 'users' ? (
        <div className="section">
          <UserManagement />
        </div>
      ) : (
        <FormulaEditor />
      )}
    </div>
  );
}