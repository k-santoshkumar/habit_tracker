import { Lightbulb, Info } from 'lucide-react';

export default function Insights() {
  const mockInsights = [
      {
          id: 1, type: "MORNING_VS_NIGHT", 
          text: "You take your morning tablets 95% of the time but evening tablets only 68% of the time. A phone alarm at a fixed evening time would close this gap.", 
          date: "Today"
      },
      {
          id: 2, type: "SCORE_TREND",
          text: "Your average score this week is 76, up from 61 last week. You are building momentum.",
          date: "Yesterday"
      }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-accent-light/10 dark:bg-accent-dark/10 p-4 rounded-xl mb-6">
          <div className="flex items-center gap-3 text-accent-light dark:text-accent-dark">
              <Lightbulb size={24} />
              <div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Smart Insights</h1>
                  <p className="text-sm opacity-80">Automatically generated patterns from your logs.</p>
              </div>
          </div>
      </div>

      <div className="space-y-4">
          {mockInsights.map((ins) => (
              <div key={ins.id} className="card p-5 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-light dark:bg-accent-dark"></div>
                  <div className="flex justify-between items-start pl-2">
                      <p className="text-sm leading-relaxed pr-8">{ins.text}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4 pl-2">
                      <span className="text-xs text-slate-400 font-medium">{ins.date}</span>
                      <button className="text-xs text-primary-light font-medium bg-primary-light/10 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          Acted On
                      </button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  )
}