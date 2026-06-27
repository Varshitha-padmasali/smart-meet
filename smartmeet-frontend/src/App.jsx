import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import CreateMeetingPage from './pages/CreateMeetingPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import JoinMeetingPage from './pages/JoinMeetingPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MeetingDetailsPage from './pages/MeetingDetailsPage.jsx'
import MeetingListPage from './pages/MeetingListPage.jsx'
import MeetingRoomPage from './pages/MeetingRoomPage.jsx'
import SignupPage from './pages/SignupPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/join" element={<JoinMeetingPage />} />
        <Route path="/meeting/:meetingId" element={<MeetingRoomPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/meetings" element={<MeetingListPage />} />
          <Route path="/meetings/:meetingId" element={<MeetingDetailsPage />} />
          <Route path="/create-meeting" element={<CreateMeetingPage />} />
          <Route path="/join-meeting" element={<Navigate to="/join" replace />} />
          <Route path="/analytics/:meetingId" element={<AnalyticsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
