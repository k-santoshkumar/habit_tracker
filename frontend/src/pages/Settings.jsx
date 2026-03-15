import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useState } from 'react';
import axios from 'axios';
import { Moon, Sun, Download, Trash2, User, Mail, Lock, Bell, BellOff, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

export default function Settings() {
  const { isDark, setIsDark } = useTheme();
  const { user, setUser } = useAuth();
  const { remindersEnabled, toggleReminders, addNotification } = useNotifications();
  
  const [profile, setProfile] = useState({
      full_name: user?.full_name || '',
      email: user?.email || '',
      password: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          const res = await axios.put('/api/auth/me', profile, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.data.success) {
              setSuccess(true);
              setUser({ ...user, ...res.data.data });
              addNotification("Profile Updated", "Your account details have been successfully saved.");
              setTimeout(() => setSuccess(false), 3000);
          }
      } catch (err) {
          console.error(err);
          addNotification("Update Failed", "Could not update profile. Please check your data.", "error");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black tracking-tight">Settings</h1>
      </div>

      {/* Account Section */}
      <section className="space-y-4">
          <h3 className="section-title">Account</h3>
          <form onSubmit={handleUpdate} className="card p-6 space-y-6">
              <div className="space-y-4">
                  <div className="relative group">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Full Name</label>
                      <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                          <input 
                              value={profile.full_name} 
                              onChange={e => setProfile({...profile, full_name: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-semibold" 
                              placeholder="Your full name"
                          />
                      </div>
                  </div>

                  <div className="relative group">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Email Address</label>
                      <div className="relative">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                          <input 
                              type="email"
                              value={profile.email} 
                              onChange={e => setProfile({...profile, email: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-semibold" 
                              placeholder="Email address"
                          />
                      </div>
                  </div>

                  <div className="relative group">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">New Password</label>
                      <div className="relative">
                          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                          <input 
                              type="password"
                              value={profile.password} 
                              onChange={e => setProfile({...profile, password: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-semibold" 
                              placeholder="Leave blank to keep current"
                          />
                      </div>
                  </div>
              </div>

              <button 
                  type="submit" 
                  disabled={loading}
                  className={`btn-primary w-full p-4 rounded-2xl flex items-center justify-center gap-2 font-black transition-all ${success ? 'bg-green-500 shadow-green-200' : ''}`}
              >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : success ? <CheckCircle2 size={20} /> : "Update Profile"}
              </button>
          </form>
      </section>

      {/* Preferences Section */}
      <section className="space-y-4">
          <h3 className="section-title">Preferences</h3>
          <div className="card divide-y divide-slate-50 dark:divide-slate-800">
              {/* Appearance */}
              <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-orange-100 text-orange-600'}`}>
                          {isDark ? <Moon size={20} /> : <Sun size={20} />}
                      </div>
                      <div>
                          <p className="font-bold text-sm">Dark Mode</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Visual Theme</p>
                      </div>
                  </div>
                  <button 
                      onClick={() => setIsDark(!isDark)}
                      className={`w-12 h-6 rounded-full transition-all relative ${isDark ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDark ? 'left-7' : 'left-1'}`} />
                  </button>
              </div>

              {/* Notifications */}
              <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${remindersEnabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                          {remindersEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                      </div>
                      <div>
                          <p className="font-bold text-sm">Reminders</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Push Notifications</p>
                      </div>
                  </div>
                  <button 
                      onClick={toggleReminders}
                      className={`w-12 h-6 rounded-full transition-all relative ${remindersEnabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${remindersEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
              </div>
          </div>
      </section>

      {/* Data Management */}
      <section className="space-y-4">
          <h3 className="section-title">Data & Security</h3>
          <div className="card overflow-hidden">
              <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400">
                          <Download size={20} />
                      </div>
                      <div className="text-left">
                          <p className="font-bold text-sm">Export My Hub</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">JSON Format</p>
                      </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
              </button>
              
              <button className="w-full flex items-center justify-between p-5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-t border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                          <Trash2 size={20} />
                      </div>
                      <div className="text-left">
                          <p className="font-bold text-sm text-red-600">Factory Reset</p>
                          <p className="text-[10px] opacity-70 font-bold uppercase tracking-tight">Irreversible</p>
                      </div>
                  </div>
                  <ChevronRight size={18} className="opacity-30" />
              </button>
          </div>
      </section>
      
      <div className="text-center pt-8">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">HabitFlow v1.2.0</p>
      </div>
    </div>
  )
}