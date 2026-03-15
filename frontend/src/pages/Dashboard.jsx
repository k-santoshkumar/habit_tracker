import ScoreRing from '../components/ui/ScoreRing'
import StreakCard from '../components/ui/StreakCard'
import HabitHeatmap from '../components/ui/HabitHeatmap'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import * as dsApi from '../api/dashboard';
import { User, Bell, Flame, Timer } from 'lucide-react';

export default function Dashboard() {
  const [score, setScore] = useState(0)
  const [streaks, setStreaks] = useState([])
  const [heatmap, setHeatmap] = useState([])
  
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
         }
     }
     fetchData();
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Header / User Profile */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                <User size={20} />
            </div>
            <div>
                <h2 className="text-lg">Hi, <span className="font-bold">Habit Warrior</span></h2>
            </div>
        </div>
        <button className="p-2 transition-all active:scale-90 text-slate-400">
            <Bell size={22} />
        </button>
      </div>

      <section className="space-y-4">
        <h3 className="section-title">Overview</h3>
        <div className="grid grid-cols-12 gap-4">
            {/* Score Card */}
            <div className="col-span-12 md:col-span-6 card p-6 flex items-center justify-around">
                <div className="w-32 h-32">
                    <ScoreRing score={score} />
                </div>
                <div className="text-center md:text-left flex flex-col justify-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</p>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Completion</p>
                    <div className="mt-2 text-primary font-black text-xl">Well Done!</div>
                </div>
            </div>

            {/* Side Cards */}
            <div className="col-span-12 md:col-span-6 grid grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="card p-5 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-slate-800/50">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Timer size={18} />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Focus</p>
                    <p className="text-lg font-black mt-1">On Path</p>
                </div>

                <div className="card p-5 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-slate-800/50">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-xl">
                            <Flame size={18} />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Streak</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-lg font-black">Solid</p>
                        <span className="animate-pulse">🔥</span>
                    </div>
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
                     <button key={tab} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${tab === 'Daily' ? 'bg-primary-light text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                         {tab}
                     </button>
                 ))}
             </div>
             <HabitHeatmap data={heatmap} />
        </div>
      </section>

      {/* Habits Streaks */}
      {streaks.length > 0 && (
          <section className="space-y-4">
            <h3 className="section-title">Active Streaks</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {streaks.map((s, idx) => (
                    <StreakCard key={idx} {...s} />
                ))}
            </div>
          </section>
      )}

    </div>
  )
}