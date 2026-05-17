import { useEffect, useState } from 'react'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { Plus, Zap } from 'lucide-react'

export default function ManageCycles() {
  const [cycles, setCycles] = useState([])
  const [thrustAreas, setThrustAreas] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showThrust, setShowThrust] = useState(false)
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '', goal_setting_opens: '', q1_opens: '', q2_opens: '', q3_opens: '', q4_opens: '' })
  const [thrustForm, setThrustForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(true)

  const load = () => {
    Promise.all([api.get('/cycles'), api.get('/thrust-areas')])
      .then(([c, t]) => { setCycles(c.data); setThrustAreas(t.data) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const createCycle = async (e) => {
    e.preventDefault()
    try {
      await api.post('/cycles', form)
      toast.success('Cycle created!')
      setShowForm(false)
      load()
    } catch (e) { toast.error(e.response?.data?.error || 'Failed') }
  }

  const activate = async (id) => {
    try {
      await api.post(`/cycles/${id}/activate`)
      toast.success('Cycle activated!')
      load()
    } catch (e) { toast.error('Failed to activate') }
  }

  const createThrust = async (e) => {
    e.preventDefault()
    try {
      await api.post('/thrust-areas', thrustForm)
      toast.success('Thrust area created!')
      setThrustForm({ name: '', description: '' })
      setShowThrust(false)
      load()
    } catch (e) { toast.error('Failed') }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Goal Cycles & Thrust Areas</h1>

      {/* Cycles */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Goal Cycles</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus size={14} /> New Cycle</button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h3 className="font-semibold mb-4">New Cycle</h3>
          <form onSubmit={createCycle} className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Cycle Name *</label><input className="input" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. FY 2026-27" /></div>
            {[['start_date','Start Date'],['end_date','End Date'],['goal_setting_opens','Goal Setting Opens'],['q1_opens','Q1 Opens'],['q2_opens','Q2 Opens'],['q3_opens','Q3 Opens'],['q4_opens','Q4 Opens']].map(([k, l]) => (
              <div key={k}><label className="label">{l}</label><input className="input" type="date" value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} /></div>
            ))}
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card mb-8">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b border-gray-100">
            {['Name','Start','End','Status','Action'].map(h => <th key={h} className="pb-3 font-medium">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {cycles.map(c => (
              <tr key={c.id}>
                <td className="py-3 font-medium text-gray-900">{c.name}</td>
                <td className="py-3 text-gray-500">{c.start_date?.slice(0,10)}</td>
                <td className="py-3 text-gray-500">{c.end_date?.slice(0,10)}</td>
                <td className="py-3">{c.is_active ? <span className="badge-approved">Active</span> : <span className="badge-draft">Inactive</span>}</td>
                <td className="py-3">
                  {!c.is_active && (
                    <button onClick={() => activate(c.id)} className="text-xs flex items-center gap-1 text-amber-600 hover:text-amber-700">
                      <Zap size={12} /> Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {cycles.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-400">No cycles yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Thrust Areas */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Thrust Areas</h2>
        <button onClick={() => setShowThrust(!showThrust)} className="btn-secondary flex items-center gap-2"><Plus size={14} /> Add Area</button>
      </div>

      {showThrust && (
        <div className="card mb-4">
          <form onSubmit={createThrust} className="flex gap-3">
            <input className="input flex-1" required placeholder="Thrust area name" value={thrustForm.name} onChange={e => setThrustForm(f => ({...f, name: e.target.value}))} />
            <input className="input flex-1" placeholder="Description (optional)" value={thrustForm.description} onChange={e => setThrustForm(f => ({...f, description: e.target.value}))} />
            <button type="submit" className="btn-primary whitespace-nowrap">Add</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="divide-y divide-gray-100">
          {thrustAreas.map(t => (
            <div key={t.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                {t.description && <p className="text-xs text-gray-400">{t.description}</p>}
              </div>
              <span className="text-xs text-green-600">Active</span>
            </div>
          ))}
          {thrustAreas.length === 0 && <p className="py-6 text-center text-gray-400 text-sm">No thrust areas yet.</p>}
        </div>
      </div>
    </div>
  )
}
