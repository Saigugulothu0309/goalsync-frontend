import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Target, Users, Settings, BarChart2, CheckSquare, Home, FileText } from 'lucide-react'

const navConfig = {
  employee: [
    { to: '/employee',            icon: Home,        label: 'Dashboard' },
    { to: '/employee/goal-sheet', icon: Target,       label: 'My Goal Sheet' },
  ],
  manager: [
    { to: '/manager',      icon: Home,        label: 'Dashboard' },
    { to: '/manager/team', icon: Users,        label: 'Team Sheets' },
  ],
  admin: [
    { to: '/admin',          icon: Home,       label: 'Dashboard' },
    { to: '/admin/users',    icon: Users,      label: 'Users' },
    { to: '/admin/cycles',   icon: Settings,   label: 'Cycles' },
    { to: '/admin/reports',  icon: BarChart2,  label: 'Reports' },
  ],
}

const roleColors = {
  employee: 'bg-blue-600',
  manager:  'bg-emerald-600',
  admin:    'bg-purple-600',
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = navConfig[user?.role] || []

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${roleColors[user?.role]} flex items-center justify-center`}>
              <Target size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">GoalSync</p>
              <p className="text-gray-400 text-xs capitalize">{user?.role} Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to.split('/').length === 2}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-white text-xs font-medium">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors">
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
