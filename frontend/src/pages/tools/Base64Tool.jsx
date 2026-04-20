import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encode') // encode | decode
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleConvert = useCallback(() => {
    setError('')
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))))
      }
    } catch {
      setError(mode === 'decode' ? 'Invalid Base64 string.' : 'Could not encode this text.')
    }
  }, [input, mode])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleSwap = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setInput(output)
    setOutput('')
    setError('')
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <Link to="/tools" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Tools
        </Link>

        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">Base64 Encoder/Decoder</h1>
        <p className="text-sm text-text-secondary mb-6">Encode text to Base64 or decode it back instantly.</p>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => { setMode('encode'); setOutput(''); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'encode'
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                : 'bg-surface-card text-text-secondary border border-surface-border hover:border-surface-border-light'
            }`}
            id="mode-encode"
          >
            Encode
          </button>
          <button
            onClick={() => { setMode('decode'); setOutput(''); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'decode'
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                : 'bg-surface-card text-text-secondary border border-surface-border hover:border-surface-border-light'
            }`}
            id="mode-decode"
          >
            Decode
          </button>
        </div>

        {/* Input */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            {mode === 'encode' ? 'Plain Text' : 'Base64 String'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            placeholder={mode === 'encode' ? 'Type or paste text to encode...' : 'Paste Base64 string to decode...'}
            className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm font-mono leading-relaxed resize-y focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all placeholder:text-text-muted/50"
            id="base64-input"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleConvert}
            disabled={!input.trim()}
            className="flex-1 py-2.5 rounded-lg font-medium text-sm text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            id="base64-convert"
          >
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>
          <button
            onClick={handleSwap}
            disabled={!output}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary border border-surface-border hover:bg-surface-elevated disabled:opacity-30 transition-colors"
            title="Swap input/output and toggle mode"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 2l3 3-3 3" />
              <path d="M2 9h12" />
              <path d="M5 14l-3-3 3-3" />
              <path d="M14 7H2" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4 animate-fade-in">
            {error}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-text-secondary">
                {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
              </label>
              <button
                onClick={handleCopy}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${copied ? 'text-brand-400' : 'text-text-muted hover:text-text-primary'}`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm font-mono leading-relaxed overflow-auto max-h-[200px] break-all whitespace-pre-wrap">
              {output}
            </pre>
            <p className="text-[11px] text-text-muted mt-2">
              {mode === 'encode' ? `${input.length} chars → ${output.length} chars` : `${input.length} chars → ${output.length} chars`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
