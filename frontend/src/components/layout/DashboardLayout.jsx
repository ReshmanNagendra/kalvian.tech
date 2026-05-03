import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

export default function DashboardLayout() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    // Persist preference
    return localStorage.getItem('kalvian_sidebar') === 'collapsed'
  })

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('kalvian_sidebar', next ? 'collapsed' : 'expanded')
  }
  
  const navItems = [
    { name: 'Focus Workspace', path: '/dashboard/workspace', icon: '💻' },
    { name: 'Attendance Calculator', path: '/dashboard/attendance', icon: '📊' },
    { name: 'Quick Utilities', path: '/dashboard/tools', icon: '🛠️' },
    { name: 'Code Vault', path: '/dashboard/vault', icon: '🔒' },
    { name: 'Squad Huddle', path: '/dashboard/squad', icon: '👥', isPrototype: true },
    { name: 'Resource Library', path: '/dashboard/resources', icon: '📚' }
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-3.5rem)] bg-surface text-text-primary">
      {/* Sidebar Navigation */}
      <aside
        className={`bg-surface-card border-r border-b md:border-b-0 border-surface-border flex-shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-full md:w-[68px]' : 'w-full md:w-64'
        }`}
      >
        {/* Header with collapse toggle */}
        <div className="px-3 py-3 border-b border-surface-border hidden md:flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider pl-1 transition-opacity duration-200">
              Dashboard
            </h2>
          )}
          <button
            onClick={toggle}
            className={`p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors ${collapsed ? 'mx-auto' : ''}`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18" />
                  <path d="M14 9l3 3-3 3" />
                </>
              ) : (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18" />
                  <path d="M16 9l-3 3 3 3" />
                </>
              )}
            </svg>
          </button>
        </div>

        <nav className={`p-2 space-y-0.5 overflow-x-auto md:overflow-x-visible flex md:block whitespace-nowrap ${collapsed ? 'items-center' : ''}`}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.name}
                to={item.isPrototype ? '#' : item.path}
                onClick={item.isPrototype ? (e) => e.preventDefault() : undefined}
                title={collapsed ? item.name + (item.isPrototype ? ' (Coming Soon)' : '') : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  collapsed ? 'justify-center' : ''
                } ${
                  item.isPrototype
                    ? 'opacity-40 grayscale cursor-not-allowed pointer-events-none'
                    : isActive 
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                      : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </div>
                {!collapsed && item.isPrototype && (
                  <span className="ml-auto text-[8px] font-bold bg-surface-border px-1 rounded text-text-muted">SOON</span>
                )}
              </Link>
            )
          })}
          
          <div className={`md:pt-3 md:mt-3 md:border-t border-surface-border inline-block md:block ${collapsed ? '' : 'ml-0'}`}>
             <Link
                to="/dashboard/settings"
                title={collapsed ? 'Profile/Settings' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  collapsed ? 'justify-center' : ''
                } ${
                  location.pathname === '/dashboard/settings'
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                    : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary border border-transparent'
                }`}
              >
                <span className="text-base flex-shrink-0">⚙️</span>
                {!collapsed && <span>Profile/Settings</span>}
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
