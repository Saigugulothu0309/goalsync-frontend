import { useEffect, useState } from 'react'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { Download, RefreshCw } from 'lucide-react'

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
