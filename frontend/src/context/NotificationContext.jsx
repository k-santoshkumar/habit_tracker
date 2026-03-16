import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { requestNotificationAccess, getNotificationPermissionStatus, openNotificationSettings, syncTabletReminders } from '../utils/notifications';
import { getTablets } from '../api/tablets';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [remindersEnabled, setRemindersEnabled] = useState(
    localStorage.getItem('remindersEnabled') === 'true'
  );
  const [notificationStatus, setNotificationStatus] = useState('unknown');
  const [exactAlarmStatus, setExactAlarmStatus] = useState('unknown');

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
        addNotification('Notification permission required', 'Please allow notifications to use reminders.', 'error');
        return false;
      }
    }

    setRemindersEnabled(newValue);
    localStorage.setItem('remindersEnabled', newValue.toString());

    await refreshNotificationStatus();
    return newValue;
  };

  const openSettings = async () => {
    const opened = await openNotificationSettings();
    if (!opened) {
      addNotification('Open settings failed', 'Please open your device settings manually and enable notifications.', 'error');
    }
    return opened;
  };

  const refreshNotificationStatus = useCallback(async () => {
    try {
      const status = await getNotificationPermissionStatus();
      setNotificationStatus(status.status);
      setExactAlarmStatus(status.exact);
    } catch (error) {
      console.error('Failed to read notification status', error);
      setNotificationStatus('unknown');
      setExactAlarmStatus('unknown');
    }
  }, []);

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
    void refreshNotificationStatus();
  }, [refreshNotificationStatus]);

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
      notificationStatus,
      exactAlarmStatus,
      refreshNotificationStatus,
      openSettings,
      showAddModal,
      setShowAddModal
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export { NotificationContext };
