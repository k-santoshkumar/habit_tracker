import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { Moon, Sun, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import * as api from '../api/sleep';





export default function Sleep() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [log, setLog] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ sleep_time: '23:00', wake_time: '07:00', quality: 3, notes: '' });
  const [editing, setEditing] = useState(false);

  const [options, setOptions] = useState([]);

  const fetchData = async () => {
    try {
      const [logRes, histRes, optsRes] = await Promise.all([
        api.getSleepEntry(date),
        api.getSleepHistory(),
        api.getSleepOptions()
      ]);
      if (logRes.data.success) setLog(logRes.data.data);
      if (histRes.data.success) setHistory(histRes.data.data);
      if (optsRes.data.success) setOptions(optsRes.data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [date]);

  const handleSave = async (e) => {
    e.preventDefault();
    await api.logSleep({ ...form, date });
    setEditing(false);
    fetchData();
  };

  const navigateDate = (dir) => {
    const d = new Date(date);
    d.setDate(d.getDate() + dir);
    setDate(format(d, 'yyyy-MM-dd'));
  };

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const chartData = [...history].reverse().slice(-14).map(h => ({
    name: h.date.slice(-5),
    hours: +(h.duration_min / 60).toFixed(1),
    quality: h.quality
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2"><Moon size={24} /> Sleep</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateDate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft size={18} /></button>
          <span className="text-sm font-medium min-w-[90px] text-center">{date === format(new Date(), 'yyyy-MM-dd') ? 'Today' : date.slice(5)}</span>
          <button onClick={() => navigateDate(1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Today's Sleep Card */}
      {log && !editing ? (
        <div className="card p-6 text-center space-y-4" onClick={() => { setForm({ sleep_time: log.sleep_time, wake_time: log.wake_time, quality: log.quality, notes: log.notes || '' }); setEditing(true); }}>
          <div className="text-4xl font-bold text-primary-light dark:text-primary-dark">{formatDuration(log.duration_min)}</div>
          <div className="flex justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1"><Moon size={14} /> {log.sleep_time}</div>
            <div className="flex items-center gap-1"><Sun size={14} /> {log.wake_time}</div>
          </div>
          <div className="flex justify-center gap-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={20} className={s <= log.quality ? 'text-accent-light fill-accent-light' : 'text-slate-300'} />
            ))}
          </div>
          <div className="text-sm" style={{color: options.find(o => o.value === log.quality)?.color}}>
            {options.find(o => o.value === log.quality)?.emoji} {options.find(o => o.value === log.quality)?.label}
          </div>          {log.notes && <div className="text-xs text-slate-400 italic">"{log.notes}"</div>}
          <div className="text-xs text-slate-400">Tap to edit</div>
        </div>
      ) : (
        <form className="card p-5 space-y-5" onSubmit={handleSave}>
          <h3 className="font-medium">{log ? 'Edit Sleep Log' : 'Log Your Sleep'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block flex items-center gap-1"><Moon size={12} /> Bedtime</label>
              <input type="time" value={form.sleep_time} onChange={e => setForm({...form, sleep_time: e.target.value})} className="w-full p-2.5 border rounded-lg dark:bg-slate-800 dark:border-slate-700 outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block flex items-center gap-1"><Sun size={12} /> Wake Up</label>
              <input type="time" value={form.wake_time} onChange={e => setForm({...form, wake_time: e.target.value})} className="w-full p-2.5 border rounded-lg dark:bg-slate-800 dark:border-slate-700 outline-none" />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-slate-500 mb-2 block">Sleep Quality</label>
            <div className="flex justify-between gap-2">
              {options.map(opt => (
                <button key={opt.value} type="button" onClick={() => setForm({...form, quality: opt.value})}
                  title={opt.label}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    form.quality === opt.value
                      ? 'border-primary-light bg-primary-light/10 text-primary-light'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Notes (optional)</label>
            <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="e.g., Woke up once at 3am..." className="w-full p-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 outline-none" />
          </div>

          <div className="flex justify-end gap-2">
            {editing && <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm">Cancel</button>}
            <button type="submit" className="px-5 py-2 bg-primary-light text-white rounded-lg text-sm font-medium">Save</button>
          </div>
        </form>
      )}

      {/* Sleep History Chart */}
      {chartData.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Sleep Duration (Last 14 Nights)</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis hide domain={[0, 12]} />
                <Tooltip
                  contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1E293B', color: '#fff'}}
                  formatter={(v) => [`${v} hrs`, 'Sleep']}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]} fill="#0F6E56" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
