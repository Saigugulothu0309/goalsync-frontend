import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { Users, CheckCircle, Clock, ArrowRight } from 'lucide-react'

export default function ManagerDashboard() {
  const [sheets, setSheets] = useState([])
  const [cycle, setCycle]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/cycles/active').catch(() => ({ data: null })),
      api.get('/goal-sheets'),
    ]).then(([c, s]) => { setCycle(c.data); setSheets(s.data) })
      .finally(() => setLoading(false))
  }, [])

  const submitted = sheets.filter(s => s.status === 'submitted').length
  const approved  = sheets.filter(s => s.status === 'approved').length
  const pending   = sheets.filter(s => s.status === 'draft').length

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Manager Dashboard</h1>
      <p className="text-gray-500 mb-8">{cycle?.name || 'No active cycle'}</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Awaiting Approval', value: submitted, icon: Clock,        color: 'text-amber-600 bg-amber-50' },
          { label: 'Approved',          value: approved,  icon: CheckCircle,  color: 'text-green-600 bg-green-50' },
          { label: 'Not Submitted',     value: pending,   icon: Users,        color: 'text-gray-600 bg-gray-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}><Icon size={18} /></div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Team Goal Sheets</h2>
          <Link to="/manager/team" className="btn-secondary flex items-center gap-2 text-sm">View All <ArrowRight size={14} /></Link>
        </div>

        {sheets.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No sheets submitted yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {sheets.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.employee_name}</p>
                  <p className="text-xs text-gray-400">{s.department}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge-${s.status}`}>{s.status}</span>
                  {s.status === 'submitted' && (
                    <Link to={`/manager/review/${s.id}`} className="btn-primary text-xs py-1 px-3">Review</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
