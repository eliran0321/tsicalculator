'use client';
import { useState, useEffect } from 'react';
import Button from '../UI/Button';
import { getAllUsers, updateUserStatus, deleteUser, USER_STATUS } from '../../../lib/firestore';
import { notify } from '../UI/Notification';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    today: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
      calculateStats(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      notify('שגיאה בטעינת נתוני המשתמשים', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: usersData.length,
      pending: 0,
      approved: 0,
      today: 0
    };

    usersData.forEach(user => {
      if (user.status === USER_STATUS.PENDING) stats.pending++;
      if (user.status === USER_STATUS.APPROVED) stats.approved++;

      if (user.createdAt && user.createdAt.toDate) {
        const userDate = user.createdAt.toDate();
        userDate.setHours(0, 0, 0, 0);
        if (userDate.getTime() === today.getTime()) {
          stats.today++;
        }
      }
    });

    setStats(stats);
  };

  const handleStatusChange = async (username, newStatus) => {
    const success = await updateUserStatus(username, newStatus);
    if (success) {
      setUsers(prev => prev.map(user => 
        user.id === username ? { ...user, status: newStatus } : user
      ));
      calculateStats(users.map(user => 
        user.id === username ? { ...user, status: newStatus } : user
      ));
      
      const statusTexts = {
        [USER_STATUS.APPROVED]: 'אושר',
        [USER_STATUS.REJECTED]: 'נדחה',
        [USER_STATUS.BLOCKED]: 'נחסם'
      };
      notify(`המשתמש ${username} ${statusTexts[newStatus]}`);
    } else {
      notify('שגיאה בעדכון סטטוס המשתמש', 'error');
    }
  };

  const handleDeleteUser = async (username) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את ${username}?`)) {
      const success = await deleteUser(username);
      if (success) {
        setUsers(prev => prev.filter(user => user.id !== username));
        calculateStats(users.filter(user => user.id !== username));
        notify(`המשתמש ${username} נמחק`, 'error');
      } else {
        notify('שגיאה במחיקת המשתמש', 'error');
      }
    }
  };

  const getStatusText = (status) => {
    const statusTexts = {
      [USER_STATUS.PENDING]: 'ממתין',
      [USER_STATUS.APPROVED]: 'מאושר',
      [USER_STATUS.REJECTED]: 'נדחה',
      [USER_STATUS.BLOCKED]: 'חסום'
    };
    return statusTexts[status] || status;
  };

  const formatDate = (createdAt) => {
    if (!createdAt || !createdAt.toDate) return 'לא זמין';
    return createdAt.toDate().toLocaleDateString('he-IL');
  };

  return (
    <div>
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">סה"כ משתמשים</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(45deg, #ffc107, #e0a800)' }}>
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">ממתינים</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(45deg, #28a745, #20c997)' }}>
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">מאושרים</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(45deg, #dc3545, #c82333)' }}>
          <div className="stat-number">{stats.today}</div>
          <div className="stat-label">היום</div>
        </div>
      </div>

      {/* Refresh Button */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Button onClick={loadUsers} loading={loading}>
          רענון
        </Button>
      </div>

      {/* Users Table */}
      <table className="table">
        <thead>
          <tr>
            <th>שם</th>
            <th>משתמש</th>
            <th>אימייל</th>
            <th>טלפון</th>
            <th>סטטוס</th>
            <th>תאריך</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>טוען נתונים...</td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>אין משתמשים רשומים</td>
            </tr>
          ) : (
            users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.username || user.id}</td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <span className={`status-${user.status}`}>
                    {getStatusText(user.status)}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  {user.status === USER_STATUS.PENDING && (
                    <>
                      <Button 
                        variant="success" 
                        size="small" 
                        onClick={() => handleStatusChange(user.id, USER_STATUS.APPROVED)}
                      >
                        אשר
                      </Button>
                      <Button 
                        variant="danger" 
                        size="small" 
                        onClick={() => handleStatusChange(user.id, USER_STATUS.REJECTED)}
                      >
                        דחה
                      </Button>
                    </>
                  )}
                  {user.status === USER_STATUS.APPROVED && (
                    <Button 
                      variant="warning" 
                      size="small" 
                      onClick={() => handleStatusChange(user.id, USER_STATUS.BLOCKED)}
                    >
                      חסום
                    </Button>
                  )}
                  {user.status === USER_STATUS.BLOCKED && (
                    <Button 
                      variant="success" 
                      size="small" 
                      onClick={() => handleStatusChange(user.id, USER_STATUS.APPROVED)}
                    >
                      בטל חסימה
                    </Button>
                  )}
                  <Button 
                    variant="danger" 
                    size="small" 
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    מחק
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}