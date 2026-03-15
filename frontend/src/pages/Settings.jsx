import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Download, Trash2 } from 'lucide-react';

export default function Settings() {
  const { isDark, setIsDark } = useTheme();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="card">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-medium text-lg">Appearance</h2>
          </div>
          <div className="p-4 flex items-center justify-between">
              <div>
                  <div className="font-medium">Dark Theme</div>
                  <div className="text-sm text-slate-500">Toggle dark mode interface</div>
              </div>
              <button 
                  onClick={() => setIsDark(!isDark)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
              >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
          </div>
      </div>

      <div className="card">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-medium text-lg">Data Management</h2>
          </div>
          <div className="p-4 space-y-4">
              <button className="flex w-full items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg active:scale-95 transition-transform hover:bg-slate-50 dark:hover:bg-slate-800">
                  <span className="font-medium">Export Data</span>
                  <Download size={18} className="text-primary-light" />
              </button>
              
              <button className="flex w-full items-center justify-between p-3 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg active:scale-95 transition-transform">
                  <span className="font-medium">Delete All Data</span>
                  <Trash2 size={18} />
              </button>
          </div>
      </div>
    </div>
  )
}