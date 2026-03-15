import { useState } from 'react';
import { useStudy } from '../hooks/useStudy';
import { Plus } from 'lucide-react';

export default function Study() {
  const { tracks, loading, addTrack, addTopic, setTopicStatus } = useStudy();
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(null); // track_id
  const [newTrack, setNewTrack] = useState({ name: '', color_tag: 'teal' });
  const [newTopicName, setNewTopicName] = useState('');

  const colors = {
      teal: 'border-primary-light dark:border-primary-dark',
      amber: 'border-accent-light dark:border-accent-dark',
      blue: 'border-blue-500',
      green: 'border-green-500'
  };

  const handleAddTrack = async (e) => {
      e.preventDefault();
      await addTrack(newTrack);
      setShowAddTrack(false);
      setNewTrack({ name: '', color_tag: 'teal' });
  };

  const handleAddTopic = async (e, trackId) => {
      e.preventDefault();
      await addTopic({ track_id: trackId, name: newTopicName, status: 'In Progress' });
      setShowAddTopic(null);
      setNewTopicName('');
  };

  const cycleStatus = (topicId, current) => {
      const next = current === "In Progress" ? "Done" : current === "Done" ? "Skipped" : "In Progress";
      setTopicStatus(topicId, next);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Study Tracks</h1>
          <button onClick={() => setShowAddTrack(true)} className="p-2 bg-primary-light text-white rounded-full">
              <Plus size={20} />
          </button>
      </div>

      {tracks.length === 0 && !showAddTrack && (
          <div className="card p-8 text-center bg-slate-50 dark:bg-slate-800">
              <p className="text-slate-500 mb-4">No learning tracks set up.</p>
              <button onClick={() => setShowAddTrack(true)} className="px-4 py-2 bg-primary-light font-medium text-white rounded-lg text-sm">Add Track</button>
          </div>
      )}

      {showAddTrack && (
          <form className="card p-4 space-y-4" onSubmit={handleAddTrack}>
              <h3 className="font-medium">New Track</h3>
              
              <datalist id="track-suggestions">
                <option value="Python Backend" />
                <option value="React Frontend" />
                <option value="System Design" />
                <option value="Algorithms" />
                <option value="Data Structures" />
                <option value="Machine Learning" />
                <option value="Cloud Architecture AWS" />
                <option value="DevOps Pipeline" />
                <option value="SQL Optimization" />
                <option value="Cybersecurity Basics" />
                <option value="Mobile App Development" />
                <option value="UI/UX Design" />
                <option value="Foreign Language" />
                <option value="Mathematics" />
                <option value="History" />
                <option value="Literature" />
                <option value="Project Management" />
                <option value="Public Speaking" />
                <option value="Writing Skills" />
                <option value="Business Finance" />
                <option value="Marketing Strategy" />
              </datalist>

              <div>
                  <input required list="track-suggestions" placeholder="Name (e.g., Python Backend)" value={newTrack.name} onChange={e => setNewTrack({...newTrack, name: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none" />
              </div>
              <div>
                  <label className="text-xs text-slate-500 block mb-2">Color Tag</label>
                  <div className="flex gap-2">
                       {Object.keys(colors).map(c => (
                          <div key={c} onClick={() => setNewTrack({...newTrack, color_tag: c})} className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-transform ${newTrack.color_tag === c ? 'scale-110' : 'opacity-50'} ${colors[c]}`}></div>
                       ))}
                  </div>
              </div>
              <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowAddTrack(false)} className="px-4 py-2 text-sm">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-light text-white rounded-md text-sm">Save</button>
              </div>
          </form>
      )}

      {tracks.map(track => (
          <div key={track.id} className={`card p-4 border-l-4 ${colors[track.color_tag || 'teal']}`}>
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">{track.name}</h2>
                  <button onClick={() => setShowAddTopic(track.id)} className="p-1 items-center justify-center flex text-slate-400 hover:text-slate-800"><Plus size={16} /></button>
              </div>

              {showAddTopic === track.id && (
                  <form onSubmit={(e) => handleAddTopic(e, track.id)} className="mb-4 flex gap-2">
                      <datalist id="topic-suggestions">
                         <option value="Variables & Loops" />
                         <option value="API Integration" />
                         <option value="Database Migrations" />
                         <option value="State Management" />
                         <option value="Docker Containers" />
                         <option value="CI/CD Setup" />
                         <option value="Binary Trees" />
                         <option value="Sorting Algorithms" />
                         <option value="RESTful Principles" />
                         <option value="GraphQL Basics" />
                         <option value="Authentication & Authorization" />
                         <option value="Redux Toolkit" />
                         <option value="Tailwind CSS" />
                         <option value="Asynchronous Programming" />
                         <option value="Microservices" />
                         <option value="Unit Testing" />
                         <option value="E2E Testing" />
                         <option value="Load Balancing" />
                         <option value="Caching Strategies" />
                         <option value="Memory Management" />
                         <option value="Concurrency" />
                      </datalist>
                      <input required list="topic-suggestions" placeholder="New topic..." value={newTopicName} onChange={e => setNewTopicName(e.target.value)} className="flex-1 p-2 border rounded-md text-sm dark:bg-slate-800 outline-none" />
                      <button type="submit" className="px-3 py-1 bg-primary-light text-white rounded-md text-sm">Add</button>
                  </form>
              )}

              <div className="space-y-2">
                  {track.topics.map(t => (
                      <div key={t.id} onClick={() => cycleStatus(t.id, t.status)} className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer active:scale-[98%] transition-all ${
                          t.status === 'Done' ? 'bg-primary-light/10 border-primary-light/20 text-slate-500 line-through' :
                          t.status === 'Skipped' ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-400' :
                          'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}>
                          <span className="text-sm font-medium">{t.name}</span>
                          <span className="text-xs">{t.status}</span>
                      </div>
                  ))}
                  {track.topics.length === 0 && (
                      <div className="text-sm text-slate-500 italic">No topics yet. Add one to get started!</div>
                  )}
              </div>
          </div>
      ))}
    </div>
  )
}