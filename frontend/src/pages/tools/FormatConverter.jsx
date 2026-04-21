import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

function jsonToCsv(jsonStr) {
  const data = JSON.parse(jsonStr)
  const arr = Array.isArray(data) ? data : [data]
  if (arr.length === 0) return ''
  const headers = Object.keys(arr[0])
  const csvRows = [headers.join(',')]
  for (const row of arr) {
    const values = headers.map((h) => {
      const val = row[h] == null ? '' : String(row[h])
      return val.includes(',') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val
    })
    csvRows.push(values.join(','))
  }
  return csvRows.join('\n')
}

function csvToJson(csvStr) {
  const lines = csvStr.trim().split('\n')
  if (lines.length < 2) return '[]'
  const headers = parseCsvLine(lines[0])
  const result = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const obj = {}
    headers.forEach((h, idx) => { obj[h] = values[idx] || '' })
    result.push(obj)
  }
  return JSON.stringify(result, null, 2)
}

function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        result.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
  }
  result.push(current.trim())
  return result
}

function jsonToXml(jsonStr) {
  const data = JSON.parse(jsonStr)
  const arr = Array.isArray(data) ? data : [data]

  function objectToXml(obj, indent = '  ') {
    let xml = ''
    for (const [key, value] of Object.entries(obj)) {
      const tag = key.replace(/\s+/g, '_')
      if (typeof value === 'object' && value !== null) {
        xml += `${indent}<${tag}>\n${objectToXml(value, indent + '  ')}${indent}</${tag}>\n`
      } else {
        const escaped = String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        xml += `${indent}<${tag}>${escaped}</${tag}>\n`
      }
    }
    return xml
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n'
  for (const item of arr) {
    xml += '  <item>\n' + objectToXml(item, '    ') + '  </item>\n'
  }
  xml += '</root>'
  return xml
}

function xmlToJson(xmlStr) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlStr, 'text/xml')
  const error = doc.querySelector('parsererror')
  if (error) throw new Error('Invalid XML')

  function nodeToObj(node) {
    if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
      return node.textContent.trim()
    }
    const obj = {}
    for (const child of node.childNodes) {
      if (child.nodeType === 1) {
        obj[child.tagName] = nodeToObj(child)
      }
    }
    return obj
  }

  const root = doc.documentElement
  const items = []
  for (const child of root.childNodes) {
    if (child.nodeType === 1) {
      items.push(nodeToObj(child))
    }
  }
  return JSON.stringify(items.length === 1 ? items[0] : items, null, 2)
}

const conversions = {
  'json-csv': { fn: jsonToCsv, label: 'JSON → CSV' },
  'csv-json': { fn: csvToJson, label: 'CSV → JSON' },
  'json-xml': { fn: jsonToXml, label: 'JSON → XML' },
  'xml-json': { fn: xmlToJson, label: 'XML → JSON' },
}

export default function FormatConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('json-csv')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleConvert = useCallback(() => {
    setError('')
    setOutput('')
    try {
      const result = conversions[mode].fn(input)
      setOutput(result)
    } catch (err) {
      setError(err.message || 'Conversion failed. Check your input format.')
    }
  }, [input, mode])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDownload = () => {
    const ext = mode.split('-')[1]
    const blob = new Blob([output], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `converted.${ext}`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Link to="/tools" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Tools
        </Link>

        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">Format Converter</h1>
        <p className="text-sm text-text-secondary mb-6">Convert between JSON, CSV, and XML instantly.</p>

        {/* Mode selector */}
        <div className="flex flex-wrap gap-2 mb-5">
          {Object.entries(conversions).map(([key, val]) => (
            <button
              key={key}
              onClick={() => { setMode(key); setOutput(''); setError('') }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === key
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                  : 'bg-surface-card text-text-secondary border border-surface-border hover:border-surface-border-light'
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            placeholder={mode.startsWith('json') ? '[\n  { "name": "Alice", "age": 20 },\n  { "name": "Bob", "age": 22 }\n]' : mode.startsWith('csv') ? 'name,age\nAlice,20\nBob,22' : '<root>\n  <item>\n    <name>Alice</name>\n  </item>\n</root>'}
            className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm font-mono leading-relaxed resize-y focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all placeholder:text-text-muted/50"
            id="format-input"
          />
        </div>

        {/* Convert button */}
        <button
          onClick={handleConvert}
          disabled={!input.trim()}
          className="w-full py-2.5 rounded-lg font-medium text-sm text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-4"
          id="convert-btn"
        >
          Convert
        </button>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4 animate-fade-in">
            {error}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-text-secondary">Output</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${copied ? 'text-brand-400' : 'text-text-muted hover:text-text-primary'}`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-2 py-1 rounded-md text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm font-mono leading-relaxed overflow-auto max-h-[300px]">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
