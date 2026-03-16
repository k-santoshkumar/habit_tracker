import { useState, useRef, useEffect } from 'react';
import { useActivity } from '../hooks/useActivity';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { Plus, Check, PlayCircle, HeartPulse, Dumbbell, Zap, Loader2, ChevronLeft, ChevronRight, MoreHorizontal, Footprints, Droplets, BookOpen, Moon } from 'lucide-react';
import useLongPress from '../hooks/useLongPress';

export default function Activity() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { types, logs, suggestions, loading, addType, toggleActivity, deleteType } = useActivity(dateStr);
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState({ name: '', icon: 'Dumbbell', color_tag: 'teal', schedule_days: 'all' });
  
  const scrollRef = useRef(null);

  // Generate 14 days around today
  const dates = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i - 3));

  const getIcon = (name, className="") => {
      switch(name) {
          case 'Walking': return <Footprints className={className} />;
          case 'Water': return <Droplets className={className} />;
          case 'Reading': return <BookOpen className={className} />;
          case 'Sleeping': return <Moon className={className} />;
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
      if (window.confirm("Delete this activity type?")) {
          await deleteType(id);
      }
  };

  if (loading) return <div className="p-4 flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-24">
      
      {/* Header */}
      <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
              <button className="p-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500">
                  <ChevronLeft size={18} />
              </button>
              <h1 className="text-xl font-bold">Activity</h1>
          </div>
          <button className="p-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500">
              <MoreHorizontal size={18} />
          </button>
      </div>

      {/* Date Picker */}
      <div className="py-2">
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-500">{format(selectedDate, 'MMMM, yyyy')}</h2>
              <div className="flex gap-1">
                  <button className="p-1 text-slate-400"><ChevronLeft size={16} /></button>
                  <button className="p-1 text-slate-400"><ChevronRight size={16} /></button>
              </div>
          </div>
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1 sm:px-4 mask-fade-right">
              {dates.map((d, idx) => {
                  const isSelected = isSameDay(d, selectedDate);
                  return (
                      <button 
                        key={idx}
                        onClick={() => setSelectedDate(d)}
                        className={`flex flex-col items-center min-w-[54px] py-3 rounded-[20px] transition-all ${
                            isSelected ? 'bg-primary text-white shadow-active' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                          <span className={`text-[11px] font-bold ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                              {format(d, 'dd')}
                          </span>
                          <span className="text-xs font-black uppercase tracking-tighter">
                              {format(d, 'EEE')}
                          </span>
                          {isSelected && <div className="w-1 h-1 bg-white rounded-full mt-1 animate-pulse"></div>}
                      </button>
                  );
              })}
          </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
          <h3 className="section-title">Categories</h3>
          <div className="grid grid-cols-2 gap-4">
              {types.slice(0, 4).map(t => (
                  <CategoryCard 
                    key={t.id} 
                    type={t} 
                    log={logs[t.id]} 
                    getIcon={getIcon} 
                    onToggle={() => toggleActivity(t.id, logs[t.id])} 
                  />
              ))}
              {types.length < 4 && (
                  <button onClick={() => setShowAdd(true)} className="card aspect-square flex flex-col items-center justify-center border-dashed border-2 text-slate-300 hover:text-primary hover:border-primary transition-all gap-2">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl"><Plus size={24} /></div>
                      <span className="text-[10px] font-bold uppercase">Add New</span>
                  </button>
              )}
          </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
              <h3 className="section-title">Your tasks</h3>
              <button className="text-[10px] font-bold text-primary uppercase">View all</button>
          </div>
          <div className="space-y-3">
              {types.length === 0 && (
                  <div className="card p-8 text-center text-slate-400 italic text-sm">No tasks defined for this date.</div>
              )}
              {types.map(t => (
                  <TaskItem 
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

      {/* Add Form Portal */}
      {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowAdd(false)}>
              <form className="card w-full max-w-sm p-6 space-y-5 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()} onSubmit={handleAdd}>
                  <h3 className="text-xl font-bold">New Category</h3>
                  <div className="space-y-1.5">
                      <input required autoFocus placeholder="Category name" value={newType.name} onChange={e => setNewType({...newType, name: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-3 font-bold text-slate-400">Cancel</button>
                      <button type="submit" className="btn-primary">Create</button>
                  </div>
              </form>
          </div>
      )}
    </div>
  )
}

function CategoryCard({ type, log, getIcon, onToggle }) {
    const checked = log ? log.done : false;
    return (
        <div onClick={onToggle} className={`card p-5 cursor-pointer flex flex-col justify-between aspect-square transition-all active:scale-95 ${checked ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
            <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl ${checked ? 'bg-primary text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                    {getIcon(type.name, "size-5")}
                </div>
                <div className="flex items-center gap-0.5">
                   <div className="text-[10px] font-bold text-slate-300">↑</div>
                   <div className="text-[10px] font-black text-slate-400">0.0%</div>
                </div>
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400">{type.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-xl font-black">{log?.duration_min || 0}m</p>
                </div>
            </div>
        </div>
    );
}

function TaskItem({ type, log, onToggle, onDelete, getIcon }) {
    const checked = log ? log.done : false;
    const longPressProps = useLongPress(
        () => onDelete(),
        () => onToggle(),
        { delay: 800 }
    );

    return (
        <div 
            {...longPressProps}
            className={`card p-4 flex items-center justify-between transition-all active:scale-[0.98] ${checked ? 'bg-slate-50/50 dark:bg-slate-800/50 grayscale' : ''}`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${checked ? 'bg-slate-100 dark:bg-slate-800 text-slate-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                    {getIcon(type.name, "size-5")}
                </div>
                <div>
                    <div className={`font-bold text-sm ${checked ? 'text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>{type.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{checked ? 'Completed' : 'Upcoming at 08:00 AM'}</div>
                </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                checked ? 'bg-primary border-primary text-white' : 'border-slate-200 dark:border-slate-700'
            }`}>
                {checked && <Check size={14} className="animate-in zoom-in duration-300" />}
            </div>
        </div>
    );
}