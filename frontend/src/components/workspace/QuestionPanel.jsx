import { useRef, useEffect } from 'react'

export default function QuestionPanel({ value, onChange }) {
  const editorRef = useRef(null)
  const isInternalUpdate = useRef(false)

  // Sync external value changes to the contentEditable div
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value
      }
    }
    isInternalUpdate.current = false
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      isInternalUpdate.current = true
      onChange(editorRef.current.innerHTML)
    }
  }

  const handlePaste = (e) => {
    // Allow rich text paste to preserve formatting
    // The contentEditable div handles this natively
  }

  const wordCount = (() => {
    if (!value) return 0
    const text = value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim()
    if (!text) return 0
    return text.split(/\s+/).filter(Boolean).length
  })()

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-border bg-surface-card/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-brand-500">
            <path d="M2 3h12M2 7h8M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-xs font-medium text-text-secondary">Question</span>
        </div>
        <span className="text-xs text-text-muted">{wordCount} words</span>
      </div>

      {/* Editable area */}
      <div className="flex-1 overflow-auto p-4">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          suppressContentEditableWarning
          data-placeholder="Paste your exam question or Dojo problem here..."
          className="min-h-full text-sm text-text-primary leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-text-muted empty:before:pointer-events-none [&_b]:font-semibold [&_i]:italic [&_code]:font-mono [&_code]:bg-surface-elevated [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-brand-400 [&_code]:text-xs [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1 [&_a]:text-brand-400 [&_a]:underline [&_p]:mb-2"
          id="question-editor"
        />
      </div>
    </div>
  )
}
