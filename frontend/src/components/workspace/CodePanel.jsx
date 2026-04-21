import { useState, useMemo, useCallback, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { oneDark } from '@codemirror/theme-one-dark'

const languageExtensions = {
  javascript: () => javascript({ jsx: true }),
  python: () => python(),
  java: () => java(),
  cpp: () => cpp(),
}

const fileExtensions = {
  javascript: 'js',
  python: 'py',
  java: 'java',
  cpp: 'cpp',
}

export default function CodePanel({ value, onChange, language }) {
  const [copied, setCopied] = useState(false)
  
  // Theme sync
  const [appTheme, setAppTheme] = useState(() => localStorage.getItem('kalvian_theme') || 'dark')
  
  useEffect(() => {
    const handleThemeChange = () => setAppTheme(localStorage.getItem('kalvian_theme') || 'dark')
    window.addEventListener('themechange', handleThemeChange)
    return () => window.removeEventListener('themechange', handleThemeChange)
  }, [])

  const extensions = useMemo(() => {
    const langFn = languageExtensions[language] || languageExtensions.javascript
    return [langFn()]
  }, [language])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = value
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [value])

  const handleDownload = useCallback(() => {
    const ext = fileExtensions[language] || 'txt'
    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [value, language])

  const lineCount = value ? value.split('\n').length : 0

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-border bg-surface-card/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-brand-500">
            <path d="M5 12L1 8l4-4M11 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-medium text-text-secondary">
            Code
            <span className="text-text-muted ml-1.5">·</span>
            <span className="text-text-muted ml-1.5">{lineCount} lines</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={!value}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
              copied
                ? 'text-brand-400 bg-brand-500/10'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
            }`}
            title="Copy code"
            id="copy-code"
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,8 6,11 13,4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="5" width="9" height="9" rx="1.5" />
                  <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" />
                </svg>
                Copy
              </>
            )}
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={!value}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-text-muted hover:text-text-primary hover:bg-surface-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
            title="Download as file"
            id="download-code"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v9M4 8l4 4 4-4M2 14h12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* CodeMirror editor */}
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          theme={appTheme === 'dark' ? oneDark : 'light'}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            autocompletion: true,
            bracketMatching: true,
            closeBrackets: true,
            indentOnInput: true,
            tabSize: 2,
          }}
          className="h-full text-sm"
          id="code-editor"
        />
      </div>
    </div>
  )
}
