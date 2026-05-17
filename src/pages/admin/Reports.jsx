import { useEffect, useState } from 'react'
import api from '../../api/client'
import toast from 'react-hot-toast'
// Icons inline
const Home=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg>
const Target=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><circle cx='12' cy='12' r='10'/><circle cx='12' cy='12' r='6'/><circle cx='12' cy='12' r='2'/></svg>
const Users=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/></svg>
const Settings=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><circle cx='12' cy='12' r='3'/><path d='M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'/></svg>
const BarChart2=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/></svg>
const LogOut=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'/><polyline points='16 17 21 12 16 7'/><line x1='21' y1='12' x2='9' y2='12'/></svg>
const Plus=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><line x1='12' y1='5' x2='12' y2='19'/><line x1='5' y1='12' x2='19' y2='12'/></svg>
const Loader2=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><path d='M21 12a9 9 0 1 1-6.219-8.56'/></svg>
const ArrowRight=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><line x1='5' y1='12' x2='19' y2='12'/><polyline points='12 5 19 12 12 19'/></svg>
const CheckCircle=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/><polyline points='22 4 12 14.01 9 11.01'/></svg>
const AlertCircle=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/></svg>
const Clock=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/></svg>
const Send=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><line x1='22' y1='2' x2='11' y2='13'/><polygon points='22 2 15 22 11 13 2 9 22 2'/></svg>
const Search=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>
const Trash2=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><polyline points='3 6 5 6 21 6'/><path d='M19 6l-1 14H6L5 6'/><path d='M10 11v6M14 11v6M9 6V4h6v2'/></svg>
const Edit2=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><path d='M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/></svg>
const Lock=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><rect x='3' y='11' width='18' height='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg>
const X=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>
const Check=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><polyline points='20 6 9 17 4 12'/></svg>
const Save=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'/><polyline points='17 21 17 13 7 13 7 21'/><polyline points='7 3 7 8 15 8'/></svg>
const UserPlus=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><path d='M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='8.5' cy='7' r='4'/><line x1='20' y1='8' x2='20' y2='14'/><line x1='23' y1='11' x2='17' y2='11'/></svg>
const Zap=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/></svg>
const Download=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/><polyline points='7 10 12 15 17 10'/><line x1='12' y1='15' x2='12' y2='3'/></svg>
const RefreshCw=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><polyline points='23 4 23 10 17 10'/><polyline points='1 20 1 14 7 14'/><path d='M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15'/></svg>
const Shield=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>
const Share2=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/><line x1='8.59' y1='13.51' x2='15.42' y2='17.49'/><line x1='15.41' y1='6.51' x2='8.59' y2='10.49'/></svg>
const Calendar=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><rect x='3' y='4' width='18' height='18' rx='2' ry='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/></svg>
const AlertTriangle=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12.01' y2='17'/></svg>
const TrendingUp=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><polyline points='23 6 13.5 15.5 8.5 10.5 1 18'/><polyline points='17 6 23 6 23 12'/></svg>
const Radio=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><circle cx='12' cy='12' r='2'/><path d='M4.93 4.93a10 10 0 0 0 0 14.14M19.07 4.93a10 10 0 0 1 0 14.14M7.76 7.76a6 6 0 0 0 0 8.49M16.24 7.76a6 6 0 0 1 0 8.49'/></svg>
const MessageSquare=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/></svg>
const XCircle=({size=16,className=''})=><svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}><circle cx='12' cy='12' r='10'/><line x1='15' y1='9' x2='9' y2='15'/><line x1='9' y1='9' x2='15' y2='15'/></svg>

