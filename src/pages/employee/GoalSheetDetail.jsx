import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { Save, Loader2 } from 'lucide-react'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

const scoreLabel = (score) => {
  if (score == null) return '—'
  return `${(score * 100).toFixed(1)}%`
}

export default function GoalSheetDetail() {
  const { id } = useParams()
  const [sheet, setSheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})

  useEffect(() => {
    api.get(`/goal-sheets/${id}`)
      .then(r => setSheet(r.data))
      .catch(() => toast.error('Failed to load sheet'))
      .finally(() => setLoading(false))
  }, [id])

  const saveAchievement = async (goalId, quarter, data) => {
    setSaving(s => ({ ...s, [`${goalId}-${quarter}`]: true }))
    try {
      await api.put(`/goals/${goalId}/achievements/${quarter}`, data)
      toast.success('Achievement saved!')
      const r = await api.get(`/goal-sheets/${id}`)
      setSheet(r.data)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Save failed')
    } finally {
      setSaving(s => ({ ...s, [`${goalId}-${quarter}`]: false }))
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>
  if (!sheet) return <div className="p-8 text-gray-500">Sheet not found.</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Achievement Tracking</h1>
      <p className="text-gray-500 mb-6">{sheet.cycle_name}</p>

      <div className="space-y-6">
        {sheet.goals?.map(goal => (
          <div key={goal.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                <p className="text-sm text-gray-500">{goal.thrust_area_name} · {goal.uom_type} · {goal.weightage}%</p>
              </div>
              <span className="text-sm text-gray-600">Target: {goal.target_value ?? goal.target_date ?? '—'}</span>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {QUARTERS.map(q => {
                const key = `${goal.id}-${q}`
                const actual = goal[`${q.toLowerCase()}_actual`]
                const status = goal[`${q.toLowerCase()}_status`] || 'not_started'
                const score  = goal[`${q.toLowerCase()}_score`]
                const [val, setVal] = useState(actual ?? '')
                const [st,  setSt]  = useState(status)

                return (
                  <div key={q} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">{q}</p>
                    <input
                      type="number"
                      className="input text-sm mb-2"
                      placeholder="Actual"
                      value={val}
                      onChange={e => setVal(e.target.value)}
                    />
                    <select className="input text-sm mb-2" value={st} onChange={e => setSt(e.target.value)}>
                      <option value="not_started">Not Started</option>
                      <option value="on_track">On Track</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Score: {scoreLabel(score)}</span>
                      <button
                        onClick={() => saveAchievement(goal.id, q, { actual_value: val, status: st })}
                        disabled={saving[key]}
                        className="text-xs btn-primary py-1 px-2"
                      >
                        {saving[key] ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
