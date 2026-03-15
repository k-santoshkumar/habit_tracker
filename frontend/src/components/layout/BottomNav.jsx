import { NavLink } from 'react-router-dom';
import { Home, Smile, CheckSquare, Timer, MoreHorizontal, Camera } from 'lucide-react';
import { useState } from 'react';
import { Moon, Pill, Coffee, BookOpen, Activity, Heart, Target, CalendarCheck, Lightbulb, Settings as SettingsIcon } from 'lucide-react';

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false);

  const primaryLinks = [
    { to: '/', icon: <Home size={20} />, label: 'Home' },
    { to: '/habits', icon: <CheckSquare size={20} />, label: 'Habits' },
    { to: '/mood', icon: <Smile size={20} />, label: 'Mood' },
    { to: '/pomodoro', icon: <Timer size={20} />, label: 'Focus' },
  ];

  const moreLinks = [
    { to: '/tablets', icon: <Pill size={18} />, label: 'Tablets' },
    { to: '/diet', icon: <Coffee size={18} />, label: 'Diet' },
    { to: '/study', icon: <BookOpen size={18} />, label: 'Study' },
    { to: '/activity', icon: <Activity size={18} />, label: 'Activity' },
    { to: '/health', icon: <Heart size={18} />, label: 'Health' },
    { to: '/sleep', icon: <Moon size={18} />, label: 'Sleep' },
    { to: '/photos', icon: <Camera size={18} />, label: 'Photos' },
    { to: '/goals', icon: <Target size={18} />, label: 'Goals' },
    { to: '/weekly', icon: <CalendarCheck size={18} />, label: 'Review' },
    { to: '/insights', icon: <Lightbulb size={18} />, label: 'Insights' },
    { to: '/settings', icon: <SettingsIcon size={18} />, label: 'Settings' },
  ];

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-16 left-0 right-0 bg-[var(--card-bg)] border-t border-[var(--border-color)] shadow-xl rounded-t-2xl p-4 animate-in slide-in-from-bottom duration-200" onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-5 gap-3">
              {moreLinks.map(link => (
                <NavLink key={link.to} to={link.to} onClick={() => setShowMore(false)}
                  className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive ? 'text-primary-light bg-primary-light/10' : 'text-slate-500'}`}
                >
                  {link.icon}
                  <span className="text-[9px]">{link.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav className="border-t border-[var(--border-color)] bg-[var(--card-bg)] pb-safe">
        <div className="flex justify-around items-center h-16">
          {primaryLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive 
                    ? 'text-primary-light dark:text-primary-dark' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {link.icon}
              <span className="text-[10px]">{link.label}</span>
            </NavLink>
          ))}
          <button onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${showMore ? 'text-primary-light' : 'text-slate-500'}`}
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
