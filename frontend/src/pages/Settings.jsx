import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/useAuth';
import { useNotifications } from '../context/useNotifications';
import { useState } from 'react';
import { updateMe } from '../api/auth';
import { Moon, Sun, User, Mail, Lock, Bell, BellOff, CheckCircle2, Loader2 } from 'lucide-react';

export default function Settings() {
  const { isDark, setIsDark } = useTheme();
  const { user, setUser } = useAuth();
  const { remindersEnabled, toggleReminders, addNotification, notificationStatus, exactAlarmStatus, refreshNotificationStatus, openSettings } = useNotifications();
  
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
      const payload = {
          full_name: profile.full_name,
          email: profile.email
      };
      if (profile.password.trim()) {
          payload.password = profile.password;
      }
      try {
          const res = await updateMe(payload);
          if (res.data.success) {
              if (res.data.access_token) {
                  localStorage.setItem('token', res.data.access_token);
              }
              setSuccess(true);
              const updatedUser = res.data.user ?? res.data.data;
              setUser(updatedUser);
              addNotification("Profile Updated", "Your account details have been successfully saved.");
              setProfile({
                  full_name: updatedUser.full_name ?? '',
                  email: updatedUser.email ?? '',
                  password: ''
              });
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
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
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

                <div className="text-xs text-slate-500 space-y-1">
                  <div>Status: <span className="font-bold text-slate-700 dark:text-slate-200">{notificationStatus}</span></div>
                  <div>Exact alarm: <span className="font-bold text-slate-700 dark:text-slate-200">{exactAlarmStatus}</span></div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <button onClick={refreshNotificationStatus} className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold">Check Permission</button>
                  <button onClick={openSettings} className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold">Open Settings</button>
                </div>

                {notificationStatus === 'denied' && (
                  <p className="text-[10px] text-red-500">Notifications blocked. Please allow them in system settings.</p>
                )}
                {notificationStatus === 'prompt' && (
                  <p className="text-[10px] text-amber-500">Notifications are not granted yet. Toggle to enable.</p>
                )}
              </div>
          </div>
      </section>
      
      <div className="text-center pt-8">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">HabitFlow v1.2.0</p>
      </div>
    </div>
  )
}
