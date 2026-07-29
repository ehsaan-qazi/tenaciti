import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import CoursePage from './pages/CoursePage'
import NotesPage from './pages/NotesPage'
import GoalsPage from './pages/GoalsPage'
import SelfAssessmentPage from './pages/SelfAssessmentPage'
import GPAPage from './pages/GPAPage'
import ProfilePage from './pages/ProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import VerifyEmailConfirmPage from './pages/VerifyEmailConfirmPage'
import Layout from './components/Layout'

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading Tenaciti...</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!user.is_email_verified) {
    return <Navigate to="/verify-email" replace />
  }

  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading Tenaciti...</span>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            user.is_email_verified ? <Navigate to="/" replace /> : <Navigate to="/verify-email" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Public auth routes (no auth required) */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verify-email/confirm" element={<VerifyEmailConfirmPage />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/courses/:id" element={<CoursePage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/:id" element={<NotesPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/self-assessment" element={<SelfAssessmentPage />} />
        <Route path="/gpa" element={<GPAPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/retrospective" element={<ProfilePage />} />
        <Route path="/graph" element={<NotesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all → dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
