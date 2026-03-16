import React from 'react';
import { useNotifications } from './NotificationContext';
import { X, CheckSquare, Activity, Pill, Coffee, Target, Camera, Moon, Smile, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function GlobalAddModal() {
  const { showAddModal, setShowAddModal } = useNotifications();
  const navigate = useNavigate();

  if (!showAddModal) return null;

  const items = [
    { label: 'Habit', icon: <CheckSquare size={20} />, to: '/habits', color: 'bg-green-100 text-green-600' },
    { label: 'Activity', icon: <Activity size={20} />, to: '/activity', color: 'bg-blue-100 text-blue-600' },
    { label: 'Tablet', icon: <Pill size={20} />, to: '/tablets', color: 'bg-purple-100 text-purple-600' },
    { label: 'Diet', icon: <Coffee size={20} />, to: '/diet', color: 'bg-orange-100 text-orange-600' },
    { label: 'Pomodoro', icon: <Timer size={20} />, to: '/pomodoro', color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Goal', icon: <Target size={20} />, to: '/goals', color: 'bg-red-100 text-red-600' },
  ];

  const handleSelect = (to) => {
    setShowAddModal(false);
    navigate(to);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}>
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[40px] p-8 pb-12 space-y-8 animate-in slide-in-from-bottom duration-500 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black">Create New</h3>
          <button onClick={() => setShowAddModal(false)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {items.map((item) => (
            <button key={item.label} onClick={() => handleSelect(item.to)} className="flex flex-col items-center gap-3 group">
              <div className={`p-5 rounded-3xl transition-all duration-300 group-active:scale-90 ${item.color}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
