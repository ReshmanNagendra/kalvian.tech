import { useState, useEffect } from 'react';
import ListView from '../components/attendance/ListView';
import CalendarView from '../components/attendance/CalendarView';
import { useAuth } from '../contexts/AuthContext';

export default function Attendance() {
  const [currentView, setCurrentView] = useState('list');
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchAttendance() {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        // Fallback to localhost if env var isn't set
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        const response = await fetch(`${apiUrl}/api/attendance/${currentUser.uid}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch attendance');
        }
        
        const data = await response.json();
        
        // Transform Supabase JSONb array or use empty array if not found
        const subjects = data?.subjects || [];
        setAttendanceData(subjects);
      } catch (error) {
        console.error("Error loading attendance:", error);
        // If it fails (e.g., backend not running or no supabase keys), set empty array
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAttendance();
  }, [currentUser]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-surface text-text-primary p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 w-full max-w-5xl mx-auto lg:max-w-none lg:mx-0">
        <h1 className="text-2xl font-bold tracking-tight">Attendance Tracking</h1>
        
        {currentView === 'list' ? (
          <button 
            onClick={() => setCurrentView('calendar')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-500/30 text-brand-400 hover:bg-brand-500/10 transition-colors text-sm font-semibold tracking-wide shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            CALENDAR VIEW
          </button>
        ) : (
          <button 
            onClick={() => setCurrentView('list')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-500/30 text-brand-400 hover:bg-brand-500/10 transition-colors text-sm font-semibold tracking-wide shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            LIST VIEW
          </button>
        )}
      </div>

      {/* Render selected view */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        currentView === 'list' 
          ? <ListView data={attendanceData} /> 
          : <CalendarView data={attendanceData} />
      )}
    </div>
  );
}
