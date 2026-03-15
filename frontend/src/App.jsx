import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
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
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
    </div>
  );

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex h-screen w-full bg-[var(--bg-color)] text-[var(--text-color)]">
      {user && !isAuthPage && (
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>
      )}
      
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
            <Route path="/tablets" element={<PrivateRoute><Tablets /></PrivateRoute>} />
            <Route path="/diet" element={<PrivateRoute><Diet /></PrivateRoute>} />
            <Route path="/study" element={<PrivateRoute><Study /></PrivateRoute>} />
            <Route path="/activity" element={<PrivateRoute><Activity /></PrivateRoute>} />
            <Route path="/health" element={<PrivateRoute><Health /></PrivateRoute>} />
            <Route path="/sleep" element={<PrivateRoute><Sleep /></PrivateRoute>} />
            <Route path="/mood" element={<PrivateRoute><Mood /></PrivateRoute>} />
            <Route path="/habits" element={<PrivateRoute><Habits /></PrivateRoute>} />
            <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
            <Route path="/pomodoro" element={<PrivateRoute><Pomodoro /></PrivateRoute>} />
            <Route path="/weekly" element={<PrivateRoute><WeeklyReview /></PrivateRoute>} />
            <Route path="/photos" element={<PrivateRoute><PhotoJournal /></PrivateRoute>} />
            <Route path="/insights" element={<PrivateRoute><Insights /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          </Routes>
        </div>
      </main>
      
      {user && !isAuthPage && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
