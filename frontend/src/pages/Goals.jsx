import { useState, useEffect } from 'react';
import { Plus, Target, Trophy, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = ['Fitness', 'Health', 'Study', 'Lifestyle', 'Finance', 'General'];
const CATEGORY_COLORS = { Fitness: '#0F6E56', Health: '#EF4444', Study: '#3B82F6', Lifestyle: '#D97706', Finance: '#8B5CF6', General: '#64748B' };

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', category: 'General', target_value: '', unit: '', deadline: '' });
  const [newMilestone, setNewMilestone] = useState('');
  const [addingMileTo, setAddingMileTo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/goals/');
      if (res.data.success) setGoals(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await axios.post('/api/goals/', {
      ...newGoal,
      target_value: newGoal.target_value ? parseFloat(newGoal.target_value) : null
    });
    setShowAdd(false);
    setNewGoal({ title: '', description: '', category: 'General', target_value: '', unit: '', deadline: '' });
    fetchData();
  };

  const updateProgress = async (goalId, newValue) => {
    await axios.put(`/api/goals/${goalId}/progress`, { current_value: parseFloat(newValue) });
    fetchData();
  };

  const toggleMilestone = async (msId) => {
    await axios.put(`/api/goals/milestones/${msId}/toggle`);
    fetchData();
  };

  const addMilestone = async (goalId) => {
    if (!newMilestone.trim()) return;
    await axios.post(`/api/goals/${goalId}/milestones`, { title: newMilestone });
    setNewMilestone('');
    setAddingMileTo(null);
    fetchData();
  };

  const deleteGoal = async (goalId) => {
    await axios.delete(`/api/goals/${goalId}`);
    fetchData();
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const activeGoals = goals.filter(g => g.status === 'Active');
  const completedGoals = goals.filter(g => g.status === 'Completed');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2"><Target size={24} /> Goals</h1>
        <button onClick={() => setShowAdd(true)} className="p-2 bg-primary-light text-white rounded-full"><Plus size={20} /></button>
      </div>

      {showAdd && (
        <form className="card p-4 space-y-4" onSubmit={handleAdd}>
          <h3 className="font-medium">New Goal</h3>
          <input required value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} placeholder="Goal title (e.g., Run 5K)" className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 outline-none text-sm" />
          <textarea rows={2} value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} placeholder="Description (optional)" className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 outline-none text-sm resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value})} className="p-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 outline-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} className="p-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="0.1" value={newGoal.target_value} onChange={e => setNewGoal({...newGoal, target_value: e.target.value})} placeholder="Target (e.g., 5)" className="p-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 outline-none" />
            <input value={newGoal.unit} onChange={e => setNewGoal({...newGoal, unit: e.target.value})} placeholder="Unit (e.g., km)" className="p-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 outline-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-light text-white rounded-lg text-sm font-medium">Create Goal</button>
          </div>
        </form>
      )}

      {goals.length === 0 && !showAdd && (
        <div className="card p-8 text-center bg-slate-50 dark:bg-slate-800">
          <Trophy className="mx-auto mb-4 text-accent-light" size={32} />
          <p className="text-slate-500 mb-4">Set goals with deadlines and milestones. Track your progress.</p>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-primary-light text-white rounded-lg text-sm font-medium">Set First Goal</button>
        </div>
      )}

      {activeGoals.length > 0 && <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Goals</h2>}
      {activeGoals.map(g => {
        const progress = g.target_value ? Math.min(Math.round((g.current_value / g.target_value) * 100), 100) : 0;
        const expanded = expandedGoal === g.id;
        const milestoneDone = g.milestones.filter(m => m.completed).length;
        
        return (
          <div key={g.id} className="card overflow-hidden" style={{borderLeftColor: CATEGORY_COLORS[g.category], borderLeftWidth: '4px'}}>
            <div className="p-4 cursor-pointer" onClick={() => setExpandedGoal(expanded ? null : g.id)}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{g.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{g.category}</span>
                  </div>
                  {g.deadline && <div className="text-xs text-slate-400 mt-1">Due: {g.deadline}</div>}
                </div>
                <div className="flex items-center gap-2">
                  {g.target_value && <span className="text-sm font-bold text-primary-light">{progress}%</span>}
                  {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>

              {g.target_value > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-500" style={{width: `${progress}%`, backgroundColor: CATEGORY_COLORS[g.category]}}></div>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{g.current_value} / {g.target_value} {g.unit}</div>
                </div>
              )}
            </div>

            {expanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                {g.description && <p className="text-sm text-slate-500">{g.description}</p>}
                
                {g.target_value > 0 && (
                  <div className="flex gap-2 items-center">
                    <input type="number" step="0.1" defaultValue={g.current_value} className="w-24 p-1.5 border rounded text-sm dark:bg-slate-800 dark:border-slate-700 outline-none" onBlur={e => updateProgress(g.id, e.target.value)} />
                    <span className="text-xs text-slate-500">Update progress</span>
                  </div>
                )}

                {/* Milestones */}
                <div className="space-y-1.5">
                  <div className="text-xs text-slate-500 font-medium">Milestones ({milestoneDone}/{g.milestones.length})</div>
                  {g.milestones.map(ms => (
                    <div key={ms.id} onClick={() => toggleMilestone(ms.id)} className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm transition-all ${ms.completed ? 'bg-primary-light/5 line-through text-slate-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${ms.completed ? 'bg-primary-light border-primary-light text-white' : 'border-slate-300'}`}>
                        {ms.completed && '✓'}
                      </div>
                      {ms.title}
                    </div>
                  ))}
                  {addingMileTo === g.id ? (
                    <div className="flex gap-2">
                      <input autoFocus value={newMilestone} onChange={e => setNewMilestone(e.target.value)} placeholder="Milestone..." className="flex-1 p-1.5 border rounded text-sm dark:bg-slate-800 outline-none" onKeyDown={e => e.key === 'Enter' && addMilestone(g.id)} />
                      <button onClick={() => addMilestone(g.id)} className="px-3 py-1 bg-primary-light text-white rounded text-xs">Add</button>
                    </div>
                  ) : (
                    <button onClick={() => setAddingMileTo(g.id)} className="text-xs text-primary-light font-medium">+ Add Milestone</button>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button onClick={() => deleteGoal(g.id)} className="text-xs text-red-500 flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {completedGoals.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1"><Trophy size={14} /> Completed</h2>
          {completedGoals.map(g => (
            <div key={g.id} className="card p-4 opacity-60">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-accent-light" />
                <span className="font-medium line-through">{g.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-light/10 text-accent-light">Completed</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
