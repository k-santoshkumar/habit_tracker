import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Check, Trash2, Flame, Search } from 'lucide-react';
import * as api from '../api/habits';





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
    await api.deleteHabit(habitId);
    fetchData();
  };

  const completedCount = habits.filter(h => logs[h.id]).length;
  const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const filtered = newHabit ? suggestions.filter(s => s.toLowerCase().includes(newHabit.toLowerCase())) : suggestions;

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Habits</h1>
        <button onClick={() => setShowAdd(true)} className="p-2 bg-primary-light text-white rounded-full"><Plus size={20} /></button>
      </div>

      {/* Progress Banner */}
      <div className="card p-5 bg-gradient-to-r from-primary-light/10 to-accent-light/10 dark:from-primary-dark/10 dark:to-accent-dark/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-slate-500">Today's Progress</div>
            <div className="text-2xl font-bold">{completedCount} <span className="text-sm font-normal text-slate-400">/ {habits.length}</span></div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-primary-light flex items-center justify-center">
            <span className="text-lg font-bold text-primary-light">{completionRate}%</span>
          </div>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div className="bg-primary-light h-2 rounded-full transition-all duration-500" style={{width: `${completionRate}%`}}></div>
        </div>
      </div>

      {showAdd && (
        <form className="card p-4 space-y-4" onSubmit={handleAdd}>
          <h3 className="font-medium">Add Habit</h3>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input required value={newHabit} onChange={e => setNewHabit(e.target.value)} placeholder="Type or search a habit..." className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 outline-none text-sm" />
          </div>
          {filtered.length > 0 && !habits.find(h => h.name === newHabit) && (
            <div className="max-h-36 overflow-y-auto border rounded-lg dark:border-slate-700">
              {filtered.slice(0, 6).map((s, i) => (
                <div key={i} onClick={() => setNewHabit(s)} className={`px-3 py-2 text-sm cursor-pointer border-b last:border-b-0 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 ${newHabit === s ? 'bg-primary-light/10 text-primary-light' : ''}`}>
                  {s}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-light text-white rounded-lg text-sm font-medium">Add</button>
          </div>
        </form>
      )}

      {habits.length === 0 && !showAdd && (
        <div className="card p-8 text-center bg-slate-50 dark:bg-slate-800">
          <Flame className="mx-auto mb-4 text-accent-light" size={32} />
          <p className="text-slate-500 mb-4">Build daily habits that stick. Start with one.</p>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-primary-light text-white rounded-lg text-sm font-medium">Add First Habit</button>
        </div>
      )}

      <div className="space-y-2">
        {habits.map(h => {
          const done = logs[h.id] || false;
          return (
            <div key={h.id} className={`card p-4 flex items-center justify-between transition-all ${done ? 'bg-primary-light/5' : ''}`}>
              <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleHabit(h.id)}>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                  done ? 'bg-primary-light border-primary-light text-white scale-110' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {done && <Check size={14} />}
                </div>
                <span className={`font-medium text-sm ${done ? 'line-through text-slate-400' : ''}`}>{h.name}</span>
              </div>
              <button onClick={() => deleteHabit(h.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
