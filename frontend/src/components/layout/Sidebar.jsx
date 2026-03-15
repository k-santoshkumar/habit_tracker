import { NavLink } from 'react-router-dom';
import { Home, Pill, Coffee, BookOpen, Activity, Heart, Lightbulb, Settings as SettingsIcon, Moon, Smile, CheckSquare, Target, Timer, CalendarCheck, Camera, LogOut, Layout } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

export default function Sidebar() {
  const links = [
    { to: '/', icon: <Layout size={18} />, label: 'Dashboard' },
    { to: '/activity', icon: <Activity size={18} />, label: 'Activity' },
    { to: '/habits', icon: <CheckSquare size={18} />, label: 'Habits' },
    { to: '/goals', icon: <Target size={18} />, label: 'Goals' },
    { to: '/pomodoro', icon: <Timer size={18} />, label: 'Pomodoro' },
    { to: '/diet', icon: <Coffee size={18} />, label: 'Diet & Water' },
    { to: '/tablets', icon: <Pill size={18} />, label: 'Tablets' },
    { to: '/health', icon: <Heart size={18} />, label: 'Health' },
    { to: '/sleep', icon: <Moon size={18} />, label: 'Sleep' },
    { to: '/mood', icon: <Smile size={18} />, label: 'Mood' },
    { to: '/photos', icon: <Camera size={18} />, label: 'Journal' },
    { to: '/insights', icon: <Lightbulb size={18} />, label: 'Insights' },
    { to: '/settings', icon: <SettingsIcon size={18} />, label: 'Settings' },
  ];

  const { user, logout } = useAuth();

  return (
    <aside className="h-full border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-y-auto">
      <div className="p-8">
        <h1 className="font-black text-2xl tracking-tighter text-primary">HabitFlow</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-5 py-3 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary text-white shadow-active font-bold' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`
            }
          >
            {link.icon}
            <span className="text-sm">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="min-w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-black text-sm">
                {user.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-slate-800 dark:text-slate-100">{user.full_name || 'User'}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate tracking-tight">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all active:scale-95"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}
