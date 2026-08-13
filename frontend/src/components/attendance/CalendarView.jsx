import { useState, useMemo } from 'react';

export default function CalendarView({ data, historyData = [], excludedSubjects = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate Calendar Grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const totalDaysInMonth = lastDayOfMonth.getDate();
    
    const days = [];
    
    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateStr: null,
        events: []
      });
    }
    
    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      // Format YYYY-MM-DD
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      // Find history data for this day
      const dayData = historyData.find(d => d.date === dateStr);
      let events = [];
      let text = '';
      
      if (dayData && dayData.subjects) {
        // Filter out excluded
        const activeSubs = dayData.subjects.filter(sub => !excludedSubjects.includes(sub.code));
        
        events = activeSubs.map(sub => ({
          type: sub.attended ? 'present' : (sub.total > 0 ? 'absent' : 'upcoming')
        })).filter(e => e.type !== 'upcoming');
        
        const attended = activeSubs.reduce((sum, sub) => sum + (sub.attended || 0), 0);
        const total = activeSubs.reduce((sum, sub) => sum + (sub.total || 0), 0);
        
        if (total > 0) {
          text = `${attended}/${total} present`;
        }
      }
      
      days.push({
        day: i,
        isCurrentMonth: true,
        dateStr,
        events,
        text
      });
    }
    
    // Next month padding
    const remainingCells = 42 - days.length; // 6 rows of 7
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        dateStr: null,
        events: []
      });
    }
    
    return days;
  }, [currentDate, historyData, excludedSubjects]);

  // Calculate real stats for the viewed month
  const monthStats = useMemo(() => {
    let attended = 0;
    let totalClasses = 0;
    
    const year = currentDate.getFullYear();
    const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;

    historyData.forEach(day => {
      if (day.date.startsWith(prefix) && day.subjects) {
        const activeSubs = day.subjects.filter(sub => !excludedSubjects.includes(sub.code));
        attended += activeSubs.reduce((sum, sub) => sum + (sub.attended || 0), 0);
        totalClasses += activeSubs.reduce((sum, sub) => sum + (sub.total || 0), 0);
      }
    });

    const missed = totalClasses - attended;
    const percent = totalClasses > 0 ? ((attended / totalClasses) * 100).toFixed(1) : 0;
    
    return { attended, missed, percent };
  }, [currentDate, historyData, excludedSubjects]);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col lg:flex-row w-full gap-8">
      {/* Left Panel: Summary */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
        <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
          <h2 className="text-xl font-bold text-text-primary mb-1">Attendance<br/>Summary</h2>
          <p className="text-sm text-text-muted mb-8">{monthName}</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-text-secondary">Classes Attended</span>
              <span className="text-base font-bold text-brand-400">{monthStats.attended}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-text-secondary">Classes Missed</span>
              <span className="text-base font-bold text-red-400">{monthStats.missed}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-text-secondary mb-2">Overall % for Month</p>
            <div className="text-4xl font-bold text-brand-400 mb-3">{monthStats.percent}%</div>
            <div className="h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${monthStats.percent}%` }}></div>
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
            <button onClick={prevMonth} className="text-text-muted hover:text-text-primary transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h2 className="text-lg font-bold text-text-primary w-40 text-center">{monthName}</h2>
            <button onClick={nextMonth} className="text-text-muted hover:text-text-primary transition-colors">
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
                  <div className="flex flex-wrap gap-1 mb-2">
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
