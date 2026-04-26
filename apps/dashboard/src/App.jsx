import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/LoginPage'
import OverviewPage from './pages/OverviewPage'
import PropertiesPage from './pages/PropertiesPage'
import BookingsPage from './pages/BookingsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import Loader from './components/Loader'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 800)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return <Loader />

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
    </Routes>
  )
}

export default App