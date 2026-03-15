import { useState } from 'react';
import { useActivity } from '../hooks/useActivity';
import { format } from 'date-fns';
import { Plus, Check, PlayCircle, HeartPulse, Dumbbell, Zap, Loader2 } from 'lucide-react';
import useLongPress from '../hooks/useLongPress';

export default function Activity() {
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { types, logs, suggestions, loading, addType, toggleActivity, deleteType } = useActivity(date);
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState({ name: '', icon: 'Dumbbell', color_tag: 'teal', schedule_days: 'all' });

  const getIcon = (name, className="") => {
      switch(name) {
          case 'Dumbbell': return <Dumbbell className={className} />;
          case 'Zap': return <Zap className={className} />;
          case 'PlayCircle': return <PlayCircle className={className} />;
          default: return <HeartPulse className={className} />;
      }
  };

  const handleAdd = async (e) => {
      e.preventDefault();
      await addType(newType);
      setShowAdd(false);
      setNewType({ name: '', icon: 'Dumbbell', color_tag: 'teal', schedule_days: 'all' });
  };

  const handleDelete = async (id) => {
      if (window.confirm("Delete this activity type? This will remove all logs for it.")) {
          await deleteType(id);
      }
  };

  if (loading) return <div className="p-4 flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-primary-light" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Activity</h1>
          <button onClick={() => setShowAdd(true)} className="p-2 bg-primary-light text-white rounded-full hover:bg-primary-light/90 active:scale-95 transition-all">
              <Plus size={20} />
          </button>
      </div>

      {showAdd && (
          <form className="card p-5 space-y-4 animate-in slide-in-from-top-4 duration-300" onSubmit={handleAdd}>
              <h3 className="font-semibold text-lg">New Activity Type</h3>
              
              <datalist id="activity-suggestions">
                  {suggestions.map(s => <option key={s} value={s} />)}
              </datalist>

              <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Activity Name</label>
                  <input required list="activity-suggestions" placeholder="e.g., Weightlifting" value={newType.name} onChange={e => setNewType({...newType, name: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Icon</label>
                    <select value={newType.icon} onChange={e => setNewType({...newType, icon: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all">
                        <option value="Dumbbell">Weights (Dumbbell)</option>
                        <option value="HeartPulse">Cardio (Heart)</option>
                        <option value="Zap">High Intensity (Zap)</option>
                        <option value="PlayCircle">Video/Class (Play)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Color</label>
                    <select value={newType.color_tag} onChange={e => setNewType({...newType, color_tag: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all">
                        <option value="teal">Teal</option>
                        <option value="amber">Amber</option>
                        <option value="blue">Blue</option>
                    </select>
                  </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2.5 text-sm font-semibold text-slate-600">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-primary-light text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-light/20 hover:opacity-90">Create Type</button>
              </div>
          </form>
      )}

      {types.length === 0 && !showAdd && (
          <div className="card p-10 text-center bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 mb-6 font-medium">Tracking activities helps identify patterns. Define your workout types here.</p>
              <button onClick={() => setShowAdd(true)} className="px-6 py-2.5 bg-primary-light text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-light/20">Add My First Activity</button>
          </div>
      )}

      <div className="grid gap-3">
          {types.map(t => (
            <ActivityItem 
              key={t.id} 
              type={t} 
              log={logs[t.id]} 
              onToggle={() => toggleActivity(t.id, logs[t.id])} 
              onDelete={() => handleDelete(t.id)} 
              getIcon={getIcon}
            />
          ))}
      </div>
    </div>
  )
}

function ActivityItem({ type, log, onToggle, onDelete, getIcon }) {
    const checked = log ? log.done : false;
    const longPressProps = useLongPress(
        () => onDelete(),
        () => onToggle(),
        { delay: 800 }
    );

    return (
        <div 
            {...longPressProps}
            className={`card p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all select-none border-2 ${
                checked ? 'border-primary-light/20 bg-primary-light/5' : 'border-transparent'
            }`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-all duration-300 ${
                    checked ? 'bg-primary-light text-white shadow-lg shadow-primary-light/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                    {checked ? <Check size={20} className="animate-in zoom-in duration-300" /> : getIcon(type.icon, "w-5 h-5")}
                </div>
                <div>
                    <div className={`font-semibold transition-all ${checked ? 'text-primary-light' : 'text-slate-700 dark:text-slate-200'}`}>{type.name}</div>
                    {checked && log?.duration_min && (
                        <div className="text-xs text-slate-500 font-medium">{log.duration_min} mins • {log.intensity || 'Normal'}</div>
                    )}
                </div>
            </div>
        </div>
    );
}