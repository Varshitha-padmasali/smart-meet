import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import CreateMeetingPage from './pages/CreateMeetingPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import JoinMeetingPage from './pages/JoinMeetingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'

// Defines all client-side routes for the frontend-only SmartMeet application.
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create-meeting" element={<CreateMeetingPage />} />
        <Route path="/join-meeting" element={<JoinMeetingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
