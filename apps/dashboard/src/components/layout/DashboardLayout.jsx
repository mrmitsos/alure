import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  BarChart3,
  LogOut,
  Mountain,
  Waves
} from 'lucide-react'

const navItems = [
  { to: '/',           icon: LayoutDashboard, label: 'Overview'   },
  { to: '/properties', icon: Building2,       label: 'Properties' },
  { to: '/bookings',   icon: CalendarCheck,   label: 'Bookings'   },
  { to: '/analytics',  icon: BarChart3,       label: 'Analytics'  },
]

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-50">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col">

        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Mountain className="text-amber-400" size={20} />
            <span className="text-white font-bold text-lg">Ski</span>
            <Waves className="text-blue-400" size={20} />
            <span className="text-white font-bold text-lg">Sea</span>
          </div>
          <p className="text-slate-400 text-xs">Alure Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors"
          >
            <LogOut size={18} />
            Logout
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