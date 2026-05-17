import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { Plus, Send, Loader2, Target } from 'lucide-react'
import GoalCard from '../../components/GoalCard'
import AddGoalModal from '../../components/AddGoalModal'

export default function MyGoalSheet() {
  const navigate = useNavigate()
  const [cycle, setCycle] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [goals, setGoals] = useState([])
  const [thrustAreas, setThrustAreas] = useState([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const [c, s, t] = await Promise.all([
        api.get('/cycles/active'),
        api.get('/goal-sheets'),
        api.get('/thrust-areas'),
      ])
      setCycle(c.data)
      setThrustAreas(t.data)
      const existing = s.data.find(sh => sh.cycle_id === c.data.id)
      setSheet(existing || null)
      if (existing) {
        const full = await api.get(`/goal-sheets/${existing.id}`)
        setGoals(full.data.goals || [])
      }
    } catch (e) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const createSheet = async () => {
    try {
      const { data } = await api.post('/goal-sheets', { cycle_id: cycle.id })
      setSheet(data)
      toast.success('Goal sheet created!')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create sheet')
    }
  }

  const submitSheet = async () => {
    setSubmitting(true)
    try {
      await api.post(`/goal-sheets/${sheet.id}/submit`)
      toast.success('Goal sheet submitted for approval!')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const totalWeightage = goals.reduce((s, g) => s + Number(g.weightage), 0)
  const weightageOk = Math.abs(totalWeightage - 100) < 0.01
  const canEdit = sheet && ['draft', 'returned'].includes(sheet.status)
  const canSubmit = canEdit && goals.length > 0 && weightageOk

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Goal Sheet</h1>
          <p className="text-gray-500 text-sm mt-1">{cycle?.name || 'No active cycle'}</p>
        </div>
        <div className="flex gap-3">
          {canEdit && (
            <button onClick={() => setShowAddGoal(true)} disabled={goals.length >= 8} className="btn-secondary flex items-center gap-2">
              <Plus size={14} />
              Add Goal {goals.length}/8
            </button>
          )}
          {canSubmit && (
            <button onClick={submitSheet} disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Submit for Approval
            </button>
          )}
        </div>
      </div>

      {/* No cycle */}
      {!cycle && (
        <div className="card text-center py-12 text-gray-400">
          <Target size={48} className="mx-auto mb-3 opacity-30" />
          <p>No active goal cycle.</p>
        </div>
      )}

      {/* No sheet yet */}
      {cycle && !sheet && (
        <div className="card text-center py-12">
          <Target size={48} className="mx-auto mb-3 text-brand-300" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Create your goal sheet</h2>
          <p className="text-gray-500 mb-6">Start setting your goals for {cycle.name}</p>
          <button onClick={createSheet} className="btn-primary mx-auto">Create Goal Sheet</button>
        </div>
      )}

      {/* Sheet exists */}
      {sheet && (
        <>
          {/* Status bar */}
          <div className="card mb-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span className={`badge-${sheet.status}`}>{sheet.status}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Goals</p>
                <p className="text-sm font-semibold">{goals.length} / 8</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Weightage</p>
                <p className={`text-sm font-semibold ${weightageOk ? 'text-green-600' : 'text-red-600'}`}>
                  {totalWeightage.toFixed(1)}% {weightageOk ? '✓' : '(must be 100%)'}
                </p>
              </div>
            </div>
            {sheet.status === 'approved' && (
              <span className="text-green-600 text-sm font-medium">✓ Approved by manager</span>
            )}
          </div>

          {/* Return reason */}
          {sheet.return_reason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800 font-medium text-sm">Returned for revision</p>
              <p className="text-red-600 text-sm mt-1">{sheet.return_reason}</p>
            </div>
          )}

          {/* Goals list */}
          {goals.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">
              <p>No goals added yet. Click "Add Goal" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  canEdit={canEdit}
                  thrustAreas={thrustAreas}
                  sheetId={sheet.id}
                  onUpdated={load}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showAddGoal && (
        <AddGoalModal
          sheetId={sheet?.id}
          thrustAreas={thrustAreas}
          onClose={() => setShowAddGoal(false)}
          onAdded={() => { setShowAddGoal(false); load() }}
        />
      )}
    </div>
  )
}
