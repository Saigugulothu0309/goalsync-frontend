import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { Users, Settings, BarChart2, Shield, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, sheets: 0, approved: 0, pending: 0 })
  const [cycle, setCycle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/cycles/active').catch(() => ({ data: null })),
      api.get('/users'),
      api.get('/goal-sheets'),
    ]).then(([c, u, s]) => {
      setCycle(c.data)
      setStats({
        users:    u.data.length,
        sheets:   s.data.length,
        approved: s.data.filter(x => x.status === 'approved').length,
        pending:  s.data.filter(x => x.status === 'submitted').length,
      })
    }).finally(() => setLoading(false))
  }, [])

  const cards = [
    { to: '/admin/users',   icon: Users,    label: 'Manage Users',   value: stats.users,    sub: 'total users',    color: 'bg-blue-50 text-blue-600' },
    { to: '/admin/cycles',  icon: Settings, label: 'Goal Cycles',    value: cycle?.name || '—', sub: 'active cycle', color: 'bg-purple-50 text-purple-600' },
    { to: '/admin/reports', icon: BarChart2, label: 'Reports',        value: stats.sheets,   sub: 'goal sheets',    color: 'bg-emerald-50 text-emerald-600' },
    { to: '/admin/reports', icon: Shield,   label: 'Audit Trail',    value: stats.approved, sub: 'approved sheets', color: 'bg-amber-50 text-amber-600' },
  ]

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Organisation overview — {cycle?.name || 'No active cycle'}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ to, icon: Icon, label, value, sub, color }) => (
          <Link key={label} to={to} className="card hover:shadow-md transition-shadow group">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}><Icon size={18} /></div>
            <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
            <p className="text-xs text-gray-400">{sub}</p>
            <p className="text-sm font-medium text-gray-600 mt-2 group-hover:text-brand-600 flex items-center gap-1">
              {label} <ArrowRight size={12} />
            </p>
          </Link>
        ))}
      </div>

      {stats.pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 font-medium">{stats.pending} sheet(s) awaiting manager approval</p>
          <p className="text-amber-600 text-sm mt-1">Review the reports section to track completion across all managers.</p>
        </div>
      )}
    </div>
  )
}
