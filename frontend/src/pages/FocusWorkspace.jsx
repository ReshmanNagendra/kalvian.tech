import { useState, useEffect, useCallback } from 'react'
import QuestionPanel from '../components/workspace/QuestionPanel'
import CodePanel from '../components/workspace/CodePanel'
import ResizableDivider from '../components/workspace/ResizableDivider'

const STORAGE_KEY = 'kalvian_workspace'

const defaultState = {
  question: '',
  code: '',
  language: 'javascript',
  splitPercent: 40,
}

function loadWorkspace() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...defaultState, ...parsed }
    }
  } catch {
    // Corrupted data, use defaults
  }
  return defaultState
}

export default function FocusWorkspace() {
  const [workspace, setWorkspace] = useState(loadWorkspace)
  const [saveIndicator, setSaveIndicator] = useState('saved') // saved | saving | unsaved
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Auto-save with debounce
  useEffect(() => {
    setSaveIndicator('unsaved')
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace))
        setSaveIndicator('saved')
      } catch {
        // localStorage full or unavailable
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [workspace])

  const updateQuestion = useCallback((question) => {
    setWorkspace((prev) => ({ ...prev, question }))
  }, [])

  const updateCode = useCallback((code) => {
    setWorkspace((prev) => ({ ...prev, code }))
  }, [])

  const updateLanguage = useCallback((language) => {
    setWorkspace((prev) => ({ ...prev, language }))
  }, [])

  const updateSplit = useCallback((splitPercent) => {
    setWorkspace((prev) => ({ ...prev, splitPercent }))
  }, [])

  const handleClear = useCallback(() => {
    if (window.confirm('Clear your entire workspace? This cannot be undone.')) {
      setWorkspace(defaultState)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-border bg-surface-card/50">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-text-primary hidden sm:block">Focus Workspace</h1>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            {saveIndicator === 'saved' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                <span>Saved</span>
              </>
            )}
            {saveIndicator === 'unsaved' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Unsaved</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select
            value={workspace.language}
            onChange={(e) => updateLanguage(e.target.value)}
            className="px-2.5 py-1 rounded-md bg-surface-elevated border border-surface-border text-text-secondary text-xs font-medium cursor-pointer hover:border-surface-border-light focus:outline-none focus:border-brand-500/50 transition-colors"
            id="language-selector"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="px-2.5 py-1 rounded-md text-xs font-medium text-text-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
            id="clear-workspace"
            title="Clear workspace"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Panels */}
      <div className={`flex-1 flex ${isMobile ? 'flex-col' : 'flex-row'} overflow-hidden`}>
        {/* Question panel */}
        <div
          className="overflow-hidden"
          style={
            isMobile
              ? { height: '40%', minHeight: '120px' }
              : { width: `${workspace.splitPercent}%`, minWidth: '200px' }
          }
        >
          <QuestionPanel value={workspace.question} onChange={updateQuestion} />
        </div>

        {/* Divider */}
        {!isMobile && (
          <ResizableDivider
            splitPercent={workspace.splitPercent}
            onSplitChange={updateSplit}
          />
        )}

        {/* Mobile divider (non-draggable) */}
        {isMobile && <div className="h-px bg-surface-border flex-shrink-0" />}

        {/* Code panel */}
        <div
          className="overflow-hidden"
          style={
            isMobile
              ? { flex: 1, minHeight: '200px' }
              : { flex: 1, minWidth: '200px' }
          }
        >
          <CodePanel
            value={workspace.code}
            onChange={updateCode}
            language={workspace.language}
          />
        </div>
      </div>
    </div>
  )
}
