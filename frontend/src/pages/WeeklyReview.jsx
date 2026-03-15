import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Moon, Smile, Flame, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import * as api from '../api/weekly';


export default function WeeklyReview() {
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getWeeklyReview(endDate);
      if (res.data.success) setReview(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [endDate]);

  const navigateWeek = (dir) => {
    const d = new Date(endDate);
    d.setDate(d.getDate() + (dir * 7));
    setEndDate(format(d, 'yyyy-MM-dd'));
  };

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!review) return <div className="p-4">No data available.</div>;

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartData = review.daily_scores.map((s, i) => ({
    name: dayLabels[i] || s.date.slice(-5),
    score: s.score
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Weekly Review</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateWeek(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft size={18} /></button>
          <span className="text-xs font-medium text-slate-500">{review.week_start.slice(5)} — {review.week_end.slice(5)}</span>
          <button onClick={() => navigateWeek(1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Average Score Banner */}
      <div className="card p-6 bg-gradient-to-br from-primary-light/10 to-accent-light/5 dark:from-primary-dark/10 dark:to-accent-dark/5 text-center">
        <div className="text-sm text-slate-500 mb-1">Weekly Average</div>
        <div className="text-5xl font-bold text-primary-light dark:text-primary-dark">{review.avg_score}</div>
        <div className="text-sm text-slate-400 mt-1">
          {review.avg_score >= 80 ? '🔥 Outstanding week!' : review.avg_score >= 60 ? '💪 Solid effort!' : review.avg_score > 0 ? '📈 Room to grow' : 'Start logging to see your score'}
        </div>
      </div>

      {/* Daily Scores Chart */}
      <div className="card p-4">
        <h3 className="text-sm font-medium text-slate-500 mb-4">Daily Scores</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1E293B', color: '#fff'}} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#0F6E56" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best / Worst Day */}
      <div className="grid grid-cols-2 gap-4">
        {review.best_day && (
          <div className="card p-4 text-center">
            <TrendingUp size={20} className="mx-auto text-primary-light mb-2" />
            <div className="text-xs text-slate-500">Best Day</div>
            <div className="font-bold text-lg">{review.best_day.score}</div>
            <div className="text-xs text-slate-400">{review.best_day.date.slice(5)}</div>
          </div>
        )}
        {review.worst_day && (
          <div className="card p-4 text-center">
            <TrendingDown size={20} className="mx-auto text-accent-light mb-2" />
            <div className="text-xs text-slate-500">Weakest Day</div>
            <div className="font-bold text-lg">{review.worst_day.score}</div>
            <div className="text-xs text-slate-400">{review.worst_day.date.slice(5)}</div>
          </div>
        )}
      </div>

      {/* Category Summaries */}
      <div className="space-y-3">
        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30"><Moon size={20} className="text-indigo-500" /></div>
          <div className="flex-1">
            <div className="font-medium text-sm">Sleep</div>
            <div className="text-xs text-slate-400">{review.sleep.nights_logged} nights logged • Avg quality: {review.sleep.avg_quality}/5</div>
          </div>
          <div className="text-right">
            <div className="font-bold">{formatDuration(review.sleep.avg_duration_min)}</div>
            <div className="text-xs text-slate-400">avg/night</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30"><Smile size={20} className="text-amber-500" /></div>
          <div className="flex-1">
            <div className="font-medium text-sm">Mood</div>
            <div className="text-xs text-slate-400">{review.mood.entries} entries this week</div>
          </div>
          <div className="text-right">
            <div className="font-bold">{review.mood.avg_mood}/5</div>
            <div className="text-xs text-slate-400">avg mood</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/30"><Flame size={20} className="text-teal-500" /></div>
          <div className="flex-1">
            <div className="font-medium text-sm">Habits</div>
            <div className="text-xs text-slate-400">Custom habit completions</div>
          </div>
          <div className="text-right">
            <div className="font-bold">{review.habits_completed}</div>
            <div className="text-xs text-slate-400">completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
