import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    // Check local storage first
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('kalvian_theme')
      if (savedTheme) {
        return savedTheme
      }
      // If no saved theme, check OS preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    }
    // Fallback to light as per prompt instruction (or dark as default if preferred, but we will use OS preference which usually falls back to light/dark)
    return 'dark' // Actually, Kalvium target is 'dark mode everywhere' so default to dark if OS has no preference
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
      root.classList.add('dark') // for tailwind dark: variants if used
    } else {
      root.removeAttribute('data-theme')
      root.classList.remove('dark')
    }
    localStorage.setItem('kalvian_theme', theme)
    
    // Dispatch a custom event so other purely non-React scripts (like CodeMirror) could theoretically listen if they needed to
    window.dispatchEvent(new Event('themechange'))
  }, [theme])

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors border border-transparent hover:border-surface-border flex items-center justify-center"
      aria-label="Toggle Dark Mode"
      title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
           <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
           <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}
