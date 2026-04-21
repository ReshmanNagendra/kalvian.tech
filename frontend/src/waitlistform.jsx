import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch(`${API_URL}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message || "You're on the list!")
        setEmail('')
        // Reset after 4 seconds
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 4000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Something went wrong. Try again.')
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 4000)
      }
    } catch {
      setStatus('error')
      setMessage('Could not connect. Try again later.')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 4000)
    }
  }

  if (status === 'success') {
    return (
      <div className="animate-fade-in flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-brand-500/15 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4,10 8,14 16,6" />
          </svg>
        </div>
        <p className="text-brand-400 text-sm font-medium">{message}</p>
      </div>
    )
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md mx-auto"
        id="waitlist-form"
      >
        <input
          type="email"
          required
          placeholder="Enter your student email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          className="flex-1 px-4 py-2.5 rounded-lg bg-surface-card border border-surface-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all duration-200 disabled:opacity-50"
          id="waitlist-email"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-5 py-2.5 rounded-lg font-medium text-sm text-white bg-brand-600 hover:bg-brand-500 active:bg-brand-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          id="waitlist-submit"
        >
          {status === 'loading' ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Joining...
            </span>
          ) : (
            'Join Waitlist'
          )}
        </button>
      </form>

      {status === 'error' && (
        <p className="mt-2 text-xs text-red-400 animate-fade-in">{message}</p>
      )}
    </div>
  )
}