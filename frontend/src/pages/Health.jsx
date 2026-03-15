import { useState } from 'react';
import { useHealth } from '../hooks/useHealth';
import { format } from 'date-fns';
import { Plus, Activity as ActivityIcon, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const HEALTH_PRESETS = [
  { name: 'Weight', unit: 'kg', min_range: 40, max_range: 150 },
  { name: 'Blood Pressure (Systolic)', unit: 'mmHg', min_range: 90, max_range: 140 },
  { name: 'Blood Pressure (Diastolic)', unit: 'mmHg', min_range: 60, max_range: 90 },
  { name: 'Heart Rate (Resting)', unit: 'bpm', min_range: 50, max_range: 100 },
  { name: 'Blood Sugar (Fasting)', unit: 'mg/dL', min_range: 70, max_range: 110 },
  { name: 'Blood Sugar (Post-meal)', unit: 'mg/dL', min_range: 70, max_range: 180 },
  { name: 'HbA1c', unit: '%', min_range: 4.0, max_range: 6.5 },
  { name: 'Cholesterol (Total)', unit: 'mg/dL', min_range: 100, max_range: 200 },
  { name: 'HDL Cholesterol', unit: 'mg/dL', min_range: 40, max_range: 80 },
  { name: 'LDL Cholesterol', unit: 'mg/dL', min_range: 50, max_range: 130 },
  { name: 'Triglycerides', unit: 'mg/dL', min_range: 50, max_range: 150 },
  { name: 'BMI', unit: 'kg/m2', min_range: 18.5, max_range: 25 },
  { name: 'Body Fat', unit: '%', min_range: 8, max_range: 30 },
  { name: 'Waist Circumference', unit: 'cm', min_range: 60, max_range: 100 },
  { name: 'SpO2', unit: '%', min_range: 95, max_range: 100 },
  { name: 'Temperature', unit: 'F', min_range: 97, max_range: 99.5 },
  { name: 'Creatinine', unit: 'mg/dL', min_range: 0.6, max_range: 1.2 },
  { name: 'Hemoglobin', unit: 'g/dL', min_range: 12, max_range: 17 },
  { name: 'Vitamin D', unit: 'ng/mL', min_range: 30, max_range: 80 },
  { name: 'TSH', unit: 'mIU/L', min_range: 0.4, max_range: 4.0 },
];

export default function Health() {
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { metrics, entries, loading, addMetric, logEntry } = useHealth();
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [metricSearch, setMetricSearch] = useState('');
  const [presetSelected, setPresetSelected] = useState(false);
  const [newMetric, setNewMetric] = useState({ name: '', unit: '', min_range: '', max_range: '' });
  
  const [showAddEntry, setShowAddEntry] = useState(null);
  const [newEntryVal, setNewEntryVal] = useState('');

  const filteredPresets = metricSearch
    ? HEALTH_PRESETS.filter(p => p.name.toLowerCase().includes(metricSearch.toLowerCase()))
    : HEALTH_PRESETS;

  const handleSelectPreset = (preset) => {
    setNewMetric({
      name: preset.name,
      unit: preset.unit,
      min_range: preset.min_range.toString(),
      max_range: preset.max_range.toString()
    });
    setMetricSearch(preset.name);
    setPresetSelected(true);
  };

  const handleAddMetric = async (e) => {
      e.preventDefault();
      await addMetric({
          name: newMetric.name,
          unit: newMetric.unit,
          min_range: newMetric.min_range ? parseFloat(newMetric.min_range) : null,
          max_range: newMetric.max_range ? parseFloat(newMetric.max_range) : null
      });
      setShowAddMetric(false);
      setNewMetric({ name: '', unit: '', min_range: '', max_range: '' });
      setMetricSearch('');
      setPresetSelected(false);
  };

  const handleAddEntry = async (e, metricId) => {
      e.preventDefault();
      await logEntry({ date, metric_id: metricId, value: parseFloat(newEntryVal) });
      setShowAddEntry(null);
      setNewEntryVal('');
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Health Metrics</h1>
          <button onClick={() => setShowAddMetric(true)} className="p-2 bg-primary-light text-white rounded-full">
              <Plus size={20} />
          </button>
      </div>

      {showAddMetric && (
          <form className="card p-4 space-y-4" onSubmit={handleAddMetric}>
              <h3 className="font-medium">Add Health Metric</h3>
              
              {/* Search presets */}
              <div>
                  <label className="block text-xs text-slate-500 mb-2 font-medium">Search or type a metric</label>
                  <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                          type="text"
                          placeholder="Search metrics (e.g., Blood Pressure, Weight...)"
                          value={metricSearch}
                          onChange={e => {
                              setMetricSearch(e.target.value);
                              setNewMetric({ ...newMetric, name: e.target.value });
                              setPresetSelected(false);
                          }}
                          className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 outline-none text-sm"
                      />
                  </div>
                  
                  {/* Preset dropdown */}
                  {filteredPresets.length > 0 && !presetSelected && (
                      <div className="mt-2 border rounded-lg overflow-hidden dark:border-slate-700 max-h-48 overflow-y-auto">
                          {filteredPresets.slice(0, 8).map((preset, i) => (
                              <div
                                  key={i}
                                  onClick={() => handleSelectPreset(preset)}
                                  className="flex justify-between items-center px-3 py-2.5 cursor-pointer transition-colors text-sm border-b last:border-b-0 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                              >
                                  <span className="font-medium">{preset.name}</span>
                                  <span className="text-xs text-slate-400">{preset.unit} ({preset.min_range}-{preset.max_range})</span>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* Auto-filled fields */}
              <div className="grid grid-cols-3 gap-3">
                  <div>
                      <label className="block text-xs text-slate-500 mb-1">Unit</label>
                      <input required placeholder="e.g., mmHg" value={newMetric.unit} onChange={e => setNewMetric({...newMetric, unit: e.target.value})} className="w-full p-2 border rounded-md text-sm dark:bg-slate-800 dark:border-slate-700 outline-none" />
                  </div>
                  <div>
                      <label className="block text-xs text-slate-500 mb-1">Min</label>
                      <input type="number" step="0.1" placeholder="Min" value={newMetric.min_range} onChange={e => setNewMetric({...newMetric, min_range: e.target.value})} className="w-full p-2 border rounded-md text-sm dark:bg-slate-800 dark:border-slate-700 outline-none" />
                  </div>
                  <div>
                      <label className="block text-xs text-slate-500 mb-1">Max</label>
                      <input type="number" step="0.1" placeholder="Max" value={newMetric.max_range} onChange={e => setNewMetric({...newMetric, max_range: e.target.value})} className="w-full p-2 border rounded-md text-sm dark:bg-slate-800 dark:border-slate-700 outline-none" />
                  </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => { setShowAddMetric(false); setMetricSearch(''); }} className="px-4 py-2 text-sm">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-light text-white rounded-lg text-sm font-medium">Add Metric</button>
              </div>
          </form>
      )}

      {metrics.length === 0 && !showAddMetric && (
          <div className="card p-8 text-center bg-slate-50 dark:bg-slate-800 flex flex-col items-center">
              <ActivityIcon className="text-slate-400 mb-4" size={32} />
              <p className="text-slate-500 mb-4">Track health data like weight, blood pressure, blood sugar over time.</p>
              <button onClick={() => setShowAddMetric(true)} className="px-4 py-2 bg-primary-light text-white rounded-lg text-sm font-medium">Add First Metric</button>
          </div>
      )}

      {metrics.map(m => {
          const metricData = entries[m.id] || [];
          const chartData = [...metricData].reverse().map(e => ({ name: e.date.slice(-5), value: e.value }));
          const latestValue = metricData.length > 0 ? metricData[0].value : null;
          const isOutOfRange = latestValue && ((m.min_range && latestValue < m.min_range) || (m.max_range && latestValue > m.max_range));
          
          return (
              <div key={m.id} className={`card p-4 ${isOutOfRange ? 'border-accent-light dark:border-accent-dark' : ''}`}>
                  <div className="flex justify-between items-center mb-4">
                      <div>
                          <h2 className="text-lg font-medium">{m.name}</h2>
                          <div className="text-xs text-slate-500">
                              {m.unit}
                              {(m.min_range || m.max_range) && ` (${m.min_range || '-'} - ${m.max_range || '-'})`}
                              {latestValue && <span className="ml-2 font-medium text-slate-700 dark:text-slate-300">Latest: {latestValue} {m.unit}</span>}
                          </div>
                          {isOutOfRange && (
                              <div className="text-xs text-accent-light dark:text-accent-dark font-medium mt-1">
                                  Latest reading is outside reference range
                              </div>
                          )}
                      </div>
                      <button onClick={() => setShowAddEntry(m.id)} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Log Today</button>
                  </div>

                  {showAddEntry === m.id && (
                      <form onSubmit={(e) => handleAddEntry(e, m.id)} className="mb-4 flex gap-2">
                          <input required type="number" step="0.1" placeholder={`Value in ${m.unit}`} value={newEntryVal} onChange={e => setNewEntryVal(e.target.value)} className="flex-1 p-2 border rounded-md text-sm dark:bg-slate-800 dark:border-slate-700 outline-none" />
                          <button type="submit" className="px-4 py-2 bg-primary-light text-white rounded-md text-sm">Save</button>
                      </form>
                  )}

                  {chartData.length > 0 ? (
                      <div className="h-40 w-full mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                  <YAxis hide domain={['auto', 'auto']} />
                                  <Tooltip 
                                      contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1E293B', color: '#fff'}}
                                      itemStyle={{color: '#4ECFA8'}}
                                  />
                                  {m.min_range && <ReferenceLine y={m.min_range} stroke="#FCD34D" strokeDasharray="3 3" />}
                                  {m.max_range && <ReferenceLine y={m.max_range} stroke="#FCD34D" strokeDasharray="3 3" />}
                                  <Line type="monotone" dataKey="value" stroke="#0F6E56" strokeWidth={3} dot={{fill: '#0F6E56', strokeWidth: 2, r: 4}} activeDot={{r: 6}} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                  ) : (
                      <div className="h-20 flex items-center justify-center text-sm text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 rounded-lg mt-2">
                          No data points to chart yet. Tap "Log Today" to add your first entry.
                      </div>
                  )}
              </div>
          );
      })}
    </div>
  )
}