import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/Login'
import Layout from './components/Layout'

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard'
import MyGoalSheet from './pages/employee/MyGoalSheet'
import GoalSheetDetail from './pages/employee/GoalSheetDetail'

// Manager pages
import ManagerDashboard from './pages/manager/Dashboard'
import TeamGoalSheets from './pages/manager/TeamGoalSheets'
import ReviewSheet from './pages/manager/ReviewSheet'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageCycles from './pages/admin/ManageCycles'
import Reports from './pages/admin/Reports'

// New missing feature pages
import SharedGoals from './pages/SharedGoals'
import QuarterlyWindowValidator from './pages/QuarterlyWindowValidator'
import CompletionDashboard from './pages/CompletionDashboard'
import RiskRadar from './pages/RiskRadar'
import AuditTimeline from './pages/AuditTimeline'
import EscalationSimulation from './pages/EscalationSimulation'
import Analytics from './pages/Analytics'

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"/></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

const RoleRedirect = () => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin')    return <Navigate to="/admin" replace />
  if (user.role === 'manager')  return <Navigate to="/manager" replace />
  return <Navigate to="/employee" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Employee */}
          <Route path="/employee" element={<ProtectedRoute roles={['employee']}><Layout /></ProtectedRoute>}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="goal-sheet" element={<MyGoalSheet />} />
            <Route path="goal-sheet/:id" element={<GoalSheetDetail />} />
            <Route path="window-status" element={<QuarterlyWindowValidator />} />
          </Route>

          {/* Manager */}
          <Route path="/manager" element={<ProtectedRoute roles={['manager','admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<ManagerDashboard />} />
            <Route path="team" element={<TeamGoalSheets />} />
            <Route path="review/:id" element={<ReviewSheet />} />
            <Route path="shared-goals" element={<SharedGoals />} />
            <Route path="completion" element={<CompletionDashboard />} />
            <Route path="risk-radar" element={<RiskRadar />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="window-status" element={<QuarterlyWindowValidator />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="cycles" element={<ManageCycles />} />
            <Route path="reports" element={<Reports />} />
            <Route path="shared-goals" element={<SharedGoals />} />
            <Route path="completion" element={<CompletionDashboard />} />
            <Route path="risk-radar" element={<RiskRadar />} />
            <Route path="audit" element={<AuditTimeline />} />
            <Route path="escalations" element={<EscalationSimulation />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="window-status" element={<QuarterlyWindowValidator />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
