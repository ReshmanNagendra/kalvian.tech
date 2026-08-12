import { useState } from 'react';

// Mock data for the calendar grid
// Nov 2023 started on Wednesday, has 30 days.
// Prev month days: 29, 30, 31 (Sun, Mon, Tue)
const calendarDays = [
  { day: 29, isCurrentMonth: false, events: [] },
  { day: 30, isCurrentMonth: false, events: [] },
  { day: 31, isCurrentMonth: false, events: [] },
  { day: 1, isCurrentMonth: true, events: [{ type: 'present' }, { type: 'present' }], text: 'CS301' },
  { day: 2, isCurrentMonth: true, events: [{ type: 'present' }, { type: 'absent' }], text: '4/5 present' },
  { day: 3, isCurrentMonth: true, events: [{ type: 'present' }], text: '8/8 present' },
  { day: 4, isCurrentMonth: true, events: [] },
  { day: 5, isCurrentMonth: true, events: [] },
  { day: 6, isCurrentMonth: true, events: [{ type: 'present' }, { type: 'present' }], text: '5/5 present' },
  { day: 7, isCurrentMonth: true, events: [{ type: 'present' }], text: '8/8 present' },
  { day: 8, isCurrentMonth: true, events: [{ type: 'present' }, { type: 'present' }, { type: 'absent' }], text: '8/8 present' },
  { day: 9, isCurrentMonth: true, events: [] },
  { day: 10, isCurrentMonth: true, events: [] },
  { day: 11, isCurrentMonth: true, events: [] },
  { day: 12, isCurrentMonth: true, events: [] },
  { day: 13, isCurrentMonth: true, events: [{ type: 'present' }, { type: 'present' }], text: '5/5 present' },
  { day: 14, isCurrentMonth: true, events: [{ type: 'present' }], text: '5/5 present' },
  { day: 15, isCurrentMonth: true, events: [{ type: 'present' }, { type: 'absent' }], text: '8/8 present' },
  { day: 16, isCurrentMonth: true, events: [] },
  { day: 17, isCurrentMonth: true, events: [] },
  { day: 18, isCurrentMonth: true, events: [] },
  { day: 19, isCurrentMonth: true, events: [] },
  { day: 20, isCurrentMonth: true, events: [{ type: 'present' }, { type: 'present' }], text: '0/0 present' },
  { day: 21, isCurrentMonth: true, events: [{ type: 'present' }], text: '8/8 present' },
  { day: 22, isCurrentMonth: true, events: [{ type: 'present' }, { type: 'present' }], text: '8/8 present' },
  { day: 23, isCurrentMonth: true, events: [] },
  { day: 24, isCurrentMonth: true, events: [] },
  { day: 25, isCurrentMonth: true, events: [] },
  { day: 26, isCurrentMonth: true, events: [] },
  { day: 27, isCurrentMonth: true, events: [{ type: 'present' }, { type: 'present' }], text: '8/8 present' },
  { day: 28, isCurrentMonth: true, events: [{ type: 'present' }], text: '8/8 present' },
  { day: 29, isCurrentMonth: true, events: [{ type: 'present' }, { type: 'absent' }], text: '8/8 present' },
  { day: 30, isCurrentMonth: true, events: [{ type: 'present' }], text: '8/8 present' },
  { day: 1, isCurrentMonth: false, events: [] },
  { day: 2, isCurrentMonth: false, events: [] },
];

export default function CalendarView({ data }) {
  // For now, fallback to mock data until we implement the calendar parser for the real scraped data
  const hasRealData = data && data.length > 0;
  
  // Calculate real stats if available (assuming data contains subjects with records)
  let totalAttended = 42;
  let totalMissed = 3;
  let overallPercent = 93.3;

  if (hasRealData) {
    totalAttended = data.reduce((sum, sub) => sum + (sub.attended || 0), 0);
    const totalClasses = data.reduce((sum, sub) => sum + (sub.total || 0), 0);
    totalMissed = totalClasses - totalAttended;
    overallPercent = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : 0;
  }

  return (
    <div className="flex flex-col lg:flex-row w-full gap-8">
      {/* Left Panel: Summary */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
        <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
          <h2 className="text-xl font-bold text-text-primary mb-1">Attendance<br/>Summary</h2>
          <p className="text-sm text-text-muted mb-8">November 2023</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-text-secondary">Classes Attended</span>
              <span className="text-base font-bold text-brand-400">{totalAttended}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-text-secondary">Classes Missed</span>
              <span className="text-base font-bold text-red-400">{totalMissed}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-text-secondary mb-2">Overall % for Month</p>
            <div className="text-4xl font-bold text-brand-400 mb-3">{overallPercent}%</div>
            <div className="h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${overallPercent}%` }}></div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-4">LEGEND</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-400"></div>
              <span className="text-sm font-medium text-text-primary">Present</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <span className="text-sm font-medium text-text-primary">Absent</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-text-muted/30"></div>
              <span className="text-sm font-medium text-text-primary">Scheduled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Calendar Grid */}
      <div className="flex-1 w-full bg-surface-card border border-surface-border rounded-xl p-6">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button className="text-text-muted hover:text-text-primary transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h2 className="text-lg font-bold text-text-primary">November 2023</h2>
            <button className="text-text-muted hover:text-text-primary transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <div className="flex bg-surface-elevated rounded-lg p-1">
            <button className="px-4 py-1.5 text-xs font-semibold rounded bg-surface border border-surface-border text-brand-400 shadow-sm">Monthly</button>
            <button className="px-4 py-1.5 text-xs font-semibold rounded text-text-muted hover:text-text-primary transition-colors">Weekly</button>
            <button className="px-4 py-1.5 text-xs font-semibold rounded text-text-muted hover:text-text-primary transition-colors">Day</button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="w-full">
          {/* Days of week */}
          <div className="grid grid-cols-7 mb-2">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="text-center text-[11px] font-bold text-text-muted tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Grid cells */}
          <div className="grid grid-cols-7 border-t border-l border-surface-border">
            {calendarDays.map((dayObj, i) => (
              <div 
                key={i} 
                className={`min-h-[100px] border-r border-b border-surface-border p-2 flex flex-col ${
                  !dayObj.isCurrentMonth ? 'opacity-30 bg-surface/50' : 'hover:bg-surface-elevated/50 transition-colors'
                }`}
              >
                <span className="text-sm font-medium text-text-secondary mb-2">{dayObj.day}</span>
                
                {dayObj.events.length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {dayObj.events.map((ev, j) => (
                      <div 
                        key={j} 
                        className={`w-1.5 h-1.5 rounded-full ${ev.type === 'present' ? 'bg-brand-400' : 'bg-red-400'}`}
                      ></div>
                    ))}
                  </div>
                )}
                
                {dayObj.text && (
                  <span className="text-[9px] font-medium text-text-muted mt-auto leading-tight">
                    {dayObj.text}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
