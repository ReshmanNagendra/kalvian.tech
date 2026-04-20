import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'

export default function QRGenerator() {
  const [text, setText] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [size, setSize] = useState(300)
  const [fgColor, setFgColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('#0a0a0f')
  const canvasRef = useRef(null)

  const generateQR = useCallback(async (value, sz, fg, bg) => {
    if (!value.trim()) {
      setQrUrl('')
      return
    }

    try {
      // Generate QR to a temporary canvas
      const tempCanvas = document.createElement('canvas')
      await QRCode.toCanvas(tempCanvas, value, {
        width: sz,
        margin: 2,
        color: { dark: fg, light: bg },
        errorCorrectionLevel: 'H', // High error correction to allow logo overlay
      })

      // Draw the "k" logo in the center
      const ctx = tempCanvas.getContext('2d')
      const logoSize = sz * 0.18
      const centerX = (sz - logoSize) / 2
      const centerY = (sz - logoSize) / 2

      // Logo background circle
      ctx.beginPath()
      ctx.arc(sz / 2, sz / 2, logoSize * 0.7, 0, Math.PI * 2)
      ctx.fillStyle = bg
      ctx.fill()

      // Inner colored circle
      ctx.beginPath()
      ctx.arc(sz / 2, sz / 2, logoSize * 0.55, 0, Math.PI * 2)
      ctx.fillStyle = '#10b981'
      ctx.fill()

      // "k" letter
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${logoSize * 0.65}px Inter, -apple-system, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('k', sz / 2, sz / 2 + 1)

      // Copy to visible canvas
      if (canvasRef.current) {
        canvasRef.current.width = sz
        canvasRef.current.height = sz
        const destCtx = canvasRef.current.getContext('2d')
        destCtx.drawImage(tempCanvas, 0, 0)
      }

      setQrUrl(tempCanvas.toDataURL('image/png'))
    } catch {
      setQrUrl('')
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => generateQR(text, size, fgColor, bgColor), 300)
    return () => clearTimeout(timer)
  }, [text, size, fgColor, bgColor, generateQR])

  const handleDownload = () => {
    if (!qrUrl) return
    const a = document.createElement('a')
    a.href = qrUrl
    a.download = 'kalvian-qr.png'
    a.click()
  }

  const handleCopy = async () => {
    if (!canvasRef.current) return
    try {
      const blob = await new Promise((resolve) => canvasRef.current.toBlob(resolve, 'image/png'))
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    } catch {
      // fallback: copy data URL as text
      await navigator.clipboard.writeText(qrUrl)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <Link to="/tools" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Tools
        </Link>

        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">QR Code Generator</h1>
        <p className="text-sm text-text-secondary mb-6">Generate QR codes with the kalvian.tech logo baked in.</p>

        {/* Input */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-text-secondary mb-1.5" htmlFor="qr-input">Text or URL</label>
          <textarea
            id="qr-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="https://kalvian.tech"
            className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-sm leading-relaxed resize-none focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all placeholder:text-text-muted/50"
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-xs cursor-pointer focus:outline-none focus:border-brand-500/50 transition-colors"
              id="qr-size"
            >
              <option value={200}>200px</option>
              <option value={300}>300px</option>
              <option value={400}>400px</option>
              <option value={600}>600px</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Foreground</label>
            <div className="relative">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-full h-9 rounded-lg border border-surface-border cursor-pointer bg-transparent"
                id="qr-fg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Background</label>
            <div className="relative">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-9 rounded-lg border border-surface-border cursor-pointer bg-transparent"
                id="qr-bg"
              />
            </div>
          </div>
        </div>

        {/* QR Preview */}
        <div className="flex flex-col items-center">
          {qrUrl ? (
            <div className="animate-fade-in">
              <div className="p-4 rounded-xl bg-surface-card border border-surface-border mb-4 inline-block">
                <canvas ref={canvasRef} className="block rounded-lg" style={{ width: Math.min(size, 300), height: Math.min(size, 300) }} />
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                  id="qr-download"
                >
                  Download PNG
                </button>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary border border-surface-border hover:bg-surface-elevated transition-colors"
                  id="qr-copy"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-text-muted">
                  <rect x="2" y="2" width="8" height="8" rx="1" />
                  <rect x="14" y="2" width="8" height="8" rx="1" />
                  <rect x="2" y="14" width="8" height="8" rx="1" />
                  <rect x="14" y="14" width="4" height="4" rx="0.5" />
                </svg>
              </div>
              <p className="text-sm text-text-secondary">Type something above to generate a QR code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
