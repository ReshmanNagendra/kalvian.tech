import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { oneDark } from '@codemirror/theme-one-dark'

const STORAGE_KEY = 'kalvian_snippets'

const languageExtensions = {
  javascript: () => javascript({ jsx: true }),
  python: () => python(),
  java: () => java(),
  cpp: () => cpp(),
}

// Simple heuristic for Kalvium DSA languages
function detectLanguage(code) {
  if (/#include\s*<|int\s+main\s*\(|std::|cout|cin/.test(code)) return 'cpp'
  if (/public\s+class|public\s+static\s+void\s+main|System\.out\.println/.test(code)) return 'java'
  if (/def\s+\w+\s*\(|\bprint\(|:\s*$/.test(code)) return 'python'
  return 'javascript' // Default fallback
}

export default function SnippetVault() {
  const [snippets, setSnippets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // UI State
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedLang, setSelectedLang] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // View full code state
  const [viewingSnippet, setViewingSnippet] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: ''
  })
  
  // Theme sync
  const [appTheme, setAppTheme] = useState(() => localStorage.getItem('kalvian_theme') || 'dark')
  useEffect(() => {
    const handleThemeChange = () => setAppTheme(localStorage.getItem('kalvian_theme') || 'dark')
    window.addEventListener('themechange', handleThemeChange)
    return () => window.removeEventListener('themechange', handleThemeChange)
  }, [])

  // Persist snippets
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets))
  }, [snippets])

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set()
    snippets.forEach(s => s.tags?.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }, [snippets])

  // Filtered snippets
  const filteredSnippets = useMemo(() => {
    return snippets.filter(s => {
      const matchesSearch = search === '' || 
        s.title.toLowerCase().includes(search.toLowerCase()) || 
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
      
      const matchesLang = selectedLang === 'all' || s.language === selectedLang
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(t => s.tags?.includes(t))

      return matchesSearch && matchesLang && matchesTags
    }).sort((a, b) => b.createdAt - a.createdAt)
  }, [snippets, search, selectedLang, selectedTags])

  const handleOpenModal = (snippet = null) => {
    if (snippet) {
      setEditingId(snippet.id)
      setFormData({
        title: snippet.title,
        description: snippet.description,
        code: snippet.code,
        language: snippet.language,
        tags: snippet.tags ? snippet.tags.join(', ') : ''
      })
    } else {
      setEditingId(null)
      setFormData({ title: '', description: '', code: '', language: 'javascript', tags: '' })
    }
    setIsModalOpen(true)
  }

  const handleCodePaste = (e) => {
    // Attempt auto-detect on paste if language isn't manually changed yet, or just update it
    const pastedCode = e.clipboardData?.getData('text') || e.target?.value || ''
    if (pastedCode) {
       setFormData(prev => ({ ...prev, language: detectLanguage(pastedCode) }))
    }
  }

  const handleSave = (e) => {
    e.preventDefault()
    
    const newTags = formData.tags.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => t.startsWith('#') ? t : `#${t}`)

    if (editingId) {
      setSnippets(snippets.map(s => s.id === editingId ? {
        ...s,
        ...formData,
        tags: newTags,
        updatedAt: Date.now()
      } : s))
    } else {
      setSnippets([...snippets, {
        id: crypto.randomUUID(),
        ...formData,
        tags: newTags,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      setSnippets(snippets.filter(s => s.id !== id))
      if (viewingSnippet?.id === id) setViewingSnippet(null)
    }
  }

  const handleCopy = async (id, code) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(snippets, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kalvian-snippets-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleTagFilter = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-surface text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Snippet Vault</h1>
            <p className="text-sm text-text-secondary">Save and search Dojo code</p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="w-full py-2.5 rounded-lg font-medium text-sm text-white bg-brand-600 hover:bg-brand-500 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v10M3 8h10" strokeLinecap="round" />
            </svg>
            New Snippet
          </button>

          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="7" cy="7" r="5" />
                  <path d="M11 11l3 3" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Keyword, title, code..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-xs focus:outline-none focus:border-brand-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Language</label>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-xs focus:outline-none focus:border-brand-500/50 transition-colors"
              >
                <option value="all">All Languages</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTagFilter(tag)}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors border ${
                        selectedTags.includes(tag)
                          ? 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                          : 'bg-surface-card text-text-secondary border-surface-border hover:border-surface-border-light'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Export */}
            <button
              onClick={handleExport}
              disabled={snippets.length === 0}
              className="w-full mt-4 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary border border-surface-border hover:bg-surface-elevated disabled:opacity-30 transition-colors flex items-center justify-center gap-2"
            >
               <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2v9M4 8l4 4 4-4M2 14h12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export JSON
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {viewingSnippet ? (
            <div className="animate-fade-in bg-surface-card border border-surface-border rounded-xl overflow-hidden flex flex-col h-full h-[calc(100vh-10rem)]">
              {/* Header */}
              <div className="p-5 border-b border-surface-border bg-surface-elevated flex items-start justify-between gap-4">
                <div>
                  <button onClick={() => setViewingSnippet(null)} className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1 mb-2 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Back to list
                  </button>
                  <h2 className="text-xl font-bold">{viewingSnippet.title}</h2>
                  {viewingSnippet.description && <p className="text-sm text-text-secondary mt-1">{viewingSnippet.description}</p>}
                  <div className="flex gap-1.5 mt-3">
                    {viewingSnippet.tags?.map(t => <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-surface-border text-text-secondary">{t}</span>)}
                    <span className="px-2 py-0.5 rounded text-[10px] bg-brand-500/10 text-brand-400 capitalize">{viewingSnippet.language}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleCopy(viewingSnippet.id, viewingSnippet.code)} className="p-2 rounded-lg bg-surface border border-surface-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors" title="Copy code">
                    {copiedId === viewingSnippet.id ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="3,8 6,11 13,4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="5" width="9" height="9" rx="1.5" /><path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" /></svg>
                    )}
                  </button>
                  <button onClick={() => handleOpenModal(viewingSnippet)} className="p-2 rounded-lg bg-surface border border-surface-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 11.5V14h2.5l7.5-7.5-2.5-2.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
              {/* Code */}
              <div className="flex-1 overflow-auto bg-[#282c34]">
                 <CodeMirror
                    value={viewingSnippet.code}
                    readOnly={true}
                    extensions={[languageExtensions[viewingSnippet.language] ? languageExtensions[viewingSnippet.language]() : languageExtensions.javascript()]}
                    theme={appTheme === 'dark' ? oneDark : 'light'}
                    className="h-full text-sm"
                  />
              </div>
            </div>
          ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max">
              {filteredSnippets.length === 0 ? (
                <div className="col-span-1 lg:col-span-2 text-center py-20 bg-surface-card border border-surface-border rounded-xl">
                  <p className="text-text-secondary">No snippets found.</p>
                  {snippets.length === 0 && <p className="text-xs text-text-muted mt-1">Start by creating your first snippet.</p>}
                </div>
              ) : (
                filteredSnippets.map(snippet => (
                  <div key={snippet.id} className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-surface-border-light transition-colors group flex flex-col h-48">
                    <div className="flex justify-between items-start mb-2">
                       <h3 
                        onClick={() => setViewingSnippet(snippet)}
                        className="font-semibold truncate pr-4 cursor-pointer hover:text-brand-400 transition-colors"
                      >
                         {snippet.title}
                       </h3>
                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleCopy(snippet.id, snippet.code)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
                           {copiedId === snippet.id ? (
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="3,8 6,11 13,4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                           ) : (
                             <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="5" width="9" height="9" rx="1.5" /><path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" /></svg>
                           )}
                         </button>
                         <button onClick={() => handleDelete(snippet.id)} className="p-1.5 text-text-muted hover:text-red-400 transition-colors">
                           <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M5 4v10a1 1 0 001 1h4a1 1 0 001-1V4M6 2h4" strokeLinecap="round"/></svg>
                         </button>
                       </div>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2 mb-3 flex-1">{snippet.description}</p>
                    
                    {/* Code preview fade */}
                    <div className="relative h-12 bg-surface-elevated rounded border border-surface-border/50 overflow-hidden mb-3 font-mono text-[10px] text-text-muted p-2 cursor-pointer" onClick={() => setViewingSnippet(snippet)}>
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-surface-elevated to-transparent"></div>
                      <pre className="truncate">{snippet.code.split('\n').slice(0, 3).join('\n')}</pre>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-1.5 overflow-hidden pr-2">
                        {snippet.tags?.slice(0,3).map(t => <span key={t} className="px-1.5 py-0.5 rounded text-[9px] bg-surface-border text-text-secondary truncate">{t}</span>)}
                        {snippet.tags?.length > 3 && <span className="px-1.5 py-0.5 rounded text-[9px] bg-surface-border text-text-secondary">+{snippet.tags.length - 3}</span>}
                      </div>
                      <span className="text-[10px] text-brand-400 font-medium capitalize shrink-0">{snippet.language}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
          <div className="bg-surface border border-surface-border rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-surface-border flex justify-between items-center bg-surface-card">
              <h2 className="font-bold">{editingId ? 'Edit Snippet' : 'New Snippet'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-text-secondary mb-1">Title <span className="text-red-400">*</span></label>
                    <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-sm focus:border-brand-500/50 outline-none" placeholder="E.g. Binary Search implementation" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Language</label>
                    <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-sm focus:border-brand-500/50 outline-none">
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-medium text-text-secondary mb-1">Description (Optional)</label>
                   <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-sm focus:border-brand-500/50 outline-none" placeholder="Time complexity, notes, etc." />
                </div>

                <div>
                   <label className="block text-xs font-medium text-text-secondary mb-1 flex justify-between">
                     <span>Code <span className="text-red-400">*</span></span>
                     <span className="text-[10px] text-brand-500 font-normal">Auto-detects language on paste</span>
                   </label>
                   <div className="h-64 border border-surface-border rounded-lg overflow-hidden relative focus-within:border-brand-500/50 transition-colors">
                     <CodeMirror
                        value={formData.code}
                        onChange={(val) => setFormData({...formData, code: val})}
                        onPasteCapture={handleCodePaste}
                        extensions={[languageExtensions[formData.language] ? languageExtensions[formData.language]() : languageExtensions.javascript()]}
                        theme={appTheme === 'dark' ? oneDark : 'light'}
                        className="h-full text-sm"
                        basicSetup={{ lineNumbers: true, tabSize: 2 }}
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-medium text-text-secondary mb-1">Tags (Comma separated)</label>
                   <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-sm focus:border-brand-500/50 outline-none font-mono" placeholder="DSA, Array, TwoPointers" />
                </div>
              </div>
              
              <div className="p-4 border-t border-surface-border bg-surface-card flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-surface-border transition-colors">Cancel</button>
                <button type="submit" disabled={!formData.title || !formData.code} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 transition-colors">Save Snippet</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
