export default function StreakCard({ category, current, longest, last7days = [], atRisk = false }) {
  return (
    <div className={`card p-4 ${atRisk ? 'border-accent-light dark:border-accent-dark' : ''}`}>
      <div className="text-sm font-medium text-slate-500 mb-2">{category}</div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="text-3xl font-bold">{current}</span>
          <span className="text-slate-400 text-xs ml-2">longest: {longest}</span>
        </div>
      </div>
      <div className="flex justify-between items-center gap-1">
        {last7days.map((done, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full ${done ? 'bg-primary-light dark:bg-primary-dark' : 'bg-slate-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>
    </div>
  );
}
