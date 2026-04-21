import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('kalvian_theme') || 'dark')

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('kalvian_theme', newTheme)
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.setAttribute('data-theme', 'dark')
      root.classList.add('dark')
    } else {
      root.removeAttribute('data-theme')
      root.classList.remove('dark')
    }
    window.dispatchEvent(new Event('themechange'))
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Failed to log out:', err)
    }
  }

  const handleClearData = () => {
    if (window.confirm('This will delete all locally saved snippets, workspace data, and preferences. This cannot be undone. Continue?')) {
      localStorage.removeItem('kalvian_snippets')
      localStorage.removeItem('kalvian_workspace')
      localStorage.removeItem('kalvian_authmock')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  // Export all local data
  const handleExportData = () => {
    const data = {
      snippets: JSON.parse(localStorage.getItem('kalvian_snippets') || '[]'),
      workspace: JSON.parse(localStorage.getItem('kalvian_workspace') || '{}'),
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.email || 'anonymous'
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kalvian-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-6 sm:p-8 lg:p-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">Settings</h1>
          <p className="text-sm text-text-secondary">Manage your profile, preferences, and data.</p>
        </div>

        {/* Profile Section */}
        <section className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-border bg-surface-elevated/50">
            <h2 className="text-sm font-semibold text-text-primary">Profile</h2>
          </div>
          <div className="p-6 space-y-4">
            {currentUser ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{currentUser.email?.split('@')[0]}</p>
                    <p className="text-xs text-text-muted">{currentUser.email}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Joined {currentUser.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'recently'}
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-text-secondary text-sm mb-3">Sign in to sync your data across devices.</p>
                <a href="/login" className="inline-flex px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors">
                  Sign In
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Appearance */}
        <section className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-border bg-surface-elevated/50">
            <h2 className="text-sm font-semibold text-text-primary">Appearance</h2>
          </div>
          <div className="p-6">
            <p className="text-xs text-text-secondary mb-3">Choose your preferred theme</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  theme === 'dark'
                    ? 'border-brand-500 bg-brand-500/5'
                    : 'border-surface-border hover:border-surface-border-light'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#0a0a0f] border border-[#1f1f2e] mb-3 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e5e5e5" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </div>
                <p className="text-sm font-semibold text-text-primary">Dark</p>
                <p className="text-[11px] text-text-muted">Easy on the eyes</p>
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  theme === 'light'
                    ? 'border-brand-500 bg-brand-500/5'
                    : 'border-surface-border hover:border-surface-border-light'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-[#e2e8f0] mb-3 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
                </div>
                <p className="text-sm font-semibold text-text-primary">Light</p>
                <p className="text-[11px] text-text-muted">Clean and bright</p>
              </button>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-border bg-surface-elevated/50">
            <h2 className="text-sm font-semibold text-text-primary">Data Management</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Export All Data</p>
                <p className="text-[11px] text-text-muted">Download your snippets & workspace as JSON</p>
              </div>
              <button
                onClick={handleExportData}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary bg-surface-elevated border border-surface-border hover:text-text-primary hover:bg-surface transition-colors flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v9M4 8l4 4 4-4M2 14h12" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Export
              </button>
            </div>

            <div className="h-px bg-surface-border"></div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-400">Clear Local Data</p>
                <p className="text-[11px] text-text-muted">Remove all saved snippets and workspace data</p>
              </div>
              <button
                onClick={handleClearData}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                {saved ? 'Cleared ✓' : 'Clear All'}
              </button>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-border bg-surface-elevated/50">
            <h2 className="text-sm font-semibold text-text-primary">About</h2>
          </div>
          <div className="p-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Version</span>
              <span className="text-text-primary font-mono text-xs">1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Built by</span>
              <span className="text-text-primary text-xs">Kalvian</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Storage</span>
              <span className="text-text-primary text-xs">Local + Firebase</span>
            </div>
            <p className="text-[10px] text-text-muted pt-2 text-center">
              kalvian.tech is not officially affiliated with Kalvium.
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
