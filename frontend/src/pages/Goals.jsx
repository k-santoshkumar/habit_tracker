import { useState, useEffect } from 'react';
import { Plus, Target, Trophy, ChevronDown, ChevronUp, Loader2, CheckCircle2 } from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import useLongPress from '../hooks/useLongPress';

export default function Goals() {
  const { goals, categories, loading, addGoal, deleteGoal, updateProgress, toggleMilestone, addMilestone } = useGoals();
  const [showAdd, setShowAdd] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', category: 'General', target_value: '', unit: '', deadline: '' });
  const [newMilestone, setNewMilestone] = useState('');
  const [addingMileTo, setAddingMileTo] = useState(null);

  const CATEGORY_COLORS = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.color;
    return acc;
  }, {});

  const handleAdd = async (e) => {
    e.preventDefault();
    await addGoal({
      ...newGoal,
      target_value: newGoal.target_value ? parseFloat(newGoal.target_value) : null
    });
    setShowAdd(false);
    setNewGoal({ title: '', description: '', category: 'General', target_value: '', unit: '', deadline: '' });
  };

  const handleAddMilestone = async (goalId) => {
    if (!newMilestone.trim()) return;
    await addMilestone(goalId, newMilestone);
    setNewMilestone('');
    setAddingMileTo(null);
  };

  const handleDelete = async (id) => {
      if (window.confirm("Delete this goal and all its data?")) {
          await deleteGoal(id);
      }
  };

  const activeGoals = goals.filter(g => g.status === 'Active');
  const completedGoals = goals.filter(g => g.status === 'Completed');
  
  if (loading) return <div className="p-4 flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-primary-light" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">Goals</h1>
        <button onClick={() => setShowAdd(true)} className="p-2 bg-primary-light text-white rounded-full hover:bg-primary-light/90 active:scale-95 transition-all">
            <Plus size={20} />
        </button>
      </div>

      {showAdd && (
        <form className="card p-5 space-y-4 animate-in slide-in-from-top-4 duration-300" onSubmit={handleAdd}>
          <h3 className="font-semibold text-lg">New Goal</h3>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</label>
            <input required value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} placeholder="e.g., Run 5K" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
            <textarea rows={2} value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} placeholder="Optional description..." className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
              <select value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all text-sm">
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline</label>
              <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Value</label>
              <input type="number" step="0.1" value={newGoal.target_value} onChange={e => setNewGoal({...newGoal, target_value: e.target.value})} placeholder="e.g., 5" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit</label>
              <input value={newGoal.unit} onChange={e => setNewGoal({...newGoal, unit: e.target.value})} placeholder="e.g., km" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-500">Cancel</button>
            <button type="submit" className="px-7 py-2.5 bg-primary-light text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-light/20">Set Goal</button>
          </div>
        </form>
      )}

      {goals.length === 0 && !showAdd && (
        <div className="card p-10 text-center bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-accent-light/10 text-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Target size={32} />
          </div>
          <p className="text-slate-500 mb-6 font-medium">Big dreams start with clear goals. Break them down into milestones.</p>
          <button onClick={() => setShowAdd(true)} className="px-6 py-2.5 bg-primary-light text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-light/20">Set My First Goal</button>
        </div>
      )}

      <div className="grid gap-4">
        {activeGoals.map(g => (
          <GoalItem 
            key={g.id} 
            goal={g} 
            CATEGORY_COLORS={CATEGORY_COLORS} 
            expanded={expandedGoal === g.id}
            onToggleExpand={() => setExpandedGoal(expandedGoal === g.id ? null : g.id)}
            onDelete={() => handleDelete(g.id)}
            updateProgress={updateProgress}
            toggleMilestone={toggleMilestone}
            addingMileTo={addingMileTo}
            setAddingMileTo={setAddingMileTo}
            newMilestone={newMilestone}
            setNewMilestone={setNewMilestone}
            handleAddMilestone={handleAddMilestone}
          />
        ))}
      </div>

      {completedGoals.length > 0 && (
        <div className="mt-8 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
            <Trophy size={14} className="text-accent-light" /> Completed
          </h2>
          <div className="grid gap-3 opacity-70">
            {completedGoals.map(g => (
              <div key={g.id} className="card p-4 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50 grayscale hover:grayscale-0 transition-all border-dashed">
                <div className="w-10 h-10 rounded-full bg-accent-light/10 flex items-center justify-center text-accent-light">
                   <Trophy size={20} />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 line-through">{g.title}</span>
                  <div className="text-[10px] font-bold text-accent-light uppercase">Achieved</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GoalItem({ 
    goal, CATEGORY_COLORS, expanded, onToggleExpand, onDelete, updateProgress, 
    toggleMilestone, addingMileTo, setAddingMileTo, newMilestone, setNewMilestone, handleAddMilestone 
}) {
    const progress = goal.target_value ? Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100) : 0;
    const milestoneDone = goal.milestones.filter(m => m.completed).length;
    
    const longPressProps = useLongPress(
        () => onDelete(),
        () => onToggleExpand(),
        { delay: 800 }
    );

    return (
        <div 
            {...longPressProps}
            className={`card overflow-hidden transition-all duration-300 border-l-4 ${expanded ? 'ring-2 ring-primary-light/20 shadow-xl' : ''}`} 
            style={{borderLeftColor: CATEGORY_COLORS[goal.category]}}
        >
            <div className="p-5 cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold transition-colors ${expanded ? 'text-primary-light' : 'text-slate-800 dark:text-slate-100'}`}>{goal.title}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-tighter">{goal.category}</span>
                  </div>
                  {goal.deadline && <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">Due: {goal.deadline}</div>}
                </div>
                <div className="flex items-center gap-3">
                  {goal.target_value > 0 && (
                    <div className="text-right">
                        <div className="text-lg font-black text-primary-light">{progress}%</div>
                    </div>
                  )}
                  {expanded ? <ChevronUp size={18} className="text-slate-300" /> : <ChevronDown size={18} className="text-slate-300" />}
                </div>
              </div>

              {goal.target_value > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{width: `${progress}%`, backgroundColor: CATEGORY_COLORS[goal.category]}}></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{goal.current_value} / {goal.target_value} {goal.unit}</div>
                  </div>
                </div>
              )}
            </div>

            {expanded && (
              <div className="px-5 pb-5 space-y-5 animate-in slide-in-from-top-2 duration-300 border-t border-slate-50 dark:border-slate-800 pt-5 bg-slate-50/30 dark:bg-slate-900/10">
                {goal.description && <p className="text-sm text-slate-500 leading-relaxed font-medium">{goal.description}</p>}
                
                {goal.target_value > 0 && (
                  <div className="flex gap-4 items-center p-3 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <input type="number" step="0.1" defaultValue={goal.current_value} className="w-20 p-2 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-lg text-sm font-bold outline-none focus:border-primary-light" onBlur={e => updateProgress(goal.id, e.target.value)} />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current {goal.unit || 'Value'}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Milestones</div>
                    <div className="text-[10px] font-black text-primary-light uppercase bg-primary-light/10 px-2 py-0.5 rounded shadow-sm">{milestoneDone} / {goal.milestones.length}</div>
                  </div>
                  
                  <div className="grid gap-2">
                    {goal.milestones.map(ms => (
                        <div key={ms.id} onClick={() => toggleMilestone(ms.id)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${ms.completed ? 'bg-primary-light/5 border-primary-light/10' : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-100 dark:hover:border-slate-700'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${ms.completed ? 'bg-primary-light border-primary-light text-white' : 'border-slate-200 dark:border-slate-700'}`}>
                            {ms.completed && <CheckCircle2 size={12} className="animate-in zoom-in duration-300" />}
                        </div>
                        <span className={`text-sm font-semibold transition-all ${ms.completed ? 'text-slate-400 line-through decoration-primary-light/30' : 'text-slate-700 dark:text-slate-200'}`}>{ms.title}</span>
                        </div>
                    ))}
                  </div>

                  {addingMileTo === goal.id ? (
                    <div className="flex gap-2 p-1 animate-in slide-in-from-left-2 duration-200">
                      <input autoFocus value={newMilestone} onChange={e => setNewMilestone(e.target.value)} placeholder="Milestone name..." className="flex-1 p-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-primary-light" onKeyDown={e => e.key === 'Enter' && handleAddMilestone(goal.id)} />
                      <button onClick={() => handleAddMilestone(goal.id)} className="px-4 bg-primary-light text-white rounded-xl text-xs font-bold shadow-md shadow-primary-light/10">Add</button>
                    </div>
                  ) : (
                    <button onClick={() => setAddingMileTo(goal.id)} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-primary-light/30 hover:text-primary-light transition-all">+ Add Milestone</button>
                  )}
                </div>
              </div>
            )}
        </div>
    );
}
