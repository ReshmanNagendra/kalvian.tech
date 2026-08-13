import { useState, useEffect } from 'react';
import ListView from '../components/attendance/ListView';
import CalendarView from '../components/attendance/CalendarView';
import { useAuth } from '../contexts/AuthContext';

export default function Attendance() {
  const [currentView, setCurrentView] = useState('list');
  const [attendanceData, setAttendanceData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [numericId, setNumericId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Advanced filters
  const [dateRangePreset, setDateRangePreset] = useState('3months');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [excludedSubjects, setExcludedSubjects] = useState([]);

  const { currentUser } = useAuth();

  // Helper to get dates
  const updateDatesFromPreset = (preset) => {
    const end = new Date();
    let start = new Date();
    if (preset === '1month') start.setMonth(start.getMonth() - 1);
    else if (preset === '3months') start.setMonth(start.getMonth() - 3);
    else if (preset === '6months') start.setMonth(start.getMonth() - 6);
    else return; // custom

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  useEffect(() => {
    updateDatesFromPreset(dateRangePreset);
  }, [dateRangePreset]);

  useEffect(() => {
    async function fetchAllData() {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        
        // 1. Fetch numeric ID
        const idRes = await fetch(`${apiUrl}/api/attendance/${currentUser.uid}/numeric-id`);
        if (idRes.ok) {
          const idData = await idRes.json();
          setNumericId(idData.numericId);
        }

        // 2. Fetch latest attendance
        const attRes = await fetch(`${apiUrl}/api/attendance/${currentUser.uid}`);
        if (attRes.ok) {
          const attData = await attRes.json();
          setAttendanceData(attData?.subjects || []);
        }

        // 3. Fetch history based on dates
        if (startDate && endDate) {
          const histRes = await fetch(`${apiUrl}/api/attendance/${currentUser.uid}/history?startDate=${startDate}&endDate=${endDate}`);
          if (histRes.ok) {
            const histData = await histRes.json();
            setHistoryData(histData);
          }
        }
      } catch (error) {
        console.error("Error loading attendance data:", error);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    }

    if (startDate && endDate) {
      fetchAllData();
    }
  }, [currentUser, startDate, endDate]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-surface text-text-primary p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 w-full max-w-5xl mx-auto lg:max-w-none lg:mx-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Attendance Tracking</h1>
          {numericId && (
            <p className="text-sm font-medium text-brand-400">Student ID: {numericId}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Filter */}
          <select 
            value={dateRangePreset} 
            onChange={(e) => setDateRangePreset(e.target.value)}
            className="px-3 py-2 bg-surface-card border border-surface-border rounded-lg text-sm font-medium text-text-primary outline-none focus:border-brand-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
          </select>

          {/* View Toggle */}
          <button 
            onClick={() => setCurrentView(currentView === 'list' ? 'calendar' : 'list')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-500/30 text-brand-400 hover:bg-brand-500/10 transition-colors text-sm font-semibold tracking-wide shrink-0"
          >
            {currentView === 'list' ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                CALENDAR
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                LIST
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {loading && !attendanceData ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        currentView === 'list' 
          ? <ListView 
              data={attendanceData} 
              historyData={historyData}
              excludedSubjects={excludedSubjects}
              setExcludedSubjects={setExcludedSubjects}
            /> 
          : <CalendarView 
              data={attendanceData}
              historyData={historyData}
              excludedSubjects={excludedSubjects}
            />
      )}
    </div>
  );
}
