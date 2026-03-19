import ScoreRing from '../components/ui/ScoreRing'
import StreakCard from '../components/ui/StreakCard'
import HabitHeatmap from '../components/ui/HabitHeatmap'
import Skeleton from '../components/ui/Skeleton'
import Tooltip from '../components/ui/Tooltip'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import * as dsApi from '../api/dashboard';
import { User, Bell, Flame, Timer, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [score, setScore] = useState(0)
  const [streaks, setStreaks] = useState([])
  const [heatmap, setHeatmap] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
     async function fetchData() {
         try {
             const today = format(new Date(), 'yyyy-MM-dd');
             const scoreRes = await dsApi.getScore(today);
             if (scoreRes.data.success) {
                 setScore(scoreRes.data.data.score || 0);
             }
             const strRes = await dsApi.getStreaks();
             if (strRes.data.success) {
                 setStreaks(strRes.data.data);
             }
             const hmRes = await dsApi.getHeatmap();
             if (hmRes.data.success) {
                 setHeatmap(hmRes.data.data);
             }
         } catch (e) {
             console.error('Failed to load dashboard data', e);
         } finally {
             setLoading(false);
         }
     }
     fetchData();
  }, [])

  const isEmpty = !loading && score === 0 && streaks.length === 0 && heatmap.length === 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Header / User Profile */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-primary font-black text-sm transition-transform hover:scale-105">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
                {loading ? <Skeleton className="h-6 w-32" /> : <h2 className="text-lg">Hi, <span className="font-bold">{user?.full_name || 'Habit Warrior'}</span></h2>}
            </div>
        </div>
        <Tooltip content="Notifications">
          <button className="p-2 transition-all active:scale-90 text-slate-400 hover:text-primary">
              <Bell size={22} />
          </button>
        </Tooltip>
      </div>

      {isEmpty ? (
        <section className="card p-8 flex flex-col items-center justify-center text-center mt-12 border-dashed border-2">
           <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-primary mb-4">
               <Activity size={32} />
           </div>
           <h3 className="text-xl font-black text-slate-700 dark:text-slate-200 mb-2">Ready to transform your life?</h3>
           <p className="text-sm text-slate-500 max-w-xs mb-6">You don't have any habits tracked yet. Start your journey by creating your first daily habit.</p>
           <button onClick={() => navigate('/habits')} className="btn-primary">Create a Habit</button>
        </section>
      ) : (
        <>
          <section className="space-y-4">
            <h3 className="section-title">Overview</h3>
            <div className="grid grid-cols-12 gap-4">
                {/* Score Card */}
                <div className="col-span-12 md:col-span-6 card p-6 flex items-center justify-around group hover:shadow-lg transition-shadow">
                    <div className="w-32 h-32 relative">
                        {loading ? <Skeleton className="w-full h-full rounded-full" /> : <ScoreRing score={score} />}
                    </div>
                    <div className="text-center md:text-left flex flex-col justify-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</p>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Completion</p>
                        {loading ? <Skeleton className="h-7 w-24 mt-2" /> : <div className="mt-2 text-primary font-black text-xl">Well Done!</div>}
                    </div>
                </div>

                {/* Side Cards */}
                <div className="col-span-12 md:col-span-6 grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <div className="card p-5 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-slate-800/50 hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start mb-4">
                            <Tooltip content="Current active focus tasks">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl cursor-help">
                                  <Timer size={18} />
                              </div>
                            </Tooltip>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Focus</p>
                        {loading ? <Skeleton className="h-6 w-16 mt-1" /> : <p className="text-lg font-black mt-1">On Path</p>}
                    </div>

                    <div className="card p-5 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-slate-800/50 hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start mb-4">
                            <Tooltip content="Consecutive solid performance">
                              <div className="p-2 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-xl cursor-help">
                                  <Flame size={18} />
                              </div>
                            </Tooltip>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Streak</p>
                        {loading ? <Skeleton className="h-6 w-20 mt-1" /> : (
                          <div className="flex items-center gap-2 mt-1">
                              <p className="text-lg font-black">Solid</p>
                              <span className="animate-pulse">🔥</span>
                          </div>
                        )}
                    </div>
                </div>
            </div>
          </section>

          {/* Heatmap Section */}
          <section className="space-y-4">
            <h3 className="section-title">Statistics</h3>
            <div className="card p-6 overflow-hidden">
                 <div className="flex gap-2 mb-6">
                     {['Daily', 'Weekly', 'Monthly'].map(tab => (
                         <button key={tab} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${tab === 'Daily' ? 'bg-primary-light text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400'}`}>
                             {tab}
                         </button>
                     ))}
                 </div>
                 {loading ? <Skeleton className="h-40 w-full" /> : <HabitHeatmap data={heatmap} />}
            </div>
          </section>

          {/* Habits Streaks */}
          {(loading || streaks.length > 0) && (
              <section className="space-y-4">
                <h3 className="section-title">Active Streaks</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {loading ? (
                        <>
                           <Skeleton className="h-24 w-full" />
                           <Skeleton className="h-24 w-full" />
                           <Skeleton className="h-24 w-full" />
                        </>
                    ) : (
                        streaks.map((s, idx) => (
                            <div key={idx} className="transition-transform hover:-translate-y-1 hover:shadow-lg active:scale-95 duration-200">
                              <StreakCard {...s} />
                            </div>
                        ))
                    )}
                </div>
              </section>
          )}
        </>
      )}

    </div>
  )
}