import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, MessageSquare, Loader2 } from 'lucide-react'

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
