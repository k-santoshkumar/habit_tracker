import ScoreRing from '../components/ui/ScoreRing'
import StreakCard from '../components/ui/StreakCard'
import HabitHeatmap from '../components/ui/HabitHeatmap'
import ReflectionPrompt from '../components/ui/ReflectionPrompt'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import * as dsApi from '../api/dashboard';

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

  const currentHour = new Date().getHours();
  const showReflection = currentHour >= 20;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header section with Score Ring */}
      <div className="flex flex-col items-center justify-center py-6">
        <ScoreRing score={score} thresholdLabel={score >= 90 ? "Outstanding day" : score >= 70 ? "Strong day" : "Let us make today count"} />
      </div>

      {/* Heatmap */}
      <div className="card p-4 overflow-x-hidden">
         <h3 className="text-sm font-medium mb-4 text-slate-500">Consistency (12 Weeks)</h3>
         <HabitHeatmap data={heatmap} />
      </div>

      {/* Streaks */}
      <div>
         <h3 className="text-sm font-medium mb-4 text-slate-500">Active Streaks</h3>
         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {streaks.map((s, idx) => (
                 <StreakCard key={idx} {...s} />
             ))}
         </div>
      </div>

      {/* Reflection Prompt */}
      {showReflection && (
          <ReflectionPrompt onSubmit={(data) => console.log('Saved reflection:', data)} />
      )}

    </div>
  )
}