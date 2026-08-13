const subjects = [
  {
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    nextClass: 'Today, 2:00 PM (Room 402)',
    attended: 23,
    total: 25,
    percent: 92,
    status: 'safe'
  },
  {
    code: 'CS302',
    name: 'Operating Systems',
    nextClass: 'Tomorrow, 10:00 AM (Lab 1)',
    attended: 18,
    total: 26,
    percent: 72,
    status: 'danger'
  },
  {
    code: 'MTH205',
    name: 'Discrete Mathematics',
    nextClass: 'Wed, 1:00 PM (Room 205)',
    attended: 17,
    total: 20,
    percent: 85,
    status: 'safe'
  }
];

const todaysSchedule = [
  {
    code: 'CS301 Data Structures',
    time: '09:00 AM',
    status: 'PRESENT',
    color: 'text-brand-400',
    dotColor: 'bg-brand-400'
  },
  {
    code: 'MTH302 Discrete Math',
    time: '11:30 AM',
    status: 'UPCOMING',
    color: 'text-sky-400',
    dotColor: 'bg-sky-400'
  }
];

function ProgressBar({ percent, status }) {
  const colorMap = {
    safe: 'bg-brand-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    upcoming: 'bg-surface-border',
  };

  return (
    <div className="h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${colorMap[status] || 'bg-brand-500'}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

// Helper to sort times like "12:50 PM"
function parseTime(timeStr) {
  if (!timeStr || timeStr === 'NO-TIME') return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let [_, hours, minutes, ampm] = match;
  hours = parseInt(hours, 10);
  if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return hours * 60 + parseInt(minutes, 10);
}

export default function ListView({ data, historyData, excludedSubjects = [], setExcludedSubjects }) {
  // Use real data if provided and not empty, otherwise fallback to mock data for layout purposes
  const hasRealData = data && data.length > 0;
  const displaySubjects = hasRealData ? data : subjects;
  
  // Compute real today's schedule
  const computedSchedule = hasRealData 
    ? [...data].sort((a, b) => parseTime(a.time) - parseTime(b.time)).map(sub => {
        let displayStatus = 'ABSENT';
        let color = 'text-red-400';
        let dotColor = 'bg-red-400';

        if (sub.status === 'safe') {
          displayStatus = 'PRESENT';
          color = 'text-brand-400';
          dotColor = 'bg-brand-400';
        } else if (sub.status === 'upcoming') {
          displayStatus = 'UPCOMING';
          color = 'text-text-muted';
          dotColor = 'bg-surface-border';
        }

        return {
          code: sub.name,
          time: sub.time && sub.time !== 'NO-TIME' ? sub.time : 'TBD',
          status: displayStatus,
          color,
          dotColor
        };
      })
    : todaysSchedule;

  // Filter out excluded subjects for KPI math
  const activeSubjects = displaySubjects.filter(sub => !excludedSubjects.includes(sub.code));

  // Calculate real KPIs based on active subjects
  const totalAttended = activeSubjects.reduce((sum, sub) => sum + (sub.attended || 0), 0);
  const totalClasses = activeSubjects.reduce((sum, sub) => sum + (sub.total || 0), 0);
  const overallPercent = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
  
  // Estimate safe margin (how many skips left before dropping below 75%)
  const safeMargin = Math.max(0, Math.floor((totalAttended * 100 / 75) - totalClasses));

  const toggleExclude = (code, checked) => {
    if (!setExcludedSubjects) return;
    if (checked) {
      setExcludedSubjects(excludedSubjects.filter(c => c !== code));
    } else {
      setExcludedSubjects([...excludedSubjects, code]);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full gap-8">
      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-5xl">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">OVERALL ATTENDANCE %</p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-bold text-brand-400">{hasRealData ? overallPercent : 88}%</span>
              <span className="text-sm font-medium text-text-secondary">/ 100%</span>
            </div>
            <ProgressBar percent={hasRealData ? overallPercent : 88} status={overallPercent >= 75 ? 'safe' : 'danger'} />
          </div>
          
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">SAFE MARGIN</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold text-text-primary">{hasRealData ? safeMargin : 14}</span>
              <span className="text-sm font-medium text-text-secondary">classes</span>
            </div>
            <p className="text-xs text-text-muted mt-2">Available skips before 75% limit.</p>
          </div>

          <div className="p-5 rounded-xl bg-surface-card border border-surface-border">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">TOTAL CLASSES ATTENDED</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold text-text-primary">{hasRealData ? totalAttended : 142}</span>
              <span className="text-sm font-medium text-text-secondary">/ {hasRealData ? totalClasses : 160}</span>
            </div>
            <p className="text-xs text-text-muted mt-2">Across all active subjects.</p>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div>
          <h2 className="text-sm font-medium text-text-secondary mb-4">Subject Breakdown</h2>
          <div className="space-y-4">
            {displaySubjects.map((subject, idx) => (
              <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-surface-card border border-surface-border gap-6 ${excludedSubjects.includes(subject.code) ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-text-secondary">{subject.code}</span>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">{subject.name}</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      Next: {subject.nextClass}
                    </div>
                    {setExcludedSubjects && (
                      <label className="flex items-center gap-2 cursor-pointer w-fit text-xs text-text-secondary font-medium">
                        <input 
                          type="checkbox"
                          checked={!excludedSubjects.includes(subject.code)}
                          onChange={(e) => toggleExclude(subject.code, e.target.checked)}
                          className="rounded border-surface-border text-brand-500 focus:ring-brand-500/20 bg-surface"
                        />
                        Include in overall average
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <div className="w-full sm:w-48">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-bold ${subject.status === 'safe' ? 'text-brand-400' : (subject.status === 'upcoming' ? 'text-text-muted' : 'text-red-400')}`}>
                        {subject.status === 'upcoming' ? '--' : `${subject.percent}%`}
                      </span>
                      <span className="text-[10px] font-medium text-text-muted">{subject.status === 'upcoming' ? 'Upcoming' : `${subject.attended}/${subject.total} Attended`}</span>
                    </div>
                    <ProgressBar percent={subject.percent} status={subject.status} />
                  </div>
                  <button 
                    onClick={() => alert('History details feature coming soon! Check Calendar View for overall history.')}
                    className="px-4 py-1.5 rounded bg-surface-elevated text-xs font-semibold text-text-primary hover:bg-surface-border transition-colors uppercase tracking-wider shrink-0"
                  >
                    HISTORY
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Panel */}
      <div className="w-full lg:w-[320px] shrink-0 lg:pt-0">
        <div className="p-5 rounded-xl bg-surface-card border border-surface-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-text-primary">Today{"'"}s Schedule</h3>
            <span className="text-xs font-medium text-text-secondary">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>

          <div className="space-y-5">
            {computedSchedule.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">{item.code}</span>
                  <div className="flex items-center gap-1.5">
                    {item.status === 'PRESENT' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                    {item.status !== 'PRESENT' && (
                      <div className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`}></div>
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-text-muted">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
