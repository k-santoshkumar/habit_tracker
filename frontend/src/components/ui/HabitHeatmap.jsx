import React from 'react';

export default function HabitHeatmap({ data = [] }) {
    // data is array of last 84 days scores
    // Fill if missing
    const squares = Array.from({ length: 84 }).map((_, i) => data[i] || 0);
    
    const getColor = (score) => {
        if (score >= 90) return 'bg-[#0F6E56] dark:bg-[#4ECFA8]'; // dark teal
        if (score >= 70) return 'bg-[#1a9a7a] dark:bg-[#6be0bd]'; // mid teal
        if (score >= 50) return 'bg-[#40bda0] dark:bg-[#9dedd6]'; // light teal
        if (score >= 30) return 'bg-accent-light dark:bg-accent-dark'; // amber
        return 'bg-slate-200 dark:bg-slate-800'; // light gray
    };

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
                {squares.map((score, i) => (
                    <div 
                        key={i} 
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-[2px] ${getColor(score)} cursor-pointer transition-transform hover:scale-125`}
                        title={`Score: ${score}`}
                    />
                ))}
            </div>
        </div>
    );
}
