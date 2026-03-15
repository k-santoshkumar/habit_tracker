import { NavLink } from 'react-router-dom';
import { Home, Pill, Coffee, BookOpen, Activity, Heart, Lightbulb, Settings as SettingsIcon, Moon, Smile, CheckSquare, Target, Timer, CalendarCheck, Camera, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const links = [
    { to: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/tablets', icon: <Pill size={20} />, label: 'Tablets' },
    { to: '/diet', icon: <Coffee size={20} />, label: 'Diet & Water' },
    { to: '/study', icon: <BookOpen size={20} />, label: 'Study' },
    { to: '/pomodoro', icon: <Timer size={20} />, label: 'Pomodoro' },
    { to: '/activity', icon: <Activity size={20} />, label: 'Activity' },
    { to: '/health', icon: <Heart size={20} />, label: 'Health' },
    { to: '/sleep', icon: <Moon size={20} />, label: 'Sleep' },
    { to: '/mood', icon: <Smile size={20} />, label: 'Mood' },
    { to: '/photos', icon: <Camera size={20} />, label: 'Photo Journal' },
    { to: '/habits', icon: <CheckSquare size={20} />, label: 'Habits' },
    { to: '/goals', icon: <Target size={20} />, label: 'Goals' },
    { to: '/weekly', icon: <CalendarCheck size={20} />, label: 'Weekly Review' },
    { to: '/insights', icon: <Lightbulb size={20} />, label: 'Insights' },
    { to: '/settings', icon: <SettingsIcon size={20} />, label: 'Settings' },
  ];

  const { user, logout } = useAuth();

  return (
    <aside className="h-full border-r border-[var(--border-color)] bg-[var(--card-bg)] flex flex-col overflow-y-auto">
      <div className="p-6">
        <h1 className="font-bold text-xl text-primary-light dark:text-primary-dark">LifeTracker</h1>
      </div>
      <nav className="flex-1 px-4 space-y-0.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                isActive 
                  ? 'bg-primary-light/10 text-primary-light dark:text-primary-dark font-medium' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="p-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-light/20 flex items-center justify-center text-primary-light font-bold text-xs">
              {user.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">{user.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}
