import { useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { X, Loader2 } from 'lucide-react'

export default function AddGoalModal({ sheetId, thrustAreas, onClose, onAdded }) {
  const [form, setForm] = useState({
    title: '', description: '', thrust_area_id: '',
    uom_type: 'numeric_min', target_value: '', target_date: '', weightage: 10,
  })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.weightage < 10) return toast.error('Minimum weightage is 10%')
    setLoading(true)
    try {
      await api.post(`/goal-sheets/${sheetId}/goals`, {
        ...form,
        target_value: form.target_value ? Number(form.target_value) : null,
        target_date: form.target_date || null,
        thrust_area_id: form.thrust_area_id || null,
      })
      toast.success('Goal added!')
      onAdded()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to add goal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Add New Goal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="label">Goal Title *</label>
            <input className="input" required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Increase sales revenue by 20%" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional details..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Thrust Area</label>
              <select className="input" value={form.thrust_area_id} onChange={e => set('thrust_area_id', e.target.value)}>
                <option value="">Select area</option>
                {thrustAreas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Unit of Measurement *</label>
              <select className="input" value={form.uom_type} onChange={e => set('uom_type', e.target.value)}>
                <option value="numeric_min">Numeric — higher is better</option>
                <option value="numeric_max">Numeric — lower is better</option>
                <option value="timeline">Timeline (date-based)</option>
                <option value="zero">Zero-based</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['timeline'].includes(form.uom_type) ? (
              <div>
                <label className="label">Target Date *</label>
                <input className="input" type="date" value={form.target_date} onChange={e => set('target_date', e.target.value)} />
              </div>
            ) : (
              <div>
                <label className="label">Target Value {form.uom_type !== 'zero' ? '*' : ''}</label>
                <input className="input" type="number" value={form.target_value} onChange={e => set('target_value', e.target.value)} placeholder="e.g. 100" disabled={form.uom_type === 'zero'} />
              </div>
            )}
            <div>
              <label className="label">Weightage (%) * <span className="text-gray-400 font-normal">min 10%</span></label>
              <input className="input" type="number" min="10" max="100" required value={form.weightage} onChange={e => set('weightage', Number(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 flex-1 justify-center">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Add Goal
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
