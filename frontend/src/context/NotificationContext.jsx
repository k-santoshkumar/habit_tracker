import React, { createContext, useState, useEffect, useCallback } from 'react';
import { requestNotificationAccess, syncTabletReminders } from '../lib/notifications';
import { getTablets } from '../api/tablets';

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
    return id;
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleReminders = async () => {
    const newValue = !remindersEnabled;
    if (newValue) {
      const granted = await requestNotificationAccess();
      if (!granted) {
        return false;
      }
    }

    setRemindersEnabled(newValue);
    localStorage.setItem('remindersEnabled', newValue.toString());
    return newValue;
  };

  const syncReminders = useCallback(async (tablets = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    let tabletList = tablets;
    if (!tabletList) {
      try {
        const response = await getTablets();
        tabletList = response.data.success ? response.data.data : [];
      } catch (error) {
        console.error('Failed to load tablets for reminder sync', error);
        return;
      }
    }

    try {
      await syncTabletReminders(tabletList, remindersEnabled);
    } catch (error) {
      console.error('Failed to sync reminders', error);
    }
  }, [remindersEnabled]);

  useEffect(() => {
    void syncReminders();
  }, [syncReminders]);

  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      clearNotification, 
      remindersEnabled, 
      toggleReminders,
      syncReminders,
      showAddModal,
      setShowAddModal
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export { NotificationContext };
