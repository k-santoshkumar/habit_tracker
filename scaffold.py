import os

dirs = [
    "frontend/src/api",
    "frontend/src/context",
    "frontend/src/hooks",
    "frontend/src/components/layout",
    "frontend/src/components/ui",
    "frontend/src/components/domain",
    "frontend/src/pages"
]

for d in dirs:
    os.makedirs(d, exist_ok=True)

files = {
    "frontend/src/main.jsx": """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
""",
    "frontend/src/App.jsx": """import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Tablets from './pages/Tablets'
import Diet from './pages/Diet'
import Study from './pages/Study'
import Activity from './pages/Activity'
import Health from './pages/Health'
import Insights from './pages/Insights'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'

function App() {
  const isMobile = window.innerWidth <= 768; // Simple check for now
  
  return (
    <Router>
      <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>
        
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/tablets" element={<Tablets />} />
              <Route path="/diet" element={<Diet />} />
              <Route path="/study" element={<Study />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/health" element={<Health />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
        
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      </div>
    </Router>
  )
}

export default App
""",
    "frontend/src/context/ThemeContext.jsx": """import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
""",
    "frontend/src/components/layout/Sidebar.jsx": """import { NavLink } from 'react-router-dom';
import { Home, Pill, Coffee, BookOpen, Activity, Heart, Lightbulb, Settings as SettingsIcon } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { to: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/tablets', icon: <Pill size={20} />, label: 'Tablets' },
    { to: '/diet', icon: <Coffee size={20} />, label: 'Diet & Water' },
    { to: '/study', icon: <BookOpen size={20} />, label: 'Study' },
    { to: '/activity', icon: <Activity size={20} />, label: 'Activity' },
    { to: '/health', icon: <Heart size={20} />, label: 'Health' },
    { to: '/insights', icon: <Lightbulb size={20} />, label: 'Insights' },
    { to: '/settings', icon: <SettingsIcon size={20} />, label: 'Settings' },
  ];

  return (
    <aside className="h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
      <div className="p-6">
        <h1 className="font-bold text-xl text-primary-light dark:text-primary-dark">HealthTracker</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary-light/10 text-primary-light dark:text-primary-dark font-medium' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
""",
    "frontend/src/components/layout/BottomNav.jsx": """import { NavLink } from 'react-router-dom';
import { Home, Pill, Coffee, BookOpen, Activity } from 'lucide-react';

export default function BottomNav() {
  const links = [
    { to: '/', icon: <Home size={20} />, label: 'Home' },
    { to: '/tablets', icon: <Pill size={20} />, label: 'Tablets' },
    { to: '/diet', icon: <Coffee size={20} />, label: 'Diet' },
    { to: '/study', icon: <BookOpen size={20} />, label: 'Study' },
    { to: '/activity', icon: <Activity size={20} />, label: 'Activity' },
  ];

  return (
    <nav className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pb-safe">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => (
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
      </div>
    </nav>
  );
}
"""
}

pages = ["Dashboard", "Tablets", "Diet", "Study", "Activity", "Health", "Insights", "Settings", "Onboarding"]
for p in pages:
    if f"frontend/src/pages/{p}.jsx" not in files:
        files[f"frontend/src/pages/{p}.jsx"] = f"""export default function {p}() {{
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{p}</h1>
      <div className="card p-6">
        <p className="text-slate-500">Coming soon</p>
      </div>
    </div>
  )
}}"""

for filepath, content in files.items():
    with open(filepath, "w") as f:
        f.write(content)
