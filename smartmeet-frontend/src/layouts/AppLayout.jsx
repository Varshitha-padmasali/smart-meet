import { Outlet, NavLink } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo.jsx'
import useAuth from '../hooks/useAuth.js'

const appNavItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Meetings', to: '/meetings' },
  { label: 'Create', to: '/create-meeting' },
  { label: 'Join', to: '/join' },
]

const publicNavItems = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/#features' },
  { label: 'Login', to: '/login' },
  { label: 'Sign Up', to: '/signup' },
]

// AppLayout wraps every route with shared navigation and page spacing.
function AppLayout() {
  const { isAuthenticated, isGuest } = useAuth()
  const navItems = isAuthenticated && !isGuest ? appNavItems : publicNavItems

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <BrandLogo />
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              item.to.includes('#') ? (
                <a
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                  href={item.to}
                  key={item.to}
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-cyan-50 text-cyan-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`
                  }
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              )
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
