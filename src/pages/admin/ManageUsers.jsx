import { useEffect, useState } from 'react'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { UserPlus, Search } from 'lucide-react'

const ROLES = ['employee', 'manager', 'admin']

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [managers, setManagers] = useState([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', department: '', manager_id: '' })
  const [loading, setLoading] = useState(true)

  const load = () => {
    Promise.all([api.get('/users'), api.get('/users/managers')])
      .then(([u, m]) => { setUsers(u.data); setManagers(m.data) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const addUser = async (e) => {
    e.preventDefault()
    try {
      await api.post('/auth/register', { ...form, manager_id: form.manager_id || null })
      toast.success('User created!')
      setShowAdd(false)
      setForm({ name: '', email: '', password: '', role: 'employee', department: '', manager_id: '' })
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create user')
    }
  }

  const toggleActive = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { ...user, is_active: !user.is_active })
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`)
      load()
    } catch (e) {
      toast.error('Failed to update user')
    }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          <UserPlus size={14} /> Add User
        </button>
      </div>

      {showAdd && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">New User</h2>
          <form onSubmit={addUser} className="grid grid-cols-2 gap-4">
            <div><label className="label">Name *</label><input className="input" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div><label className="label">Email *</label><input className="input" type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
            <div><label className="label">Password *</label><input className="input" type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} /></div>
            <div><label className="label">Department</label><input className="input" value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))} /></div>
            <div>
              <label className="label">Role *</label>
              <select className="input" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Manager</label>
              <select className="input" value={form.manager_id} onChange={e => setForm(f => ({...f, manager_id: e.target.value}))}>
                <option value="">No manager</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Create User</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="relative mb-4 max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              {['Name','Email','Role','Department','Manager','Status','Action'].map(h => (
                <th key={h} className="pb-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(u => (
              <tr key={u.id}>
                <td className="py-3 font-medium text-gray-900">{u.name}</td>
                <td className="py-3 text-gray-500">{u.email}</td>
                <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'manager' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                <td className="py-3 text-gray-500">{u.department || '—'}</td>
                <td className="py-3 text-gray-500">{u.manager_name || '—'}</td>
                <td className="py-3"><span className={`text-xs ${u.is_active ? 'text-green-600' : 'text-red-500'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="py-3">
                  <button onClick={() => toggleActive(u)} className="text-xs text-gray-500 hover:text-brand-600">
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
