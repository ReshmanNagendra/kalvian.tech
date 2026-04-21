import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb(h, s, l) {
  s /= 100; l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)) }
}

export default function ColorPicker() {
  const [hex, setHex] = useState('#10b981')
  const [rgb, setRgb] = useState({ r: 16, g: 185, b: 129 })
  const [hsl, setHsl] = useState({ h: 160, s: 84, l: 39 })
  const [copied, setCopied] = useState('') // hex, rgb, hsl

  // Sync colors when HEX changes
  const handleHexChange = (newHex) => {
    setHex(newHex)
    if (/^#[0-9A-F]{6}$/i.test(newHex)) {
      const newRgb = hexToRgb(newHex)
      if (newRgb) {
        setRgb(newRgb)
        setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b))
      }
    }
  }

  // Sync colors when RGB changes
  const handleRgbChange = (channel, value) => {
    const val = Math.max(0, Math.min(255, Number(value) || 0))
    const newRgb = { ...rgb, [channel]: val }
    setRgb(newRgb)
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b))
  }

  // Sync colors when HSL changes
  const handleHslChange = (channel, value) => {
    const max = channel === 'h' ? 360 : 100
    const val = Math.max(0, Math.min(max, Number(value) || 0))
    const newHsl = { ...hsl, [channel]: val }
    setHsl(newHsl)
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
    setRgb(newRgb)
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
  }

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 1500)
  }

  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`

  const ColorField = ({ label, value, onChange, onCopy, isCopied, type, ...props }) => (
    <div className="flex items-center gap-3">
      {type === 'hex' ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm font-mono focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 uppercase"
          maxLength={7}
          {...props}
        />
      ) : (
        <div className="flex-1 px-3 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm font-mono truncate">
          {value}
        </div>
      )}
      <button
        onClick={onCopy}
        className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors border ${
          isCopied
            ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
            : 'bg-surface-card text-text-secondary border-surface-border hover:border-text-muted hover:text-text-primary'
        }`}
        style={{ minWidth: '70px' }}
      >
        {isCopied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
        <Link to="/tools" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Tools
        </Link>

        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">Color Picker & Converter</h1>
        <p className="text-sm text-text-secondary mb-8">Convert between HEX, RGB, and HSL color formats.</p>

        <div className="space-y-6">
          {/* Main Color Preview & Picker */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-surface-border bg-surface-card">
            <div 
              className="w-16 h-16 rounded-full border-2 border-surface-border shadow-inner"
              style={{ backgroundColor: hex }}
            />
            <div className="flex-1">
              <label className="text-xs font-medium text-text-secondary block mb-1">Pick a color</label>
              <input
                type="color"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                className="w-full h-8 rounded cursor-pointer bg-transparent"
              />
            </div>
          </div>

          {/* Formats */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">HEX</label>
              <ColorField
                type="hex"
                value={hex}
                onChange={handleHexChange}
                onCopy={() => handleCopy(hex.toUpperCase(), 'hex')}
                isCopied={copied === 'hex'}
              />
            </div>
            
            <div className="grid grid-cols-[1fr_auto] items-end gap-3">
               <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">RGB</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" min="0" max="255" value={rgb.r} onChange={(e) => handleRgbChange('r', e.target.value)} className="w-full px-2 py-2 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm font-mono focus:outline-none focus:border-brand-500/50 text-center" />
                    <input type="number" min="0" max="255" value={rgb.g} onChange={(e) => handleRgbChange('g', e.target.value)} className="w-full px-2 py-2 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm font-mono focus:outline-none focus:border-brand-500/50 text-center" />
                    <input type="number" min="0" max="255" value={rgb.b} onChange={(e) => handleRgbChange('b', e.target.value)} className="w-full px-2 py-2 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm font-mono focus:outline-none focus:border-brand-500/50 text-center" />
                  </div>
               </div>
               <button
                  onClick={() => handleCopy(rgbString, 'rgb')}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors border h-10 ${
                    copied === 'rgb'
                      ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                      : 'bg-surface-card text-text-secondary border-surface-border hover:border-text-muted hover:text-text-primary'
                  }`}
                  style={{ minWidth: '70px' }}
                >
                  {copied === 'rgb' ? 'Copied' : 'Copy'}
                </button>
            </div>

            <div className="grid grid-cols-[1fr_auto] items-end gap-3">
               <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">HSL</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" min="0" max="360" value={hsl.h} onChange={(e) => handleHslChange('h', e.target.value)} className="w-full px-2 py-2 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm font-mono focus:outline-none focus:border-brand-500/50 text-center" />
                    <input type="number" min="0" max="100" value={hsl.s} onChange={(e) => handleHslChange('s', e.target.value)} className="w-full px-2 py-2 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm font-mono focus:outline-none focus:border-brand-500/50 text-center" />
                    <input type="number" min="0" max="100" value={hsl.l} onChange={(e) => handleHslChange('l', e.target.value)} className="w-full px-2 py-2 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm font-mono focus:outline-none focus:border-brand-500/50 text-center" />
                  </div>
               </div>
               <button
                  onClick={() => handleCopy(hslString, 'hsl')}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors border h-10 ${
                    copied === 'hsl'
                      ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                      : 'bg-surface-card text-text-secondary border-surface-border hover:border-text-muted hover:text-text-primary'
                  }`}
                  style={{ minWidth: '70px' }}
                >
                  {copied === 'hsl' ? 'Copied' : 'Copy'}
                </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
