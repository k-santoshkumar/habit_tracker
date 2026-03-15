import { useState } from 'react';
import { useTablets } from '../hooks/useTablets';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import useLongPress from '../hooks/useLongPress';

export default function Tablets() {
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { tablets, logs, timings, logTablet, addTablet, deleteTablet, loading } = useTablets(date);
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [newTab, setNewTab] = useState({ name: '', dose: '', frequency: 'Daily', timing: 'Morning', critical: false, reminder_time: '' });

  const handleAdd = async (e) => {
      e.preventDefault();
      await addTablet(newTab);
      setShowAdd(false);
      setNewTab({ name: '', dose: '', frequency: 'Daily', timing: 'Morning', critical: false, reminder_time: '' });
  };

  const handleDelete = async (id) => {
      if (window.confirm("Delete this tablet? This will remove all its history.")) {
          await deleteTablet(id);
      }
      setDeletingId(null);
  };

  const handleStatusClick = (tabletId, currentStatus, isLate, isMissed) => {
      // Auto-determine next logical status based on time
      let nextStatus = "Taken";
      if (currentStatus === "Taken" || currentStatus === "Taken late") {
        nextStatus = "Missed";
      } else if (currentStatus === "Missed") {
        nextStatus = isLate ? "Taken late" : "Taken";
      } else {
        // From pending
        nextStatus = isLate ? "Taken late" : "Taken";
      }
      logTablet(tabletId, nextStatus);
  };

  const checkTimeStatus = (reminderTimeStr) => {
    if (!reminderTimeStr || date !== format(new Date(), 'yyyy-MM-dd')) return { isLate: false, isMissed: false };
    
    const now = new Date();
    const [hours, mins] = reminderTimeStr.split(':').map(Number);
    
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, mins, 0, 0);
    
    const diffMins = (now - scheduledTime) / (1000 * 60);
    
    const isLate = diffMins > 60;
    const isMissed = diffMins > 240; 
    
    return { isLate, isMissed };
  };

  if (loading) return <div className="p-4 flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-primary-light border-t-transparent rounded-full animate-spin"></div></div>;

  const grouped = timings.map(t => ({
      timing: t,
      tabs: tablets.filter(tab => tab.timing === t)
  })).filter(g => g.tabs.length > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Tablets</h1>
          <button onClick={() => setShowAdd(true)} className="p-2 bg-primary-light text-white rounded-full hover:bg-primary-light/90 active:scale-95 transition-all">
              <Plus size={20} />
          </button>
      </div>

      {tablets.length === 0 && !showAdd && (
          <div className="card p-8 text-center bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 mb-4">No tablets configured yet.</p>
              <button onClick={() => setShowAdd(true)} className="px-6 py-2 bg-primary-light text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-light/20">Add First Tablet</button>
          </div>
      )}

      {showAdd && (
          <form className="card p-5 space-y-4 animate-in slide-in-from-top-4 duration-300" onSubmit={handleAdd}>
              <h3 className="font-semibold text-lg">Add Medication</h3>
              
              <datalist id="tablet-suggestions">
                <option value="Metformin" />
                <option value="Amlodipine" />
                <option value="Thyronorm" />
                <option value="Tacrolimus" />
                <option value="Pantoprazole" />
                <option value="Atorvastatin" />
                <option value="Aspirin" />
                <option value="Vitamin D" />
                <option value="Calcium" />
                <option value="Metoprolol" />
                <option value="Lisinopril" />
                <option value="Levothyroxine" />
                <option value="Simvastatin" />
                <option value="Omeprazole" />
                <option value="Losartan" />
                <option value="Albuterol" />
                <option value="Gabapentin" />
                <option value="Hydrochlorothiazide" />
                <option value="Sertraline" />
                <option value="Furosemide" />
                <option value="Montelukast" />
                <option value="Amoxicillin" />
                <option value="Rosuvastatin" />
                <option value="Escitalopram" />
                <option value="Trazodone" />
              </datalist>

              <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Medication Name</label>
                  <input required list="tablet-suggestions" placeholder="e.g., Metformin" value={newTab.name} onChange={e => setNewTab({...newTab, name: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Dosage</label>
                    <input required placeholder="500mg" value={newTab.dose} onChange={e => setNewTab({...newTab, dose: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Timing</label>
                    <select value={newTab.timing} onChange={e => setNewTab({...newTab, timing: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all">
                        {timings.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
              </div>
              <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Daily Reminder Time</label>
                  <input type="time" required value={newTab.reminder_time} onChange={e => setNewTab({...newTab, reminder_time: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all" />
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <input type="checkbox" className="w-5 h-5 accent-primary-light" checked={newTab.critical} onChange={e => setNewTab({...newTab, critical: e.target.checked})} id="crit" />
                  <label htmlFor="crit" className="text-sm font-medium">Mark as Critical Medication</label>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2.5 text-sm font-semibold text-slate-600">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-primary-light text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-light/20 hover:opacity-90">Save Tablet</button>
              </div>
          </form>
      )}

      {grouped.map(group => (
          <div key={group.timing} className="space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[2px] px-1">{group.timing}</h2>
              {group.tabs.map(tab => {
                  let status = logs[tab.id] || null;
                  const { isLate, isMissed } = checkTimeStatus(tab.reminder_time);
                  
                  let displayStatus = status;
                  if (!status) {
                    if (isMissed) displayStatus = 'Missed';
                    else if (isLate) displayStatus = 'Late';
                  }

                  return (
                      <TabletItem 
                        key={tab.id} 
                        tab={tab} 
                        status={status} 
                        displayStatus={displayStatus} 
                        isLate={isLate} 
                        isMissed={isMissed}
                        onToggle={() => handleStatusClick(tab.id, status, isLate, isMissed)}
                        onLongPress={() => handleDelete(tab.id)}
                      />
                  );
              })}
          </div>
      ))}
    </div>
  )
}

function TabletItem({ tab, status, displayStatus, isLate, isMissed, onToggle, onLongPress }) {
    const longPressProps = useLongPress(
        () => onLongPress(),
        () => onToggle(),
        { delay: 800 }
    );

    return (
        <div 
            {...longPressProps}
            className="card p-4 flex items-center justify-between cursor-pointer active:scale-95 transition-transform select-none relative overflow-hidden"
        >
            <div className="flex-1">
                <div className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    {tab.name}
                    {tab.critical && <span className="flex h-2 w-2 rounded-full bg-accent-light animate-pulse"></span>}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                    {tab.dose} • {tab.frequency} {tab.reminder_time ? `• ${tab.reminder_time}` : ''}
                </div>
            </div>
            
            <div className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border-2 transition-colors ${
                displayStatus === 'Taken' ? 'bg-primary-light/10 text-primary-light border-primary-light/20 shadow-sm shadow-primary-light/5' :
                displayStatus === 'Missed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                (displayStatus === 'Taken late' || displayStatus === 'Late') ? 'bg-accent-light/10 text-accent-light border-accent-light/20' :
                'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
            }`}>
                {displayStatus || 'Pending'}
            </div>
        </div>
    );
}