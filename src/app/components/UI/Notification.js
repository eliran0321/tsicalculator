'use client';
import { useState, useEffect } from 'react';

let notificationFunction = null;

export function useNotification() {
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const notify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    notificationFunction = notify;
    return () => {
      notificationFunction = null;
    };
  }, []);

  return { notification, notify };
}

// Global notification function
export const notify = (message, type = 'success') => {
  if (notificationFunction) {
    notificationFunction(message, type);
  }
};

export default function Notification({ notification }) {
  if (!notification.show) return null;

  return (
    <div className={`notification ${notification.type} show`}>
      {notification.message}
    </div>
  );
}