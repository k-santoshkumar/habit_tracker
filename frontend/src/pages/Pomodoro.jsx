import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { format } from 'date-fns';
import { Play, Pause, RotateCcw, Coffee, Timer, Check } from 'lucide-react';
import * as api from '../api/pomodoro';
import { schedulePomodoroNotification, cancelPomodoroNotification } from '../lib/notifications';


const PRESETS = [
  { label: '25/5', work: 25, break: 5 },
  { label: '50/10', work: 50, break: 10 },
  { label: '90/20', work: 90, break: 20 },
];

export default function Pomodoro() {
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [label, setLabel] = useState('');
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ total_sessions: 0, total_minutes: 0, today_sessions: 0 });
  const intervalRef = useRef(null);

  const schedulePhaseNotification = useCallback((durationSeconds, breakMode = isBreak) => {
    const endsAt = new Date(Date.now() + (durationSeconds * 1000));
    const title = breakMode ? 'Break complete' : 'Focus session complete';
    const body = breakMode
      ? 'Your break is over. Time to get back to work.'
      : `${label || 'Your focus session'} has finished.`;

    schedulePomodoroNotification({ title, body, endsAt }).catch((error) => {
      console.error('Failed to schedule pomodoro notification', error);
    });
  }, [isBreak, label]);

  const fetchData = useCallback(async () => {
    try {
      const [sessRes, statsRes] = await Promise.all([
        api.getPomodoroSessions(date),
        api.getPomodoroStats()
      ]);
      startTransition(() => {
        if (sessRes.data.success) setSessions(sessRes.data.data);
        if (statsRes.data.success) setStats(statsRes.data.data);
      });
    } catch (e) { console.error(e); }
  }, [date]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const completeSession = useCallback(async () => {
    if (!isBreak) {
      // Log completed work session
      await api.createPomodoroSession({
        date, duration_min: workMin, break_min: breakMin, label: label || 'Focus Session', completed: true
      });
      fetchData();
      // Start break
      setIsBreak(true);
      setSecondsLeft(breakMin * 60);
      schedulePhaseNotification(breakMin * 60, true);
    } else {
      // Break done, reset
      setIsBreak(false);
      setSecondsLeft(workMin * 60);
      setIsRunning(false);
      cancelPomodoroNotification().catch((error) => {
        console.error('Failed to cancel pomodoro notification', error);
      });
    }
  }, [isBreak, workMin, breakMin, label, date, fetchData, schedulePhaseNotification]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            // Play a notification sound
            try {
              new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczIVOj3OsGfTIjOY+91OkFeTQrR4i0yeBIaC03SIMAAAA=').play();
            } catch {
              // Ignore audio playback failures; the scheduled notification is the primary alert.
            }
            void completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, completeSession]);

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      cancelPomodoroNotification().catch((error) => {
        console.error('Failed to cancel pomodoro notification', error);
      });
      return;
    }

    setIsRunning(true);
    schedulePhaseNotification(secondsLeft, isBreak);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(workMin * 60);
    cancelPomodoroNotification().catch((error) => {
      console.error('Failed to cancel pomodoro notification', error);
    });
  };

  const selectPreset = (p) => {
    if (isRunning) return;
    setWorkMin(p.work);
    setBreakMin(p.break);
    setSecondsLeft(p.work * 60);
    setIsBreak(false);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const totalTime = isBreak ? breakMin * 60 : workMin * 60;
  const progress = ((totalTime - secondsLeft) / totalTime) * 100;

  // SVG arc for circular timer
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-semibold flex items-center gap-2"><Timer size={24} /> Pomodoro</h1>

      {/* Presets */}
      <div className="flex justify-center gap-3">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => selectPreset(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              workMin === p.work && breakMin === p.break
                ? 'bg-primary-light text-white border-primary-light'
                : 'border-slate-200 dark:border-slate-700 hover:border-primary-light/50'
            }`}
          >{p.label}</button>
        ))}
      </div>

      {/* Circular Timer */}
      <div className="flex flex-col items-center py-4">
        <div className="relative w-64 h-64">
          <svg className="w-64 h-64 -rotate-90" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-700" />
            <circle cx="130" cy="130" r={radius} fill="none" strokeWidth="8" strokeLinecap="round"
              stroke={isBreak ? '#D97706' : '#0F6E56'}
              style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-5xl font-mono font-bold ${isBreak ? 'text-accent-light' : ''}`}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
            <div className="text-sm text-slate-400 mt-1 flex items-center gap-1">
              {isBreak ? <><Coffee size={14} /> Break Time</> : <><Timer size={14} /> Focus Time</>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button onClick={resetTimer} className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <RotateCcw size={20} />
          </button>
          <button onClick={toggleTimer} className={`p-5 rounded-full text-white shadow-lg transition-all active:scale-95 ${isBreak ? 'bg-accent-light' : 'bg-primary-light'}`}>
            {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>
        </div>

        {/* Label input */}
        {!isRunning && !isBreak && (
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="What are you working on?" className="mt-6 w-64 p-2 border rounded-lg text-sm text-center dark:bg-slate-800 dark:border-slate-700 outline-none" />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary-light">{stats.today_sessions}</div>
          <div className="text-xs text-slate-500">Today</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{stats.total_sessions}</div>
          <div className="text-xs text-slate-500">All Time</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-accent-light">{Math.round(stats.total_minutes / 60)}h</div>
          <div className="text-xs text-slate-500">Focused</div>
        </div>
      </div>

      {/* Today's Sessions */}
      {sessions.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-medium text-slate-500 mb-3">Today's Sessions</h3>
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-b-0 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-primary-light" />
                  <span className="text-sm font-medium">{s.label || 'Focus'}</span>
                </div>
                <span className="text-xs text-slate-400">{s.duration_min} min</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
