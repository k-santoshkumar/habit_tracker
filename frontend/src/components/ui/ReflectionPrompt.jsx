import { useState } from 'react';

export default function ReflectionPrompt({ onSubmit }) {
    const [wentWell, setWentWell] = useState('');
    const [improve, setImprove] = useState('');
    const [saved, setSaved] = useState(false);

    const handleSubmit = () => {
        onSubmit({ wentWell, improve });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (saved) {
        return (
            <div className="card p-4 text-center text-sm font-medium text-slate-500 scale-95 transition-all">
                Reflection saved. Goodnight.
            </div>
        );
    }

    return (
        <div className="card p-4 space-y-4">
            <h3 className="font-semibold text-sm">Evening Reflection</h3>
            <div>
                <label className="block text-xs text-slate-500 mb-1">One thing that went well today?</label>
                <textarea 
                    value={wentWell}
                    onChange={(e) => setWentWell(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary-light outline-none" 
                    rows="2"
                    maxLength={280}
                />
            </div>
            <div>
                <label className="block text-xs text-slate-500 mb-1">One thing to improve tomorrow?</label>
                <textarea 
                    value={improve}
                    onChange={(e) => setImprove(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary-light outline-none" 
                    rows="2"
                    maxLength={280}
                />
            </div>
            <button 
                onClick={handleSubmit}
                className="w-full bg-primary-light dark:bg-primary-dark text-white dark:text-slate-900 font-medium py-2 rounded-lg text-sm transition-colors hover:opacity-90"
            >
                Save Reflection
            </button>
        </div>
    );
}
