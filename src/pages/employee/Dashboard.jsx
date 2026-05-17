import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'
import { Target, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const map = { draft: 'badge-draft', submitted: 'badge-submitted', approved: 'badge-approved', returned: 'badge-returned' }
  return <span className={map[status] || 'badge-draft'}>{status}</span>
}

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [sheets, setSheets] = useState([])
  const [cycle, setCycle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/cycles/active').catch(() => ({ data: null })),
      api.get('/goal-sheets'),
    ]).then(([c, s]) => {
      setCycle(c.data)
      setSheets(s.data)
    }).finally(() => setLoading(false))
  }, [])

  const currentSheet = sheets.find(s => s.cycle_id === cycle?.id)

  const stats = [
    { label: 'Total Goals', value: currentSheet ? '—' : '0', icon: Target, color: 'text-brand-600 bg-brand-50' },
    { label: 'Approved', value: currentSheet?.status === 'approved' ? '✓' : '—', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Sheet Status', value: currentSheet?.status || 'No sheet', icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Pending Action', value: currentSheet?.status === 'returned' ? '!' : '—', icon: AlertCircle, color: 'text-red-600 bg-red-50' },
  ]

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name} 👋</h1>
        <p className="text-gray-500 mt-1">
          {cycle ? `Active cycle: ${cycle.name}` : 'No active cycle at the moment'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Current sheet CTA */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Goal Sheet</h2>
          {cycle && (
            <Link to="/employee/goal-sheet" className="btn-primary flex items-center gap-2">
              {currentSheet ? 'View Sheet' : 'Create Sheet'}
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {!cycle && (
          <div className="text-center py-8 text-gray-400">
            <Target size={40} className="mx-auto mb-2 opacity-40" />
            <p>No active goal cycle. Check back later.</p>
          </div>
        )}

        {cycle && !currentSheet && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm font-medium">Goal sheet not created yet</p>
            <p className="text-amber-600 text-sm mt-1">Create your goal sheet for {cycle.name} to get started.</p>
          </div>
        )}

        {currentSheet && (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Status</span>
              <StatusBadge status={currentSheet.status} />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Weightage</span>
              <span className="text-sm font-medium">{currentSheet.total_weightage || 0}%</span>
            </div>
            {currentSheet.return_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm font-medium">Returned — Manager feedback:</p>
                <p className="text-red-600 text-sm mt-1">{currentSheet.return_reason}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
