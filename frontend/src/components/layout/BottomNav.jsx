import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Plus, Settings, MoreHorizontal, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { Moon, Pill, Coffee, BookOpen, Activity, Heart, Target, CalendarCheck, Lightbulb, Camera, Smile, Timer, CheckSquare } from 'lucide-react';

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const { logout } = useAuth();

  const primaryLinks = [
    { to: '/', icon: <Home size={22} />, label: 'Home' },
    { to: '/activity', icon: <Activity size={22} />, label: 'Activity' },
    { to: '/habits', icon: <CheckSquare size={22} />, label: 'Habits' },
    { to: '/settings', icon: <Settings size={22} />, label: 'Settings' },
  ];

  const moreLinks = [
    { to: '/diet', icon: <Coffee size={18} />, label: 'Diet' },
    { to: '/study', icon: <BookOpen size={18} />, label: 'Study' },
    { to: '/study', icon: <BookOpen size={18} />, label: 'Study' },
    { to: '/health', icon: <Heart size={18} />, label: 'Health' },
    { to: '/sleep', icon: <Moon size={18} />, label: 'Sleep' },
    { to: '/mood', icon: <Smile size={18} />, label: 'Mood' },
    { to: '/pomodoro', icon: <Timer size={18} />, label: 'Focus' },
    { to: '/photos', icon: <Camera size={18} />, label: 'Photos' },
    { to: '/goals', icon: <Target size={18} />, label: 'Goals' },
    { to: '/weekly', icon: <CalendarCheck size={18} />, label: 'Review' },
    { to: '/insights', icon: <Lightbulb size={18} />, label: 'Insights' },
  ];

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-300" onClick={() => setShowMore(false)}>
          <div className="absolute inset-x-0 bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[40px] shadow-2xl p-8 pt-4 pb-24 shadow-black/10 animate-in slide-in-from-bottom-20 duration-500" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8"></div>
            <div className="grid grid-cols-4 gap-y-8 gap-x-4">
              {moreLinks.map(link => (
                <NavLink key={link.to} to={link.to} onClick={() => setShowMore(false)}
                  className={({ isActive }) => `flex flex-col items-center gap-2 transition-all active:scale-95 ${isActive ? 'text-primary' : 'text-slate-400'}`}
                >
                  <div className="p-4 rounded-2xl transition-all bg-slate-50 dark:bg-slate-800">
                    {link.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{link.label}</span>
                </NavLink>
              ))}
              <button 
                onClick={() => { setShowMore(false); logout(); }}
                className="flex flex-col items-center gap-2 text-red-500 active:scale-95 transition-all"
              >
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20">
                    <LogOut size={18} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glass Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 z-50 glass-nav border-t border-slate-100 dark:border-white/5 pb-safe">
        <div className="flex justify-around items-center h-20 px-4">
          {primaryLinks.slice(0, 3).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
                  isActive ? 'text-primary' : 'text-slate-400'
                }`
              }
            >
              <div className="relative">
                {link.icon}
              </div>
              <span className="text-[10px] font-bold tracking-tight">{link.label}</span>
            </NavLink>
          ))}

          {/* Special Toggle Button */}
          <button onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-500 ${showMore ? 'text-primary' : 'text-slate-400'}`}
          >
            <div className={`p-3 rounded-2xl transition-all duration-500 ${showMore ? 'bg-primary rotate-45 text-white shadow-active' : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                {showMore ? <X size={24} /> : <LayoutGrid size={24} />}
            </div>
          </button>

          {primaryLinks.slice(3).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
                  isActive ? 'text-primary' : 'text-slate-400'
                }`
              }
            >
              <div className="relative">
                {link.icon}
              </div>
              <span className="text-[10px] font-bold tracking-tight">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
