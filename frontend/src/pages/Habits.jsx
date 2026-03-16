import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Check, Flame, Search, Loader2, ChevronLeft, MoreHorizontal, Calendar } from 'lucide-react';
import * as api from '../api/habits';
import useLongPress from '../hooks/useLongPress';

export default function Habits() {
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', description: '', days: ['Mo', 'Tu', 'We', 'Th', 'Fr'] });
  const [loading, setLoading] = useState(true);

  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

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
    await api.createHabit({ name: newHabit.name, description: newHabit.description });
    setNewHabit({ name: '', description: '', days: ['Mo', 'Tu', 'We', 'Th', 'Fr'] });
    setShowAdd(false);
    fetchData();
  };

  const toggleDay = (day) => {
      setNewHabit(prev => ({
          ...prev,
          days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
      }));
  };

  const toggleHabit = async (habitId) => {
    await api.logHabit({ date, habit_id: habitId, completed: !logs[habitId] });
    setLogs({ ...logs, [habitId]: !logs[habitId] });
  };

  const deleteHabit = async (habitId) => {
    if (window.confirm("Delete this habit?")) {
        await api.deleteHabit(habitId);
        fetchData();
    }
  };

  const completedCount = habits.filter(h => logs[h.id]).length;
  const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  if (loading) return <div className="p-4 flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      
      {/* Header */}
      <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
              <button className="p-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500">
                  <ChevronLeft size={18} />
              </button>
              <h1 className="text-xl font-bold">Habits</h1>
          </div>
          <button className="p-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500">
              <MoreHorizontal size={18} />
          </button>
      </div>

      {/* Progress Card */}
      <div className="card p-6 flex items-center justify-between border-none bg-gradient-to-br from-primary to-blue-600 shadow-active text-white">
        <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Today's Progress</p>
            <p className="text-3xl font-black">{completionRate}%</p>
            <p className="text-xs font-bold opacity-70">{completedCount} of {habits.length} habits done</p>
        </div>
        <div className="p-4 bg-white/20 rounded-[24px]">
            <Flame size={32} />
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
              <h3 className="section-title">Active Habits</h3>
              <button onClick={() => setShowAdd(true)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-primary rounded-xl active:scale-95 transition-all">
                  <Plus size={20} />
              </button>
          </div>
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
              {habits.length === 0 && (
                  <div className="text-center py-10 text-slate-400 italic font-medium">No habits yet. Click + to start.</div>
              )}
          </div>
      </div>

      {/* Add Task Modal overlay (Reference Style) */}
      {showAdd && (
          <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 animate-in slide-in-from-bottom duration-500 overflow-y-auto">
              <div className="p-6 max-w-lg mx-auto space-y-8 pb-32">
                  <div className="flex justify-between items-center">
                      <button onClick={() => setShowAdd(false)} className="p-2 -ml-2 text-slate-500"><ChevronLeft size={24} /></button>
                      <h2 className="text-xl font-black">Add a task</h2>
                      <button className="p-2 -mr-2 text-slate-500"><MoreHorizontal size={24} /></button>
                  </div>

                  <form className="space-y-8" onSubmit={handleAdd}>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Habit name</label>
                          <input required autoFocus placeholder="Enter habit title" value={newHabit.name} onChange={e => setNewHabit({...newHabit, name: e.target.value})} className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-primary transition-all font-semibold" />
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Write a short description</label>
                          <textarea placeholder="Tell yourself why this matters..." value={newHabit.description} onChange={e => setNewHabit({...newHabit, description: e.target.value})} className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-primary transition-all font-medium min-h-[100px]" />
                      </div>

                      <div className="space-y-4">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Repeat</label>
                          <div className="flex justify-between">
                              {days.map(d => (
                                  <button key={d} type="button" onClick={() => toggleDay(d)} className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${newHabit.days.includes(d) ? 'bg-primary border-primary text-white' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                                      {d}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="space-y-4">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Set date</label>
                          <div className="card p-4 flex items-center justify-between border-slate-100">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-lg font-bold text-[10px]">Starting date</div>
                             </div>
                             <div className="rotate-90 md:rotate-0 text-slate-300">→</div>
                             <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-400 uppercase">Ending date</div>
                          </div>
                      </div>

                      <div className="fixed bottom-0 inset-x-0 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex gap-4">
                          <button type="button" onClick={() => setShowAdd(false)} className="flex-1 p-4 rounded-2xl font-black text-slate-400 border border-slate-200 dark:border-slate-800 active:scale-95 transition-all">Cancel</button>
                          <button type="submit" className="flex-1 btn-primary p-4 rounded-2xl font-black bg-primary text-white shadow-active active:scale-95 transition-all">Save</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
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
            className={`card p-4 flex items-center justify-between transition-all active:scale-[0.98] ${done ? 'opacity-60 bg-slate-50/50 dark:bg-slate-800/50' : ''}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    done ? 'bg-primary border-primary text-white' : 'border-slate-200 dark:border-slate-700 font-bold text-[8px] text-slate-300'
                }`}>
                    {done && <Check size={14} />}
                </div>
                <div>
                  <span className={`font-bold text-sm ${done ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                      {habit.name}
                  </span>
                  {habit.description && !done && (
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium line-clamp-1">{habit.description}</p>
                  )}
                </div>
            </div>
            <div className="flex gap-1">
                {['Mo','Tu','We'].map(d => (
                    <div key={d} className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                ))}
                <div className="w-1.5 h-1.5 rounded-full bg-primary/30"></div>
            </div>
        </div>
    );
}
