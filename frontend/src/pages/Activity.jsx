import { useState } from 'react';
import { useActivity } from '../hooks/useActivity';
import { format } from 'date-fns';
import { Plus, Check, PlayCircle, HeartPulse, Dumbbell, Zap } from 'lucide-react';

export default function Activity() {
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { types, logs, loading, addType, toggleActivity } = useActivity(date);
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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Activity</h1>
          <button onClick={() => setShowAdd(true)} className="p-2 bg-primary-light text-white rounded-full">
              <Plus size={20} />
          </button>
      </div>

      {showAdd && (
          <form className="card p-4 space-y-4" onSubmit={handleAdd}>
              <h3 className="font-medium">New Activity Type</h3>
              
              <datalist id="activity-suggestions">
                <option value="Weightlifting" />
                <option value="Running" />
                <option value="Cycling" />
                <option value="Swimming" />
                <option value="Yoga" />
                <option value="Pilates" />
                <option value="HIIT" />
                <option value="Walking" />
                <option value="Hiking" />
                <option value="Rowing" />
                <option value="Stretching" />
                <option value="Meditation" />
                <option value="Jump Rope" />
                <option value="Basketball" />
                <option value="Tennis" />
                <option value="Football" />
                <option value="Dancing" />
                <option value="Martial Arts" />
                <option value="Climbing" />
                <option value="Boxing" />
                <option value="Gymnastics" />
                <option value="Elliptical" />
                <option value="Stair Stepper" />
                <option value="Zumba" />
                <option value="Aerobics" />
              </datalist>

              <div>
                  <input required list="activity-suggestions" placeholder="Name (e.g., Weightlifting)" value={newType.name} onChange={e => setNewType({...newType, name: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <select value={newType.icon} onChange={e => setNewType({...newType, icon: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none">
                      <option value="Dumbbell">Weights (Dumbbell)</option>
                      <option value="HeartPulse">Cardio (Heart)</option>
                      <option value="Zap">High Intensity (Zap)</option>
                      <option value="PlayCircle">Video/Class (Play)</option>
                  </select>
                  <select value={newType.color_tag} onChange={e => setNewType({...newType, color_tag: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none">
                      <option value="teal">Teal</option>
                      <option value="amber">Amber</option>
                      <option value="blue">Blue</option>
                  </select>
              </div>
              <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-light text-white rounded-md text-sm">Save</button>
              </div>
          </form>
      )}

      {types.length === 0 && !showAdd && (
          <div className="card p-8 text-center bg-slate-50 dark:bg-slate-800">
              <p className="text-slate-500 mb-4">No activity types defined.</p>
          </div>
      )}

      <div className="space-y-3">
          {types.map(t => {
              const log = logs[t.id];
              const checked = log ? log.done : false;
              
              const colorBase = t.color_tag === 'amber' ? 'text-accent-light' : t.color_tag === 'blue' ? 'text-blue-500' : 'text-primary-light';
              
              return (
                  <div key={t.id} className="card p-4 flex items-center justify-between cursor-pointer active:scale-95 transition-transform" onClick={() => toggleActivity(t.id, log)}>
                      <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${checked ? 'bg-primary-light dark:bg-primary-dark text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                              {checked ? <Check size={20} /> : getIcon(t.icon, "w-5 h-5")}
                          </div>
                          <div>
                              <div className="font-medium">{t.name}</div>
                              {checked && log?.duration_min && (
                                  <div className="text-xs text-slate-500">{log.duration_min} mins • {log.intensity || 'Normal'}</div>
                              )}
                          </div>
                      </div>
                  </div>
              );
          })}
      </div>
    </div>
  )
}