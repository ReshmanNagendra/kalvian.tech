import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllResources, updateResource, deleteResource } from '../utils/db'

export default function AdminModeration() {
  const [flaggedResources, setFlaggedResources] = useState([])
  const [loading, setLoading] = useState(true)

  const loadResources = async () => {
    try {
      const data = await getAllResources()
      // Only show items with at least 1 flag. Sort by highest flags first.
      setFlaggedResources(data.filter(r => (r.flags || 0) > 0).sort((a, b) => b.flags - a.flags))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  const handlePardon = async (id) => {
    if (window.confirm("Pardon this resource? Its flags will be reset to 0 and it will appear normally in the library.")) {
      const res = flaggedResources.find(r => r.id === id)
      if (!res) return
      const updated = { ...res, flags: 0 }
      await updateResource(updated)
      setFlaggedResources(prev => prev.filter(r => r.id !== id))
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("WARNING: Permanently delete this resource from the server? This cannot be undone.")) {
      await deleteResource(id)
      setFlaggedResources(prev => prev.filter(r => r.id !== id))
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-surface text-text-primary py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
           </div>
           <div>
             <h1 className="text-2xl font-bold tracking-tight text-text-primary">Admin Moderation</h1>
             <p className="text-sm text-text-secondary">Review flagged peer resources <span className="mx-2 text-surface-border">|</span> <Link to="/resources" className="text-brand-400 hover:underline">Back to Library</Link></p>
           </div>
        </div>

        {/* Content */}
        <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 bg-surface-elevated border-b border-surface-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary tracking-wide uppercase">Flagged Queue</h2>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">{flaggedResources.length} items</span>
          </div>
          
          {loading ? (
             <div className="p-12 text-center text-text-muted">Loading queue...</div>
          ) : flaggedResources.length === 0 ? (
             <div className="p-12 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-brand-500/50 mb-3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p className="text-text-primary font-medium">Moderation queue is clean!</p>
                <p className="text-xs text-text-muted mt-1">No community flags pending review.</p>
             </div>
          ) : (
            <div className="divide-y divide-surface-border">
               {flaggedResources.map(res => (
                 <div key={res.id} className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                    
                    {/* Urgency Indicator */}
                    <div className={`shrink-0 w-12 h-12 flex flex-col items-center justify-center rounded-lg border ${res.flags >= 5 ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                       <span className="text-sm font-bold leading-none">{res.flags}</span>
                       <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">Flags</span>
                    </div>

                    <div className="flex-1 min-w-0">
                       <div className="flex gap-2 items-center mb-1">
                          <h3 className="font-semibold text-text-primary truncate">{res.title}</h3>
                          {res.flags >= 5 && <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold tracking-wider uppercase rounded">Auto-Hidden</span>}
                       </div>
                       <p className="text-xs text-text-secondary truncate mb-2">{res.description}</p>
                       
                       <div className="flex flex-wrap items-center gap-4 text-[11px] text-text-muted font-mono bg-surface-elevated p-2 rounded-lg inline-flex">
                          <span>📁 {res.fileName}</span>
                          <span>🏷️ {res.subject}</span>
                          <span>⬆️ {res.upvotes} ⬇️ {res.downvotes}</span>
                          <a href={URL.createObjectURL(res.file)} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
                             Open File...
                          </a>
                       </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 items-center justify-end">
                       <button onClick={() => handleDelete(res.id)} className="flex-1 sm:flex-none w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors shadow">
                          Delete Permanently
                       </button>
                       <button onClick={() => handlePardon(res.id)} className="flex-1 sm:flex-none w-full px-4 py-2 bg-surface text-text-primary border border-surface-border hover:bg-surface-elevated text-xs font-semibold rounded-lg transition-colors">
                          Pardon & Restore
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
