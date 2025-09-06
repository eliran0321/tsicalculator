'use client';
import { useState } from 'react';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import AdminLogin from './components/Auth/AdminLogin';
import Notification, { useNotification } from './components/UI/Notification';

export default function HomePage() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'admin'
  const { notification, notify } = useNotification();

  return (
    <div className="container">
      <Notification notification={notification} />
      
      {/* Header */}
      <div className="header">
        <div className="nav-buttons">
          <button 
            className="nav-btn" 
            onClick={() => setCurrentView('admin')}
          >
            מנהל
          </button>
          <button 
            className="nav-btn" 
            onClick={() => setCurrentView('login')}
          >
            תלמידים
          </button>
        </div>
        <div className="logo">TSI</div>
        <div className="subtitle">מחשבון הערכת שווי מתקדם</div>
      </div>

      {/* Content */}
      {currentView === 'login' && (
        <LoginForm onSwitchToRegister={() => setCurrentView('register')} />
      )}
      
      {currentView === 'register' && (
        <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />
      )}
      
      {currentView === 'admin' && (
        <AdminLogin onBackToMain={() => setCurrentView('login')} />
      )}
    </div>
  );
}