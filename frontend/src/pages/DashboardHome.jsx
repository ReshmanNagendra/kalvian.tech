import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const quickApps = [
  { name: 'Focus Workspace', icon: '💻', path: '/dashboard/workspace', desc: 'Split-screen IDE', color: 'from-emerald-500/20 to-emerald-500/5' },
  { name: 'Attendance', icon: '📊', path: '/dashboard/attendance', desc: 'Skip calculator', color: 'from-amber-500/20 to-amber-500/5' },
  { name: 'Code Vault', icon: '🔒', path: '/dashboard/vault', desc: 'Snippet manager', color: 'from-violet-500/20 to-violet-500/5' },
  { name: 'Squad Huddle', icon: '👥', path: '/dashboard/squad', desc: 'Live presence', color: 'from-sky-500/20 to-sky-500/5', isPrototype: true },
  { name: 'Resources', icon: '📚', path: '/dashboard/resources', desc: 'Study materials', color: 'from-rose-500/20 to-rose-500/5' },
  { name: 'Quick Tools', icon: '🛠️', path: '/dashboard/tools', desc: 'Utilities suite', color: 'from-orange-500/20 to-orange-500/5' },
]

const tips = [
  "Use the Focus Workspace to keep your Dojo problem visible while coding.",
  "Save your best DSA solutions in the Code Vault for open-book exams.",
  "Check the Attendance Calculator before deciding to skip that morning class.",
  "Start a War Room from Squad Huddle to study with peers across campuses.",
  "Upload your notes to Resource Library — help your batch, earn upvotes.",
]

export default function DashboardHome() {
  const { currentUser } = useAuth()
  
  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const displayName = currentUser?.email?.split('@')[0] || 'Student'
  const randomTip = tips[Math.floor(Math.random() * tips.length)]

  // Get saved snippets count
  let snippetCount = 0
  try {
    const saved = localStorage.getItem('kalvian_snippets')
    if (saved) snippetCount = JSON.parse(saved).length
  } catch { /* ignore */ }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-6 sm:p-8 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-br from-brand-500/10 via-surface-card to-surface-card p-6 sm:p-8">
          <div className="relative z-10">
            <p className="text-sm font-medium text-brand-400 mb-1">{greeting()} 👋</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-2">
              {currentUser ? displayName : 'Welcome to kalvian.tech'}
            </h1>
            <p className="text-sm text-text-secondary max-w-lg leading-relaxed">
              Your personal productivity hub for everything Kalvium. Pick a tool from below or use the sidebar to navigate.
            </p>

            {!currentUser && (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Sign in to unlock all features
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            )}
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-brand-500/5 blur-2xl pointer-events-none"></div>
          <div className="absolute -right-4 -bottom-8 w-32 h-32 rounded-full bg-brand-500/8 blur-xl pointer-events-none"></div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">Saved Snippets</p>
            <p className="text-2xl font-bold text-text-primary tabular-nums">{snippetCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">Tools Available</p>
            <p className="text-2xl font-bold text-text-primary tabular-nums">5</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">Universities</p>
            <p className="text-2xl font-bold text-brand-400 tabular-nums">21</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">Status</p>
            <p className="text-sm font-bold text-brand-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              All Systems Live
            </p>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">Quick Access</h2>
            <span className="text-xs text-text-muted">{quickApps.length} tools</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {quickApps.map(app => (
              <Link
                key={app.name}
                to={app.isPrototype ? '#' : app.path}
                onClick={app.isPrototype ? (e) => e.preventDefault() : undefined}
                className={`group relative p-5 rounded-xl bg-surface-card border transition-all duration-300 ${
                  app.isPrototype 
                    ? 'border-surface-border/50 opacity-60 grayscale cursor-not-allowed' 
                    : 'border-surface-border hover:border-brand-500/30 hover:-translate-y-0.5'
                }`}
              >
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${app.color} opacity-0 ${!app.isPrototype && 'group-hover:opacity-100'} transition-opacity duration-300 pointer-events-none`}></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{app.icon}</span>
                    {app.isPrototype && (
                      <span className="px-1.5 py-0.5 bg-surface-border text-[9px] font-bold text-text-muted uppercase tracking-wider rounded">Soon</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-0.5">{app.name}</h3>
                  <p className="text-[11px] text-text-muted">{app.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pro Tip */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-card border border-surface-border">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-400">
              <circle cx="8" cy="8" r="7" />
              <path d="M8 5v3M8 10.5v.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-0.5">Pro Tip</p>
            <p className="text-sm text-text-secondary">{randomTip}</p>
          </div>
        </div>

      </div>
    </div>
  )
}
