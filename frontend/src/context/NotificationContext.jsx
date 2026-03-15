import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [remindersEnabled, setRemindersEnabled] = useState(
    localStorage.getItem('remindersEnabled') === 'true'
  );

  const addNotification = (title, message, type = 'info') => {
    const id = Date.now();
    const newNotification = { id, title, message, type, time: new Date() };
    setNotifications(prev => [newNotification, ...prev].slice(0, 20));
    
    // Also show as browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
    
    return id;
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleReminders = () => {
    const newValue = !remindersEnabled;
    setRemindersEnabled(newValue);
    localStorage.setItem('remindersEnabled', newValue.toString());
    
    if (newValue && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      clearNotification, 
      remindersEnabled, 
      toggleReminders,
      showAddModal,
      setShowAddModal
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
