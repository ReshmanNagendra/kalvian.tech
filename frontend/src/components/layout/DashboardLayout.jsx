import { Link, Outlet, useLocation } from 'react-router-dom'

export default function DashboardLayout() {
  const location = useLocation()
  
  const navItems = [
    { name: 'Focus Workspace', path: '/dashboard/workspace', icon: '💻' },
    { name: 'Attendance Calculator', path: '/dashboard/attendance', icon: '📊' },
    { name: 'Quick Utilities', path: '/dashboard/tools', icon: '🛠️' },
    { name: 'Code Vault', path: '/dashboard/vault', icon: '🔒' },
    { name: 'Squad Huddle', path: '/dashboard/squad', icon: '👥' },
    { name: 'Resource Library', path: '/dashboard/resources', icon: '📚' }
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-3.5rem)] bg-surface text-text-primary">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-surface-card border-r border-b md:border-b-0 border-surface-border flex-shrink-0">
        <div className="p-4 border-b border-surface-border hidden md:block">
           <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Dashboard</h2>
        </div>
        <nav className="p-4 space-y-1 overflow-x-auto md:overflow-x-visible flex md:block whitespace-nowrap">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                    : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary border border-transparent'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            )
          })}
          
          <div className="md:pt-4 md:mt-4 md:border-t border-surface-border inline-block md:block ml-2 md:ml-0">
             <Link
                to="/dashboard/settings"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/dashboard/settings'
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                    : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary border border-transparent'
                }`}
              >
                <span>⚙️</span>
                <span>Profile/Settings</span>
              </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