export default function Reports() {
  const [cycles, setCycles] = useState([])
  const [cycleId, setCycleId] = useState('')
  const [quarter, setQuarter] = useState('')
  const [completion, setCompletion] = useState(null)
  const [audit, setAudit] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/cycles').then(r => {
      setCycles(r.data)
      const active = r.data.find(c => c.is_active)
      if (active) setCycleId(active.id)
    })
  }, [])

  const loadReports = async () => {
    if (!cycleId) return toast.error('Select a cycle first')
    setLoading(true)
    try {
      const [comp, aud] = await Promise.all([
        api.get('/reports/completion', { params: { cycle_id: cycleId, quarter: quarter || undefined } }),
        api.get('/reports/audit'),
      ])
      setCompletion(comp.data)
      setAudit(aud.data)
    } catch (e) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    if (!cycleId) return toast.error('Select a cycle first')
    const url = `/api/reports/achievements?cycle_id=${cycleId}&format=csv`
    const a = document.createElement('a')
    a.href = url
    a.download = `achievement_report.csv`
    a.click()
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>

      {/* Controls */}
      <div className="card mb-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="label">Goal Cycle</label>
            <select className="input" value={cycleId} onChange={e => setCycleId(e.target.value)}>
              <option value="">Select cycle</option>
              {cycles.map(c => <option key={c.id} value={c.id}>{c.name}{c.is_active ? ' (active)' : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Quarter (optional)</label>
            <select className="input" value={quarter} onChange={e => setQuarter(e.target.value)}>
              <option value="">All quarters</option>
              {['Q1','Q2','Q3','Q4'].map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <button onClick={loadReports} disabled={loading} className="btn-primary flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Load
          </button>
          <button onClick={downloadCSV} className="btn-secondary flex items-center gap-2">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Completion Dashboard */}
      {completion && (
        <>
          <h2 className="text-lg font-semibold mb-4">Completion Dashboard</h2>
          <div className="card mb-6">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b border-gray-100">
                {['Employee','Department','Manager','Sheet Status','Submitted','Approved'].map(h => <th key={h} className="pb-3 font-medium">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {completion.employees.map(e => (
                  <tr key={e.id}>
                    <td className="py-2.5 font-medium text-gray-900">{e.name}</td>
                    <td className="py-2.5 text-gray-500">{e.department || '—'}</td>
                    <td className="py-2.5 text-gray-500">{e.manager_name || '—'}</td>
                    <td className="py-2.5"><span className={`badge-${e.sheet_status || 'draft'}`}>{e.sheet_status || 'not started'}</span></td>
                    <td className="py-2.5 text-gray-500">{e.submitted_at ? new Date(e.submitted_at).toLocaleDateString() : '—'}</td>
                    <td className="py-2.5 text-gray-500">{e.approved_at ? new Date(e.approved_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Manager check-in completion */}
          {completion.manager_checkins?.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mb-4">Manager Check-in Completion</h2>
              <div className="card mb-6">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b border-gray-100">
                    {['Manager','Total Reports','Check-ins Done','Completion %'].map(h => <th key={h} className="pb-3 font-medium">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {completion.manager_checkins.map(m => (
                      <tr key={m.id}>
                        <td className="py-2.5 font-medium text-gray-900">{m.manager_name}</td>
                        <td className="py-2.5 text-gray-500">{m.total_reports}</td>
                        <td className="py-2.5 text-gray-500">{m.checkins_done}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[80px]">
                              <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: `${m.completion_pct || 0}%` }} />
                            </div>
                            <span className={m.completion_pct >= 100 ? 'text-green-600' : 'text-amber-600'}>{m.completion_pct || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Audit Trail */}
      {audit.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-4">Audit Trail</h2>
          <div className="card">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b border-gray-100">
                {['Time','Entity','Action','Changed By','Notes'].map(h => <th key={h} className="pb-3 font-medium">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {audit.slice(0, 50).map(a => (
                  <tr key={a.id}>
                    <td className="py-2.5 text-gray-400 text-xs">{new Date(a.created_at).toLocaleString()}</td>
                    <td className="py-2.5 text-gray-600">{a.entity_type}</td>
                    <td className="py-2.5"><span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{a.action}</span></td>
                    <td className="py-2.5 text-gray-700">{a.changed_by_name}</td>
                    <td className="py-2.5 text-gray-400 text-xs">{a.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!completion && !loading && (
        <div className="card text-center py-12 text-gray-400">
          <p>Select a cycle and click Load to view reports.</p>
        </div>
      )}
    </div>
  )
}
