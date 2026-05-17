import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { Search } from 'lucide-react'

export default function TeamGoalSheets() {
  const [sheets, setSheets] = useState([])
  const [cycle, setCycle]   = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/cycles/active').catch(() => ({ data: null })),
      api.get('/goal-sheets'),
    ]).then(([c, s]) => { setCycle(c.data); setSheets(s.data) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = sheets.filter(s =>
    s.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Goal Sheets</h1>

      <div className="relative mb-6 max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9" placeholder="Search by name or department..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-3 font-medium">Employee</th>
              <th className="pb-3 font-medium">Department</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Weightage</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(s => (
              <tr key={s.id}>
                <td className="py-3 font-medium text-gray-900">{s.employee_name}</td>
                <td className="py-3 text-gray-500">{s.department}</td>
                <td className="py-3"><span className={`badge-${s.status}`}>{s.status}</span></td>
                <td className="py-3 text-gray-500">{s.total_weightage || 0}%</td>
                <td className="py-3">
                  <Link to={`/manager/review/${s.id}`} className="text-brand-600 hover:underline text-xs">
                    {s.status === 'submitted' ? 'Review →' : 'View →'}
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-gray-400">No sheets found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
