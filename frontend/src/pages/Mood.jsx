import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import * as api from '../api/mood';





export default function Mood() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entry, setEntry] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ mood: 3, energy: 3, stress: 3, notes: '' });
  const [editing, setEditing] = useState(false);

  const [options, setOptions] = useState({ mood: [], energy: [], stress: [] });

  const fetchData = async () => {
    try {
      const [entryRes, histRes, optsRes] = await Promise.all([
        api.getMoodEntry(date),
        api.getMoodEntries(),
        api.getMoodOptions()
      ]);
      if (entryRes.data.success) setEntry(entryRes.data.data);
      if (histRes.data.success) setHistory(histRes.data.data);
      if (optsRes.data.success) setOptions(optsRes.data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [date]);

  const handleSave = async (e) => {
    e.preventDefault();
    await api.logMood({ ...form, date });
    setEditing(false);
    fetchData();
  };

  const navigateDate = (dir) => {
    const d = new Date(date);
    d.setDate(d.getDate() + dir);
    setDate(format(d, 'yyyy-MM-dd'));
  };

  const chartData = [...history].reverse().slice(-14).map(h => ({
    name: h.date.slice(-5), mood: h.mood, energy: h.energy, stress: h.stress
  }));

  const ScaleSelector = ({ label, emojis, value, onChange }) => (
    <div>
      <label className="text-xs text-slate-500 mb-2 block font-medium">{label}</label>
      <div className="flex justify-between gap-1.5">
        {[1,2,3,4,5].map(v => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`flex-1 py-3 rounded-xl text-xl transition-all border ${
              value === v
                ? 'border-primary-light bg-primary-light/10 scale-110 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 opacity-50 hover:opacity-80'
            }`}
          >
            {emojis[v]}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mood Journal</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateDate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft size={18} /></button>
          <span className="text-sm font-medium min-w-[90px] text-center">{date === format(new Date(), 'yyyy-MM-dd') ? 'Today' : date.slice(5)}</span>
          <button onClick={() => navigateDate(1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight size={18} /></button>
        </div>
      </div>

      {entry && !editing ? (
        <div className="card p-6 text-center space-y-4 cursor-pointer" onClick={() => { setForm({ mood: entry.mood, energy: entry.energy, stress: entry.stress, notes: entry.notes || '' }); setEditing(true); }}>
          <div className="text-6xl">{options.mood[entry.mood]}</div>
          <div className="flex justify-center gap-8 text-sm">
            <div><span className="text-slate-500">Energy</span> <span className="text-lg">{options.energy[entry.energy]}</span></div>
            <div><span className="text-slate-500">Stress</span> <span className="text-lg">{options.stress[entry.stress]}</span></div>
          </div>
          {entry.notes && <div className="text-sm text-slate-400 italic mt-2">"{entry.notes}"</div>}
          <div className="text-xs text-slate-400">Tap to edit</div>
        </div>
      ) : (
        <form className="card p-5 space-y-6" onSubmit={handleSave}>
          <h3 className="font-medium">{entry ? 'Edit Check-in' : 'How are you feeling?'}</h3>
          
          <ScaleSelector label="Mood" emojis={options.mood} value={form.mood} onChange={v => setForm({...form, mood: v})} />
          <ScaleSelector label="Energy" emojis={options.energy} value={form.energy} onChange={v => setForm({...form, energy: v})} />
          <ScaleSelector label="Stress" emojis={options.stress} value={form.stress} onChange={v => setForm({...form, stress: v})} />

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Notes (optional)</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="What's on your mind today..." className="w-full p-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 outline-none resize-none" />
          </div>

          <div className="flex justify-end gap-2">
            {editing && <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm">Cancel</button>}
            <button type="submit" className="px-5 py-2 bg-primary-light text-white rounded-lg text-sm font-medium">Save Check-in</button>
          </div>
        </form>
      )}

      {/* Mood Trends */}
      {chartData.length > 1 && (
        <div className="card p-4">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Mood Trends (14 days)</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis hide domain={[0, 6]} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1E293B', color: '#fff'}} />
                <Line type="monotone" dataKey="mood" stroke="#0F6E56" strokeWidth={2.5} dot={{r: 3}} name="Mood" />
                <Line type="monotone" dataKey="energy" stroke="#D97706" strokeWidth={2} dot={{r: 2}} name="Energy" />
                <Line type="monotone" dataKey="stress" stroke="#EF4444" strokeWidth={2} dot={{r: 2}} strokeDasharray="4 2" name="Stress" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary-light inline-block"></span> Mood</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent-light inline-block"></span> Energy</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block"></span> Stress</span>
          </div>
        </div>
      )}
    </div>
  );
}
