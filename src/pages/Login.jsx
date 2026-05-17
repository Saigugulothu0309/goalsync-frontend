import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Target, Loader2 } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      if (user.role === 'admin')   return navigate('/admin')
      if (user.role === 'manager') return navigate('/manager')
      navigate('/employee')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    const creds = {
      admin:    { email: 'admin@goalsync.com',    password: 'Password123!' },
      manager:  { email: 'manager@goalsync.com',  password: 'Password123!' },
      employee: { email: 'employee@goalsync.com', password: 'Password123!' },
    }
    setForm(creds[role])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-brand-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-4">
            <Target size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">GoalSync</h1>
          <p className="text-gray-400 mt-1">Goal Setting & Tracking Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email" required
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password" required
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </form>

          {/* Demo shortcuts */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">Demo accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {['employee','manager','admin'].map(role => (
                <button
                  key={role}
                  onClick={() => fillDemo(role)}
                  className="text-xs py-1.5 px-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 capitalize transition-colors"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
