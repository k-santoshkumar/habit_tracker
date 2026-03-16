import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Plus, Settings, Activity, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function BottomNav() {
  const { user } = useAuth();
  const { setShowAddModal } = useNotifications();

  const links = [
    { to: '/', icon: <Home size={22} />, label: 'Home' },
    { to: '/activity', icon: <Activity size={22} />, label: 'Activity' },
    { to: '/habits', icon: <Plus size={24} />, label: 'Add', isAction: true },
    { to: '/goals', icon: <CheckSquare size={20} />, label: 'Goals' },
    { to: '/settings', icon: <Settings size={22} />, label: 'Settings' },
  ];

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 glass-nav border-t border-slate-100 dark:border-white/5 pb-safe animate-in slide-in-from-bottom duration-500">
        <div className="flex justify-around items-center h-20 px-2 max-w-lg mx-auto">
          {links.map((link) => (
            link.isAction ? (
              <button 
                key="add-btn"
                onClick={() => setShowAddModal(true)}
                className="flex flex-col items-center justify-center w-full h-full -translate-y-4 group"
              >
                <div className="p-4 bg-primary text-white rounded-[22px] shadow-active group-active:scale-90 transition-all duration-300">
                    <Plus size={28} />
                </div>
              </button>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all duration-300 ${
                    isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                  }`
                }
              >
                <div className="relative transition-transform duration-300 group-active:scale-90">
                  {link.icon}
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary transition-all duration-300 ${
                    window.location.pathname === link.to ? 'opacity-100' : 'opacity-0 scale-0'
                  }`} />
                </div>
                <span className="text-[10px] font-black tracking-tighter uppercase">{link.label}</span>
              </NavLink>
            )
          ))}
        </div>
    </nav>
  );
}
