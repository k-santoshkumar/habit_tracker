import { useState, useEffect } from 'react';

export default function ScoreRing({ score = 0, thresholdLabel = "Let us make today count", isLoading = false }) {
    const [displayScore, setDisplayScore] = useState(0);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayScore / 100) * circumference;

    useEffect(() => {
        if (isLoading) return;
        const duration = 400;
        const steps = 20;
        const stepTime = duration / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += score / steps;
            if (current >= score) {
                setDisplayScore(score);
                clearInterval(timer);
            } else {
                setDisplayScore(Math.round(current));
            }
        }, stepTime);
        return () => clearInterval(timer);
    }, [score, isLoading]);

    let colorClass = "text-slate-400";
    if (score >= 70) colorClass = "text-primary-light dark:text-primary-dark";
    else if (score >= 50) colorClass = "text-accent-light dark:text-accent-dark";

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                    <circle
                        className="text-slate-100 dark:text-slate-800"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="70"
                        cy="70"
                    />
                    <circle
                        className={`${colorClass} transition-all duration-1000 ease-out`}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="70"
                        cy="70"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-black tracking-tighter">{displayScore}%</span>
                </div>
            </div>
        </div>
    );
}
