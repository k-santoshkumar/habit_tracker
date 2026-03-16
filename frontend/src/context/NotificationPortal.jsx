import React, { useEffect, useState } from 'react';
import { useNotifications } from './NotificationContext';
import { X, Bell, Info, AlertTriangle, CheckCircle, Info as InfoIcon } from 'lucide-react';

export function NotificationPortal() {
  const { notifications, clearNotification } = useNotifications();

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-[320px] pointer-events-none">
      {notifications.map((n) => (
        <Toast key={n.id} n={n} onClear={() => clearNotification(n.id)} />
      ))}
    </div>
  );
}

function Toast({ n, onClear }) {
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRemoved(true);
      setTimeout(onClear, 500);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const icons = {
    info: <InfoIcon className="text-blue-500" size={18} />,
    success: <CheckCircle className="text-green-500" size={18} />,
    warning: <AlertTriangle className="text-orange-500" size={18} />,
    error: <AlertTriangle className="text-red-500" size={18} />,
  };

  return (
    <div 
      className={`pointer-events-auto bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-2xl rounded-2xl p-4 flex gap-4 items-start transition-all duration-500 ${
        removed ? 'opacity-0 translate-x-12' : 'animate-in slide-in-from-right-12'
      }`}
    >
      <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
        {icons[n.type] || icons.info}
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-black text-slate-800 dark:text-slate-100">{n.title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{n.message}</p>
      </div>
      <button onClick={() => { setRemoved(true); setTimeout(onClear, 500); }} className="text-slate-300 hover:text-slate-500">
        <X size={16} />
      </button>
    </div>
  );
}
