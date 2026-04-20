import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { addResource, getAllResources, updateResource } from '../utils/db'

export default function ResourceLibrary() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // UI State
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedTags, setSelectedTags] = useState([])
  const [sortBy, setSortBy] = useState('recent') // recent, popular, highly-rated
  
  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [previewResource, setPreviewResource] = useState(null)
  
  // Form State
  const [formData, setFormData] = useState({ title: '', subject: '', description: '', tags: '' })
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const loadResources = async () => {
    try {
      const data = await getAllResources()
      // Filter out auto-hidden items (>= 5 flags)
      setResources(data.filter(r => (r.flags || 0) < 5))
    } catch (err) {
      setError('Failed to load resources. Your browser might not support IndexedDB.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  // Derived filters
  const subjects = useMemo(() => Array.from(new Set(resources.map(r => r.subject))), [resources])
  const allTags = useMemo(() => {
    const tags = new Set()
    resources.forEach(r => r.tags?.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }, [resources])

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchesSearch = search === '' || 
        r.title.toLowerCase().includes(search.toLowerCase()) || 
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.fileName?.toLowerCase().includes(search.toLowerCase())
      
      const matchesSubj = selectedSubject === 'all' || r.subject === selectedSubject
      const matchesTags = selectedTags.length === 0 || selectedTags.every(t => r.tags?.includes(t))

      return matchesSearch && matchesSubj && matchesTags
    }).sort((a, b) => {
      if (sortBy === 'recent') return b.createdAt - a.createdAt
      if (sortBy === 'popular') return (b.downloads || 0) - (a.downloads || 0)
      if (sortBy === 'highly-rated') return ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0))
      return 0
    })
  }, [resources, search, selectedSubject, selectedTags, sortBy])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Reject if over 20MB for safety bounds in IDB browser memory
      if (file.size > 20 * 1024 * 1024) {
         setError('File is too large. Please upload under 20MB.')
         return
      }
      setSelectedFile(file)
      setError('')
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile || !formData.title || !formData.subject) return
    setUploading(true)

    const newResource = {
      id: crypto.randomUUID(),
      title: formData.title,
      subject: formData.subject,
      description: formData.description,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`),
      file: selectedFile,
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      createdAt: Date.now(),
      upvotes: 0,
      downvotes: 0,
      downloads: 0,
      flags: 0,
    }

    try {
      await addResource(newResource)
      setResources(prev => [newResource, ...prev])
      setIsUploadModalOpen(false)
      setFormData({ title: '', subject: '', description: '', tags: '' })
      setSelectedFile(null)
    } catch (err) {
      setError('Failed to save file. ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleVote = async (id, type) => {
    const res = resources.find(r => r.id === id)
    if (!res) return
    // In a real app, track user ID to prevent multi-voting.
    const updated = { ...res, [type]: (res[type] || 0) + 1 }
    await updateResource(updated)
    setResources(prev => prev.map(r => r.id === id ? updated : r))
  }

  const handleDownload = async (id, file, fileName) => {
    const res = resources.find(r => r.id === id)
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)

    if (res) {
       const updated = { ...res, downloads: (res.downloads || 0) + 1 }
       await updateResource(updated)
       setResources(prev => prev.map(r => r.id === id ? updated : r))
    }
  }

  const handleFlag = async (id) => {
    const res = resources.find(r => r.id === id)
    if (!res) return
    if (window.confirm("Flag this resource as inappropriate or spam?")) {
      const updatedFlags = (res.flags || 0) + 1
      const updated = { ...res, flags: updatedFlags }
      await updateResource(updated)
      
      // Auto-hide if flagged >= 5 times instantly
      if (updatedFlags >= 5) {
        setResources(prev => prev.filter(r => r.id !== id))
      } else {
        setResources(prev => prev.map(r => r.id === id ? updated : r))
      }
      alert("Resource flagged. Thank you for keeping the community safe.")
    }
  }

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-surface text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Resource Library</h1>
            <p className="text-sm text-text-secondary">Community-sourced study materials</p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full py-2.5 rounded-lg font-medium text-sm text-white bg-brand-600 hover:bg-brand-500 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 12V4M4 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Upload Resource
          </button>

          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title, filename..."
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-xs focus:outline-none focus:border-brand-500/50"
              />
            </div>

            {/* SortBy Filter */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-xs focus:outline-none focus:border-brand-500/50"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Downloaded</option>
                <option value="highly-rated">Highest Rated</option>
              </select>
            </div>

            {/* Subject Filter */}
            {subjects.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-xs focus:outline-none focus:border-brand-500/50"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div>
                 <label className="block text-xs font-medium text-text-secondary mb-2">Tags</label>
                 <div className="flex flex-wrap gap-1.5">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-colors border ${
                          selectedTags.includes(tag) ? 'bg-brand-500/15 text-brand-400 border-brand-500/30' : 'bg-surface-card text-text-secondary border-surface-border'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {loading ? (
             <div className="flex items-center justify-center p-20 opacity-50">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : filteredResources.length === 0 ? (
             <div className="text-center py-20 bg-surface-card border border-surface-border rounded-xl">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mx-auto mb-4 text-text-muted opacity-50"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/></svg>
               <p className="text-text-secondary">No resources found.</p>
               <p className="text-xs text-text-muted mt-1">Be the first to upload one!</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {filteredResources.map(res => (
                  <div key={res.id} className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-surface-border-light transition-colors group flex flex-col">
                     {/* Top bar: Subject badge + Flag */}
                     <div className="flex justify-between items-start mb-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-surface-border text-text-secondary">{res.subject}</span>
                        <button onClick={() => handleFlag(res.id)} title="Flag as inappropriate" className="text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v13M3 3h8l1 2h3v6h-4l-1-2H3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                     </div>
                     
                     <h3 className="font-semibold text-text-primary leading-tight mb-1 cursor-pointer hover:text-brand-400 transition-colors" onClick={() => setPreviewResource(res)}>
                        {res.title}
                     </h3>
                     <p className="text-[11px] text-text-muted truncate mb-2 font-mono flex items-center gap-1.5"><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2v12l4-2 4 2V2z"/></svg> {res.fileName}</p>
                     
                     <p className="text-xs text-text-secondary line-clamp-3 mb-4 flex-1">{res.description}</p>
                     
                     <div className="flex gap-1.5 overflow-hidden mb-4">
                        {res.tags?.slice(0,3).map(t => <span key={t} className="px-1.5 py-0.5 rounded text-[9px] bg-surface-elevated border border-surface-border text-text-muted truncate">{t}</span>)}
                     </div>

                     <div className="mt-auto px-3 py-2 bg-surface-elevated rounded-lg flex items-center justify-between border border-surface-border/50">
                        {/* Votes */}
                        <div className="flex items-center gap-3">
                           <button onClick={() => handleVote(res.id, 'upvotes')} className="flex items-center gap-1 text-[11px] font-medium text-text-secondary hover:text-brand-400 transition-colors">
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 12V4M4 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              <span>{res.upvotes || 0}</span>
                           </button>
                           <button onClick={() => handleVote(res.id, 'downvotes')} className="flex items-center gap-1 text-[11px] font-medium text-text-secondary hover:text-red-400 transition-colors">
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 4v8M4 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              <span>{res.downvotes || 0}</span>
                           </button>
                        </div>
                        {/* Downloads & Preview */}
                        <div className="flex items-center gap-3">
                           <span className="flex items-center gap-1 text-[11px] font-medium text-text-muted" title="Downloads">
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 4v8M4 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 14h12"/></svg>
                              <span>{res.downloads || 0}</span>
                           </span>
                           <button onClick={() => setPreviewResource(res)} className="px-2 py-1 rounded bg-brand-500/10 text-brand-400 text-[10px] font-bold hover:bg-brand-500/20 transition-colors uppercase tracking-wider">
                              Preview
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
           <div className="bg-surface border border-surface-border rounded-xl w-full max-w-lg flex flex-col shadow-2xl">
             <div className="p-4 border-b border-surface-border flex justify-between items-center bg-surface-card">
               <h2 className="font-bold">Upload Resource</h2>
               <button onClick={() => setIsUploadModalOpen(false)} className="text-text-muted hover:text-text-primary">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
               </button>
             </div>
             
             {error && <div className="mx-4 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}

             <form onSubmit={handleUpload} className="p-4 space-y-4">
               <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Upload File (PDF, Image) <span className="text-red-400">*</span></label>
                  <div className="flex items-center gap-3">
                     <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-sm font-medium hover:border-brand-500/40 transition-colors">
                        Choose File
                     </button>
                     <span className="text-xs text-text-secondary truncate flex-1">{selectedFile ? selectedFile.name : 'No file selected'}</span>
                  </div>
                  <input ref={fileInputRef} type="file" accept="application/pdf,image/*" onChange={handleFileChange} className="hidden" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-medium text-text-secondary mb-1">Title <span className="text-red-400">*</span></label>
                   <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-sm focus:border-brand-500/50 outline-none" placeholder="Physics Midterm Notes" />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-text-secondary mb-1">Subject <span className="text-red-400">*</span></label>
                   <input required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-sm focus:border-brand-500/50 outline-none" placeholder="e.g. Physics" />
                 </div>
               </div>

               <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-sm focus:border-brand-500/50 outline-none resize-none" placeholder="Topics covered, exam year, etc." />
               </div>

               <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Tags (Comma separated)</label>
                  <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-sm focus:border-brand-500/50 outline-none font-mono" placeholder="Thermodynamics, formulas" />
               </div>

               <div className="pt-2 flex justify-end gap-2">
                 <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-surface-border transition-colors">Cancel</button>
                 <button type="submit" disabled={!selectedFile || !formData.title || !formData.subject || uploading} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 transition-colors flex items-center gap-2">
                    {uploading ? 'Processing...' : 'Submit Resource'}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Preview Modal */}
       {previewResource && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in">
           <div className="bg-surface border border-surface-border rounded-xl w-full h-[90vh] max-w-5xl flex flex-col shadow-2xl">
             <div className="p-4 border-b border-surface-border flex justify-between items-center bg-surface-card">
               <div>
                  <h2 className="font-bold text-lg">{previewResource.title}</h2>
                  <p className="text-xs text-text-muted mt-0.5">{previewResource.fileName}</p>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => handleDownload(previewResource.id, previewResource.file, previewResource.fileName)} className="px-4 py-2 rounded-lg text-sm font-medium text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 transition-colors flex items-center gap-2 border border-brand-500/20">
                     <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v9M4 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 14h12"/></svg>
                     Download & Save
                  </button>
                  <button onClick={() => setPreviewResource(null)} className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-elevated transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
               </div>
             </div>
             
             <div className="flex-1 bg-surface-elevated flex items-center justify-center p-4 overflow-hidden relative">
               {previewResource.fileType?.startsWith('image/') ? (
                 <img src={URL.createObjectURL(previewResource.file)} alt={previewResource.title} className="max-w-full max-h-full object-contain rounded drop-shadow-2xl" />
               ) : (
                 <iframe src={URL.createObjectURL(previewResource.file)} title={previewResource.title} className="w-full h-full bg-white rounded" />
               )}
             </div>
           </div>
         </div>
       )}
    </div>
  )
}
