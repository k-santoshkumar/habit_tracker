import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Check, Flame, Search, Loader2 } from 'lucide-react';
import * as api from '../api/habits';
import useLongPress from '../hooks/useLongPress';

export default function Habits() {
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [habitsRes, logsRes, suggRes] = await Promise.all([
        api.getHabits(),
        api.getHabitLogs(date),
        api.getHabitSuggestions()
      ]);
      if (habitsRes.data.success) setHabits(habitsRes.data.data);
      if (logsRes.data.success) {
        const logMap = {};
        logsRes.data.data.forEach(l => { logMap[l.habit_id] = l.completed; });
        setLogs(logMap);
      }
      if (suggRes.data.success) setSuggestions(suggRes.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [date]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.createHabit({ name: newHabit });
    setNewHabit('');
    setShowAdd(false);
    fetchData();
  };

  const toggleHabit = async (habitId) => {
    await api.logHabit({ date, habit_id: habitId, completed: !logs[habitId] });
    setLogs({ ...logs, [habitId]: !logs[habitId] });
  };

  const deleteHabit = async (habitId) => {
    if (window.confirm("Delete this habit and all its progress?")) {
        await api.deleteHabit(habitId);
        fetchData();
    }
  };

  const completedCount = habits.filter(h => logs[h.id]).length;
  const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const filtered = newHabit ? suggestions.filter(s => s.toLowerCase().includes(newHabit.toLowerCase())) : suggestions;

  if (loading) return <div className="p-4 flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-primary-light" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Habits</h1>
        <button onClick={() => setShowAdd(true)} className="p-2 bg-primary-light text-white rounded-full hover:bg-primary-light/90 active:scale-95 transition-all">
            <Plus size={20} />
        </button>
      </div>

      <div className="card p-5 bg-gradient-to-r from-primary-light/10 to-accent-light/10 dark:from-primary-dark/10 dark:to-accent-dark/10 ring-1 ring-primary-light/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Progress</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{completedCount} <span className="text-sm font-normal text-slate-400">/ {habits.length}</span></div>
          </div>
          <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all ${completionRate === 100 ? 'border-primary-light bg-primary-light/10' : 'border-primary-light/30'}`}>
            <span className="text-sm font-bold text-primary-light">{completionRate}%</span>
          </div>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
          <div className="bg-primary-light h-full rounded-full transition-all duration-700 ease-out" style={{width: `${completionRate}%`}}></div>
        </div>
      </div>

      {showAdd && (
        <form className="card p-5 space-y-4 animate-in slide-in-from-top-4 duration-300" onSubmit={handleAdd}>
          <h3 className="font-semibold text-lg">New Habit</h3>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input required value={newHabit} onChange={e => setNewHabit(e.target.value)} placeholder="e.g., Read 30 mins" className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all text-sm" />
          </div>
          {filtered.length > 0 && !habits.find(h => h.name === newHabit) && (
            <div className="max-h-48 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
              {filtered.slice(0, 8).map((s, i) => (
                <div key={i} onClick={() => setNewHabit(s)} className={`px-4 py-3 text-sm cursor-pointer border-b last:border-b-0 border-slate-50 dark:border-slate-800 hover:bg-primary-light/5 transition-colors ${newHabit === s ? 'text-primary-light font-semibold' : ''}`}>
                  {s}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2 text-sm font-medium text-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary-light text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-light/20 hover:opacity-90">Add Habit</button>
          </div>
        </form>
      )}

      {habits.length === 0 && !showAdd && (
        <div className="card p-10 text-center bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-accent-light/10 text-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Flame size={32} />
          </div>
          <p className="text-slate-500 mb-6 font-medium">Build daily habits that stick. Start with one simple task.</p>
          <button onClick={() => setShowAdd(true)} className="px-6 py-2.5 bg-primary-light text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-light/20">Create My First Habit</button>
        </div>
      )}

      <div className="grid gap-3">
        {habits.map(h => (
            <HabitItem 
                key={h.id} 
                habit={h} 
                done={logs[h.id] || false} 
                onToggle={() => toggleHabit(h.id)} 
                onDelete={() => deleteHabit(h.id)} 
            />
        ))}
      </div>
    </div>
  );
}

function HabitItem({ habit, done, onToggle, onDelete }) {
    const longPressProps = useLongPress(
        () => onDelete(),
        () => onToggle(),
        { delay: 800 }
    );

    return (
        <div 
            {...longPressProps}
            className={`card p-4 flex items-center gap-4 transition-all select-none cursor-pointer active:scale-[0.98] border-2 ${
                done ? 'bg-primary-light/5 border-primary-light/20' : 'border-transparent'
            }`}
        >
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                done ? 'bg-primary-light border-primary-light text-white rotate-0' : 'border-slate-300 dark:border-slate-600'
            }`}>
                {done && <Check size={16} className="animate-in zoom-in duration-300" />}
            </div>
            <span className={`font-semibold text-sm transition-all duration-300 ${done ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                {habit.name}
            </span>
        </div>
    );
}
