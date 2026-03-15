import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Tablets from './pages/Tablets'
import Diet from './pages/Diet'
import Study from './pages/Study'
import Activity from './pages/Activity'
import Health from './pages/Health'
import Insights from './pages/Insights'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'
import Sleep from './pages/Sleep'
import Mood from './pages/Mood'
import Habits from './pages/Habits'
import Goals from './pages/Goals'
import Pomodoro from './pages/Pomodoro'
import WeeklyReview from './pages/WeeklyReview'
import PhotoJournal from './pages/PhotoJournal'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'

function App() {
  return (
    <Router>
      <div className="flex h-screen w-full bg-[var(--bg-color)] text-[var(--text-color)]">
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>
        
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/tablets" element={<Tablets />} />
              <Route path="/diet" element={<Diet />} />
              <Route path="/study" element={<Study />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/health" element={<Health />} />
              <Route path="/sleep" element={<Sleep />} />
              <Route path="/mood" element={<Mood />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/pomodoro" element={<Pomodoro />} />
              <Route path="/weekly" element={<WeeklyReview />} />
              <Route path="/photos" element={<PhotoJournal />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
        
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      </div>
    </Router>
  )
}

export default App
