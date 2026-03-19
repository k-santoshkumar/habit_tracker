export default function Skeleton({ className }) {
  return (
    <div className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
    </div>
  );
}
