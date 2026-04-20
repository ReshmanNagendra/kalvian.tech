import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'

// --- Mock Data Generator ---
const UNIVERSITIES = ['LPU', 'Chitkara', 'KLU', 'VIT', 'SRM', 'Manipal']
const SKILLS = ['React', 'Node.js', 'Python', 'Java', 'DSA', 'C++', 'UI/UX', 'MongoDB']
const BATCHES = ['2023', '2024', '2025']

const MOCK_NAMES = ['Aarav', 'Diya', 'Ishaan', 'Kavya', 'Rohan', 'Sneha', 'Vihaan', 'Zara', 'Aditya', 'Ananya', 'Arjun', 'Isha', 'Kabir', 'Myra', 'Pranav']

const generateMockStudents = () => {
   return MOCK_NAMES.map((name, i) => ({
      id: `stu_${i}`,
      name: `${name} ${['S', 'K', 'M', 'R', 'P'][i % 5]}.`,
      university: UNIVERSITIES[i % UNIVERSITIES.length],
      batch: BATCHES[i % BATCHES.length],
      skills: [SKILLS[i % SKILLS.length], SKILLS[(i + 1) % SKILLS.length]],
      lastSeen: Date.now() - Math.random() * 300000, // randomized last seen within 5 mins
      activity: Math.random() > 0.7 ? 'Crushing DSA 💻' : Math.random() > 0.6 ? 'Exam Prep 📚' : ''
   }))
}

const STORAGE_KEY = 'kalvian_authmock'

