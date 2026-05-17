import { useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { Trash2, Edit2, Check, X, Lock } from 'lucide-react'

export default function GoalCard({ goal, canEdit, thrustAreas, sheetId, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    title: goal.title,
    description: goal.description || '',
    weightage: goal.weightage,
    uom_type: goal.uom_type,
    target_value: goal.target_value || '',
    thrust_area_id: goal.thrust_area_id || '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`/goals/${goal.id}`, form)
      toast.success('Goal updated')
      setEditing(false)
      onUpdated()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!confirm('Delete this goal?')) return
    try {
      await api.delete(`/goals/${goal.id}`)
      toast.success('Goal deleted')
      onUpdated()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Delete failed')
    }
  }

  const uomLabels = { numeric_min: 'Numeric (↑)', numeric_max: 'Numeric (↓)', timeline: 'Timeline', zero: 'Zero-based' }

  return (
    <div className="card">
      {editing ? (
        <div className="space-y-3">
          <input className="input font-medium" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
          <textarea className="input" rows={2} placeholder="Description" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Thrust Area</label>
              <select className="input" value={form.thrust_area_id} onChange={e => setForm(f => ({...f, thrust_area_id: e.target.value}))}>
                <option value="">Select</option>
                {thrustAreas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">UoM Type</label>
              <select className="input" value={form.uom_type} onChange={e => setForm(f => ({...f, uom_type: e.target.value}))}>
                <option value="numeric_min">Numeric (higher is better)</option>
                <option value="numeric_max">Numeric (lower is better)</option>
                <option value="timeline">Timeline</option>
                <option value="zero">Zero-based</option>
              </select>
            </div>
            <div>
              <label className="label">Target</label>
              <input className="input" type="number" value={form.target_value} onChange={e => setForm(f => ({...f, target_value: e.target.value}))} />
            </div>
          </div>
          <div>
            <label className="label">Weightage (%)</label>
            <input className="input w-32" type="number" min="10" max="100" value={form.weightage} onChange={e => setForm(f => ({...f, weightage: e.target.value}))} />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-1"><Check size={14} /> Save</button>
            <button onClick={() => setEditing(false)} className="btn-secondary flex items-center gap-1"><X size={14} /> Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{goal.title}</h3>
              {goal.is_locked && <Lock size={12} className="text-gray-400" />}
              {goal.is_shared && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Shared</span>}
            </div>
            {goal.description && <p className="text-sm text-gray-500 mb-2">{goal.description}</p>}
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span>{goal.thrust_area_name || 'No thrust area'}</span>
              <span>·</span>
              <span>{uomLabels[goal.uom_type]}</span>
              <span>·</span>
              <span>Target: {goal.target_value ?? '—'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-brand-600">{goal.weightage}%</p>
              <p className="text-xs text-gray-400">weightage</p>
            </div>
            {canEdit && !goal.is_locked && (
              <div className="flex gap-1">
                <button onClick={() => setEditing(true)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                <button onClick={del} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
