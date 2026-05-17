import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

export default function ReviewSheet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sheet, setSheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [returnReason, setReturnReason] = useState('')
  const [showReturn, setShowReturn] = useState(false)
  const [checkinQ, setCheckinQ] = useState('Q1')
  const [checkinComment, setCheckinComment] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    api.get(`/goal-sheets/${id}`)
      .then(r => setSheet(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])

  const approve = async () => {
    setSaving(true)
    try {
      await api.post(`/goal-sheets/${id}/approve`)
      toast.success('Goal sheet approved!')
      navigate('/manager/team')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Approval failed')
    } finally { setSaving(false) }
  }

  const returnSheet = async () => {
    if (!returnReason.trim()) return toast.error('Please provide a return reason')
    setSaving(true)
    try {
      await api.post(`/goal-sheets/${id}/return`, { return_reason: returnReason })
      toast.success('Sheet returned for revision')
      navigate('/manager/team')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed')
    } finally { setSaving(false) }
  }

  const submitCheckin = async () => {
    if (!checkinComment.trim()) return toast.error('Comment required')
    setSaving(true)
    try {
      await api.post(`/goal-sheets/${id}/checkins`, { quarter: checkinQ, comment: checkinComment })
      toast.success('Check-in saved!')
      setCheckinComment('')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>
  if (!sheet)  return <div className="p-8 text-gray-500">Sheet not found.</div>

  const uomLabels = { numeric_min: '↑ Higher better', numeric_max: '↓ Lower better', timeline: 'Timeline', zero: 'Zero-based' }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Goal Sheet</h1>
          <p className="text-gray-500 mt-1">{sheet.employee_name} · {sheet.department} · {sheet.cycle_name}</p>
        </div>
        <span className={`badge-${sheet.status}`}>{sheet.status}</span>
      </div>

      {/* Goals */}
      <div className="space-y-4 mb-8">
        {sheet.goals?.map(goal => (
          <div key={goal.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                {goal.description && <p className="text-sm text-gray-500 mt-1">{goal.description}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>{goal.thrust_area_name || 'No area'}</span>
                  <span>{uomLabels[goal.uom_type]}</span>
                  <span>Target: {goal.target_value ?? goal.target_date ?? '—'}</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-brand-600 ml-4">{goal.weightage}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total weightage */}
      <div className="card mb-6 flex justify-between items-center">
        <span className="text-gray-700 font-medium">Total Weightage</span>
        <span className={`text-lg font-bold ${sheet.total_weightage === 100 ? 'text-green-600' : 'text-red-600'}`}>
          {sheet.total_weightage}%
        </span>
      </div>

      {/* Actions for submitted sheet */}
      {sheet.status === 'submitted' && (
        <div className="flex gap-3 mb-8">
          <button onClick={approve} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Approve
          </button>
          <button onClick={() => setShowReturn(!showReturn)} className="btn-danger flex items-center gap-2">
            <XCircle size={14} /> Return for Revision
          </button>
        </div>
      )}

      {showReturn && (
        <div className="card mb-6">
          <label className="label">Reason for returning *</label>
          <textarea className="input mb-3" rows={3} value={returnReason} onChange={e => setReturnReason(e.target.value)} placeholder="Explain what needs to be revised..." />
          <button onClick={returnSheet} disabled={saving} className="btn-danger flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />} Confirm Return
          </button>
        </div>
      )}

      {/* Check-in section (approved sheets) */}
      {sheet.status === 'approved' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare size={18} /> Quarterly Check-in
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Quarter</label>
              <select className="input" value={checkinQ} onChange={e => setCheckinQ(e.target.value)}>
                {['Q1','Q2','Q3','Q4'].map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>
          <label className="label">Check-in Comment *</label>
          <textarea className="input mb-3" rows={3} value={checkinComment} onChange={e => setCheckinComment(e.target.value)} placeholder="Provide structured feedback on employee progress..." />
          <button onClick={submitCheckin} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            <MessageSquare size={14} /> Save Check-in
          </button>
        </div>
      )}
    </div>
  )
}