export default function SquadHuddle() {
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
  })
  
  const [students, setStudents] = useState(generateMockStudents())
  
  // Filters
  const [selectedUni, setSelectedUni] = useState('all')
  const [selectedSkill, setSelectedSkill] = useState('all')
  const [search, setSearch] = useState('')

  // Form State
  const [authForm, setAuthForm] = useState({ name: '', university: UNIVERSITIES[0], batch: BATCHES[1], skills: 'React, Node.js' })

  // Real-time Presence Simulator (Updates every 5 seconds)
  useEffect(() => {
     if (!currentUser) return

     const interval = setInterval(() => {
        setStudents(prev => prev.map(stu => {
           // 10% chance a student's connection state changes
           if (Math.random() > 0.9) {
              // Either just came online (now) or went offline 3 mins ago
              return { ...stu, lastSeen: Math.random() > 0.5 ? Date.now() : Date.now() - 180000 }
           }
           return stu
        }))
     }, 5000)

     return () => clearInterval(interval)
  }, [currentUser])

  // Handlers
  const handleLogin = (e) => {
     e.preventDefault()
     const userObj = {
        ...authForm,
        id: 'current_user',
        skills: authForm.skills.split(',').map(s=>s.trim()).filter(Boolean),
        lastSeen: Date.now(),
        activity: 'Looking for a squad 🚀'
     }
     localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj))
     setCurrentUser(userObj)
  }

  const handleLogout = () => {
     localStorage.removeItem(STORAGE_KEY)
     setCurrentUser(null)
  }

  const startWarRoom = () => {
     const roomId = 'kalvian-war-room-' + Math.random().toString(36).substring(2, 9)
     window.open(`https://meet.jit.si/${roomId}`, '_blank')
  }

  // Derived computations
  const isOnline = (lastSeen) => (Date.now() - lastSeen) < 120000 // 2 mins threshold

  const allFiltered = useMemo(() => {
     const all = currentUser ? [currentUser, ...students] : students
     const filtered = all.filter(s => {
        const matchSearch = search === '' || s.name.toLowerCase().includes(search.toLowerCase())
        const matchUni = selectedUni === 'all' || s.university === selectedUni
        const matchSkill = selectedSkill === 'all' || s.skills.includes(selectedSkill)
        return matchSearch && matchUni && matchSkill
     })

     // Sort online first
     return filtered.sort((a, b) => {
        const aOnline = isOnline(a.lastSeen)
        const bOnline = isOnline(b.lastSeen)
        if (aOnline && !bOnline) return -1
        if (!aOnline && bOnline) return 1
        return b.lastSeen - a.lastSeen
     })
  }, [students, currentUser, selectedUni, selectedSkill, search])

  const onlineCount = allFiltered.filter(s => isOnline(s.lastSeen)).length

  if (!currentUser) {
     return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-surface">
           <div className="max-w-md w-full bg-surface-card border border-surface-border p-6 sm:p-8 rounded-2xl animate-fade-in shadow-xl">
              <div className="w-12 h-12 bg-brand-500/10 text-brand-500 rounded-xl flex items-center justify-center mb-6">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">Join Squad Huddle</h1>
              <p className="text-sm text-text-secondary mb-6">Enter your details to see who is online and join real-time study war rooms.</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                 <div>
                   <label className="block text-xs font-medium text-text-secondary mb-1">Your Name</label>
                   <input required value={authForm.name} onChange={e=>setAuthForm({...authForm, name: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-sm focus:border-brand-500/50 outline-none" placeholder="E.g. Reshman" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">University</label>
                      <select value={authForm.university} onChange={e=>setAuthForm({...authForm, university: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-sm focus:border-brand-500/50 outline-none">
                         {UNIVERSITIES.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Batch</label>
                      <select value={authForm.batch} onChange={e=>setAuthForm({...authForm, batch: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-sm focus:border-brand-500/50 outline-none">
                         {BATCHES.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-text-secondary mb-1">Top Skills (Comma separated)</label>
                   <input value={authForm.skills} onChange={e=>setAuthForm({...authForm, skills: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-sm focus:border-brand-500/50 outline-none" placeholder="React, Node.js" />
                 </div>
                 <button type="submit" className="w-full py-2.5 mt-2 rounded-lg font-medium text-sm text-white bg-brand-600 hover:bg-brand-500 transition-colors">
                    Go Online
                 </button>
              </form>
           </div>
        </div>
     )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-surface text-text-primary py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-surface-border pb-6">
           <div>
             <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Squad Huddle</h1>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-bold uppercase rounded-full">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-subtle"></span>
                   {onlineCount} Online Now
                </span>
             </div>
             <p className="text-sm text-text-secondary">See who's actively studying. Connect across 23 universities.</p>
           </div>

           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button onClick={startWarRoom} className="flexitems-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white bg-brand-600 hover:bg-brand-500 transition-colors flex items-center shadow-lg shadow-brand-500/20">
                 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4.5l3-3v13l-3-3" strokeLinecap="round" strokeLinejoin="round"/><rect x="1" y="3" width="11" height="10" rx="2"/></svg>
                 Start War Room
              </button>
              <button onClick={handleLogout} className="px-5 py-2.5 rounded-lg text-sm font-medium text-text-secondary border border-surface-border hover:text-text-primary hover:bg-surface-elevated transition-colors text-center">
                 Go Offline
              </button>
           </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
           <div className="relative">
             <input type="text" placeholder="Search students..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 pr-4 py-2 rounded-lg bg-surface-card border border-surface-border text-sm focus:border-brand-500/50 outline-none w-[200px]" />
             <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" strokeLinecap="round" /></svg>
           </div>
           
           <select value={selectedUni} onChange={e=>setSelectedUni(e.target.value)} className="px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-sm focus:border-brand-500/50 outline-none cursor-pointer">
              <option value="all">All Universities</option>
              {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
           </select>

           <select value={selectedSkill} onChange={e=>setSelectedSkill(e.target.value)} className="px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-sm focus:border-brand-500/50 outline-none cursor-pointer">
              <option value="all">All Skills</option>
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>

        {/* User Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {allFiltered.map(user => {
              const online = isOnline(user.lastSeen)
              const isMe = user.id === 'current_user'

              return (
                 <div key={user.id} className={`p-4 rounded-xl border transition-all duration-300 flex flex-col ${online ? 'bg-surface-card border-surface-border shadow-sm' : 'bg-surface border-surface-border/50 opacity-60'}`}>
                    
                    {/* Header: Name + Dot */}
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isMe ? 'bg-brand-500 text-white' : 'bg-surface-elevated text-text-primary'}`}>
                             {user.name.charAt(0)}
                          </div>
                          <div>
                             <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                               {user.name} {isMe && <span className="text-[10px] text-brand-400 font-normal">(You)</span>}
                             </h3>
                             <p className="text-[10px] text-text-muted">{user.university} • Batch {user.batch}</p>
                          </div>
                       </div>
                       <div title={online ? "Online Now" : `Last seen: ${new Date(user.lastSeen).toLocaleTimeString()}`}>
                          <span className={`flex w-2.5 h-2.5 rounded-full ${online ? 'bg-green-500' : 'bg-surface-border'}`}></span>
                       </div>
                    </div>

                    {/* Activity Line */}
                    <div className="h-4 mb-3">
                       {online && user.activity && (
                          <p className="text-xs text-brand-400 font-medium truncate">{user.activity}</p>
                       )}
                    </div>

                    {/* Skills */}
                    <div className="mt-auto flex flex-wrap gap-1.5">
                       {user.skills.slice(0,3).map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-surface-elevated border border-surface-border rounded text-[10px] text-text-secondary">
                             {skill}
                          </span>
                       ))}
                       {user.skills.length > 3 && (
                          <span className="px-2 py-0.5 bg-surface-elevated border border-surface-border rounded text-[10px] text-text-secondary">+{user.skills.length - 3}</span>
                       )}
                    </div>
                 </div>
              )
           })}
        </div>
        
        {allFiltered.length === 0 && (
           <div className="text-center py-20">
              <p className="text-text-secondary">No Kalvians match your filters.</p>
           </div>
        )}

      </div>
    </div>
  )
}
