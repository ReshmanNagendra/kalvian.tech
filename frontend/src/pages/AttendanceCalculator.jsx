import { useState, useMemo } from 'react'

const STATUS_CONFIG = {
  safe: {
    label: "You're Safe",
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/20',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400">
        <circle cx="10" cy="10" r="8" />
        <polyline points="6,10 9,13 14,7" />
      </svg>
    ),
  },
  warning: {
    label: 'Getting Risky',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
        <path d="M10 3L2 17h16L10 3z" />
        <line x1="10" y1="8" x2="10" y2="12" />
        <circle cx="10" cy="14.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  danger: {
    label: 'Danger Zone',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
        <circle cx="10" cy="10" r="8" />
        <line x1="7" y1="7" x2="13" y2="13" />
        <line x1="13" y1="7" x2="7" y2="13" />
      </svg>
    ),
  },
}

function getStatus(percent) {
  if (percent >= 85) return 'safe'
  if (percent >= 75) return 'warning'
  return 'danger'
}

function InputField({ label, hint, value, onChange, min, max, suffix, id }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm font-medium tabular-nums focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-[11px] text-text-muted">{hint}</p>}
    </div>
  )
}

function StatCard({ label, value, sub, accent, large }) {
  return (
    <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
      <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-bold tabular-nums ${large ? 'text-2xl' : 'text-xl'} ${accent || 'text-text-primary'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
    </div>
  )
}

function ProgressBar({ percent, status }) {
  const clampedPercent = Math.max(0, Math.min(100, percent))
  const colorMap = {
    safe: 'bg-brand-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">Attendance</span>
        <span className={`font-semibold tabular-nums ${STATUS_CONFIG[status].color}`}>
          {percent.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorMap[status]}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      {/* Threshold markers */}
      <div className="relative h-3">
        <div className="absolute left-[75%] -translate-x-1/2 flex flex-col items-center">
          <div className="w-px h-1.5 bg-text-muted/30" />
          <span className="text-[9px] text-text-muted mt-0.5">75%</span>
        </div>
        <div className="absolute left-[85%] -translate-x-1/2 flex flex-col items-center">
          <div className="w-px h-1.5 bg-text-muted/30" />
          <span className="text-[9px] text-text-muted mt-0.5">85%</span>
        </div>
      </div>
    </div>
  )
}

export default function AttendanceCalculator() {
  const [currentPercent, setCurrentPercent] = useState('')
  const [totalSessions, setTotalSessions] = useState('')
  const [targetPercent, setTargetPercent] = useState('75')

  const results = useMemo(() => {
    const percent = parseFloat(currentPercent)
    const total = parseInt(totalSessions, 10)
    const target = parseFloat(targetPercent)

    if (isNaN(percent) || isNaN(total) || isNaN(target) || total <= 0 || percent < 0 || percent > 100) {
      return null
    }

    // Sessions attended so far
    const attended = Math.round((percent / 100) * total)

    // How many sessions can you skip while staying >= target%?
    // After skipping S sessions: attended / (total + S) >= target/100
    // We want to find max S where: attended / (total + S) >= target/100
    // attended * 100 >= target * (total + S)
    // attended * 100 / target - total >= S
    // S <= (attended * 100 / target) - total
    const maxSkippable = Math.floor((attended * 100 / target) - total)
    const canSkip = Math.max(0, maxSkippable)

    // What happens if you skip all skippable sessions?
    const futureTotal = total + canSkip
    const futurePercent = futureTotal > 0 ? (attended / futureTotal) * 100 : 0

    // What happens if you skip one more than allowed?
    const overdoneTotal = total + canSkip + 1
    const overdonePercent = overdoneTotal > 0 ? (attended / overdoneTotal) * 100 : 0

    // How many more sessions to attend to reach target if currently below?
    let needToAttend = 0
    if (percent < target) {
      // (attended + X) / (total + X) >= target/100
      // attended + X >= target * (total + X) / 100
      // attended * 100 + X * 100 >= target * total + target * X
      // X * (100 - target) >= target * total - attended * 100
      // X >= (target * total - attended * 100) / (100 - target)
      if (target < 100) {
        needToAttend = Math.ceil((target * total - attended * 100) / (100 - target))
        needToAttend = Math.max(0, needToAttend)
      } else {
        needToAttend = Infinity
      }
    }

    return {
      attended,
      canSkip,
      futurePercent,
      overdonePercent,
      needToAttend,
      currentStatus: getStatus(percent),
      futureStatus: getStatus(futurePercent),
    }
  }, [currentPercent, totalSessions, targetPercent])

  const hasInput = currentPercent !== '' && totalSessions !== ''

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4">
            <span className="text-brand-400 text-[11px] font-medium tracking-wide uppercase">Calculator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-2">
            Attendance Strategist
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-md">
            Calculate exactly how many sessions you can skip without falling below the required attendance threshold.
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Current Attendance"
              hint="Check your Kalvium portal"
              value={currentPercent}
              onChange={setCurrentPercent}
              min={0}
              max={100}
              suffix="%"
              id="current-attendance"
            />
            <InputField
              label="Total Sessions Conducted"
              hint="Total classes held so far"
              value={totalSessions}
              onChange={setTotalSessions}
              min={1}
              max={9999}
              id="total-sessions"
            />
          </div>

          <InputField
            label="Minimum Required Attendance"
            hint="Most programs require 75%"
            value={targetPercent}
            onChange={setTargetPercent}
            min={0}
            max={100}
            suffix="%"
            id="target-attendance"
          />
        </div>

        {/* Results */}
        {hasInput && results && (
          <div className="space-y-5 animate-fade-in">
            {/* Status Banner */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${STATUS_CONFIG[results.currentStatus].bg} ${STATUS_CONFIG[results.currentStatus].border}`}>
              {STATUS_CONFIG[results.currentStatus].icon}
              <div>
                <p className={`text-sm font-semibold ${STATUS_CONFIG[results.currentStatus].color}`}>
                  {STATUS_CONFIG[results.currentStatus].label}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {results.currentStatus === 'safe' && 'Your attendance is healthy. You have room to breathe.'}
                  {results.currentStatus === 'warning' && "Be careful — you're close to the threshold."}
                  {results.currentStatus === 'danger' && `You're below ${targetPercent}%. Attend classes to recover.`}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <ProgressBar
              percent={parseFloat(currentPercent)}
              status={results.currentStatus}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard
                label="Sessions Attended"
                value={results.attended}
                sub={`out of ${totalSessions}`}
              />
              <StatCard
                label="You Can Skip"
                value={results.canSkip}
                sub={results.canSkip === 0 ? "Can't skip any" : `session${results.canSkip !== 1 ? 's' : ''}`}
                accent={results.canSkip > 0 ? 'text-brand-400' : 'text-red-400'}
                large
              />
              <StatCard
                label="After Skipping"
                value={`${results.futurePercent.toFixed(1)}%`}
                sub={results.canSkip > 0 ? `If you skip ${results.canSkip}` : 'No room to skip'}
              />
            </div>

            {/* Extra insights */}
            <div className="space-y-2.5 pt-1">
              {/* Need to attend warning */}
              {results.needToAttend > 0 && results.needToAttend !== Infinity && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-card border border-surface-border">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
                      <path d="M8 3v5M8 10.5v.5" strokeLinecap="round" />
                      <circle cx="8" cy="8" r="7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Attend <span className="text-amber-400 font-bold">{results.needToAttend}</span> more consecutive session{results.needToAttend !== 1 ? 's' : ''} to reach {targetPercent}%
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Don{"'"}t skip until you{"'"}re back above the threshold
                    </p>
                  </div>
                </div>
              )}

              {/* What if you skip one more */}
              {results.canSkip > 0 && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-card border border-surface-border">
                  <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                      <circle cx="8" cy="8" r="7" />
                      <path d="M8 5v3l2 2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">
                      If you skip <span className="text-text-primary font-medium">{results.canSkip + 1}</span>, attendance drops to{' '}
                      <span className={`font-semibold ${results.overdonePercent < parseFloat(targetPercent) ? 'text-red-400' : 'text-amber-400'}`}>
                        {results.overdonePercent.toFixed(1)}%
                      </span>
                      {results.overdonePercent < parseFloat(targetPercent) && (
                        <span className="text-red-400"> — below {targetPercent}%!</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-text-muted text-center pt-2">
              This is an estimate. Always verify with your official Kalvium portal.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!hasInput && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 4v2M16 4v2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary mb-1">Enter your attendance details above</p>
            <p className="text-xs text-text-muted">We{"'"}ll tell you exactly how many sessions you can skip</p>
          </div>
        )}
      </div>
    </div>
  )
}
