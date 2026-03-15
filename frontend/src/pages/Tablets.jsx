import { useState } from 'react';
import { useTablets } from '../hooks/useTablets';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

export default function Tablets() {
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { tablets, logs, logTablet, addTablet, loading } = useTablets(date);
  const [showAdd, setShowAdd] = useState(false);
  const [newTab, setNewTab] = useState({ name: '', dose: '', frequency: 'Daily', timing: 'Morning', critical: false, reminder_time: '' });

  const timings = ["Morning", "Afternoon", "Evening", "Night"];

  const handleAdd = async (e) => {
      e.preventDefault();
      await addTablet(newTab);
      setShowAdd(false);
      setNewTab({ name: '', dose: '', frequency: 'Daily', timing: 'Morning', critical: false, reminder_time: '' });
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
    
    // Late if more than 60 mins past scheduled time
    const isLate = diffMins > 60;
    
    // Missed if it's past midnight of that day, or for simplicity here, if it's > 4 hours late
    const isMissed = diffMins > 240; 
    
    return { isLate, isMissed };
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const grouped = timings.map(t => ({
      timing: t,
      tabs: tablets.filter(tab => tab.timing === t)
  })).filter(g => g.tabs.length > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Tablets</h1>
          <button onClick={() => setShowAdd(true)} className="p-2 bg-primary-light text-white rounded-full">
              <Plus size={20} />
          </button>
      </div>

      {tablets.length === 0 && !showAdd && (
          <div className="card p-8 text-center bg-slate-50 dark:bg-slate-800">
              <p className="text-slate-500 mb-4">No tablets configured yet.</p>
              <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-primary-light text-whiterounded-lg text-sm font-medium">Add First Tablet</button>
          </div>
      )}

      {showAdd && (
          <form className="card p-4 space-y-4" onSubmit={handleAdd}>
              <h3 className="font-medium">Add Tablet</h3>
              
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

              <div>
                  <input required list="tablet-suggestions" placeholder="Name (e.g., Metformin)" value={newTab.name} onChange={e => setNewTab({...newTab, name: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Dose (e.g., 500mg)" value={newTab.dose} onChange={e => setNewTab({...newTab, dose: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none" />
                  <select value={newTab.timing} onChange={e => setNewTab({...newTab, timing: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none">
                      {timings.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
              </div>
              <div>
                  <label className="text-xs text-slate-500 mb-1 block">Reminder Time</label>
                  <input type="time" required value={newTab.reminder_time} onChange={e => setNewTab({...newTab, reminder_time: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none" />
              </div>
              <div className="flex items-center space-x-2">
                  <input type="checkbox" checked={newTab.critical} onChange={e => setNewTab({...newTab, critical: e.target.checked})} id="crit" />
                  <label htmlFor="crit" className="text-sm">Critical Medication (2x score)</label>
              </div>
              <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-light text-white rounded-md text-sm">Save</button>
              </div>
          </form>
      )}

      {grouped.map(group => (
          <div key={group.timing} className="space-y-3">
              <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{group.timing}</h2>
              {group.tabs.map(tab => {
                  let status = logs[tab.id] || null;
                  const { isLate, isMissed } = checkTimeStatus(tab.reminder_time);
                  
                  // Auto-fail if genuinely missed and not logged
                  let displayStatus = status;
                  if (!status) {
                    if (isMissed) displayStatus = 'Missed';
                    else if (isLate) displayStatus = 'Late';
                  }

                  return (
                      <div key={tab.id} className="card p-4 flex items-center justify-between cursor-pointer active:scale-95 transition-transform" onClick={() => handleStatusClick(tab.id, status, isLate, isMissed)}>
                          <div>
                              <div className="font-medium flex items-center gap-2">
                                  {tab.name}
                                  {tab.critical && <span className="w-2 h-2 rounded-full bg-accent-light dark:bg-accent-dark"></span>}
                              </div>
                              <div className="text-xs text-slate-500">{tab.dose} • {tab.frequency} {tab.reminder_time ? `• ${tab.reminder_time}` : ''}</div>
                          </div>
                          <div className={`text-sm font-medium px-3 py-1 rounded-full border ${
                              displayStatus === 'Taken' ? 'bg-primary-light/10 text-primary-light border-primary-light/30' :
                              displayStatus === 'Missed' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                              (displayStatus === 'Taken late' || displayStatus === 'Late') ? 'bg-accent-light/10 text-accent-light border-accent-light/30' :
                              'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                          }`}>
                              {displayStatus || 'Pending'}
                          </div>
                      </div>
                  );
              })}
          </div>
      ))}
    </div>
  )
}