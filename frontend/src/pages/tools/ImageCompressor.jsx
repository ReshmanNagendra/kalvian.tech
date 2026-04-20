import { useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function ImageCompressor() {
  const [original, setOriginal] = useState(null)
  const [compressed, setCompressed] = useState(null)
  const [quality, setQuality] = useState(70)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [dragOver, setDragOver] = useState(false)
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef(null)

  const processImage = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return

    setProcessing(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setOriginal({
          name: file.name,
          size: file.size,
          width: img.width,
          height: img.height,
          url: e.target.result,
        })
        compressImage(img, file.name, quality, maxWidth)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }, [quality, maxWidth])

  const compressImage = useCallback((img, name, qual, mw) => {
    const canvas = document.createElement('canvas')
    let w = img.width
    let h = img.height

    if (w > mw) {
      h = Math.round((h * mw) / w)
      w = mw
    }

    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, w, h)

    canvas.toBlob(
      (blob) => {
        setCompressed({
          name: name.replace(/\.[^.]+$/, '') + '_compressed.jpg',
          size: blob.size,
          width: w,
          height: h,
          url: URL.createObjectURL(blob),
          blob,
        })
        setProcessing(false)
      },
      'image/jpeg',
      qual / 100
    )
  }, [])

  const recompress = useCallback((newQuality, newMaxWidth) => {
    if (!original) return
    setProcessing(true)
    const img = new Image()
    img.onload = () => compressImage(img, original.name, newQuality, newMaxWidth)
    img.src = original.url
  }, [original, compressImage])

  const handleQualityChange = (val) => {
    setQuality(val)
    recompress(val, maxWidth)
  }

  const handleMaxWidthChange = (val) => {
    setMaxWidth(val)
    recompress(quality, val)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    processImage(file)
  }, [processImage])

  const handleDownload = () => {
    if (!compressed) return
    const a = document.createElement('a')
    a.href = compressed.url
    a.download = compressed.name
    a.click()
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const savings = original && compressed
    ? ((1 - compressed.size / original.size) * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Back + Header */}
        <Link to="/tools" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Tools
        </Link>

        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">Image Compressor</h1>
        <p className="text-sm text-text-secondary mb-8">Compress images right in your browser. Nothing gets uploaded.</p>

        {/* Drop zone */}
        {!original && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-brand-500 bg-brand-500/5'
                : 'border-surface-border-light hover:border-brand-500/40 hover:bg-surface-card'
            }`}
            id="image-dropzone"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mx-auto mb-4 text-text-muted">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p className="text-sm text-text-secondary mb-1">Drop an image here or click to browse</p>
            <p className="text-xs text-text-muted">Supports JPG, PNG, WebP</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => processImage(e.target.files[0])}
              id="image-input"
            />
          </div>
        )}

        {/* Results */}
        {original && (
          <div className="space-y-5 animate-fade-in">
            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Quality: <span className="text-text-primary font-semibold">{quality}%</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={quality}
                  onChange={(e) => handleQualityChange(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
                  id="quality-slider"
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-1">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Max Width: <span className="text-text-primary font-semibold">{maxWidth}px</span>
                </label>
                <input
                  type="range"
                  min="320"
                  max="3840"
                  step="160"
                  value={maxWidth}
                  onChange={(e) => handleMaxWidthChange(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
                  id="width-slider"
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-1">
                  <span>320px</span>
                  <span>3840px</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-surface-card border border-surface-border text-center">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Original</p>
                <p className="text-sm font-bold text-text-primary">{formatSize(original.size)}</p>
                <p className="text-[10px] text-text-muted">{original.width}x{original.height}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-card border border-surface-border text-center">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Compressed</p>
                <p className="text-sm font-bold text-brand-400">{compressed ? formatSize(compressed.size) : '...'}</p>
                <p className="text-[10px] text-text-muted">{compressed ? `${compressed.width}x${compressed.height}` : '...'}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-card border border-surface-border text-center">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Saved</p>
                <p className={`text-sm font-bold ${parseFloat(savings) > 0 ? 'text-brand-400' : 'text-red-400'}`}>
                  {processing ? '...' : `${savings}%`}
                </p>
                <p className="text-[10px] text-text-muted">{compressed ? formatSize(original.size - compressed.size) : ''}</p>
              </div>
            </div>

            {/* Preview */}
            {compressed && (
              <div className="rounded-xl overflow-hidden border border-surface-border bg-surface-card">
                <img src={compressed.url} alt="Compressed preview" className="w-full max-h-[300px] object-contain bg-surface-elevated" />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                disabled={!compressed || processing}
                className="flex-1 py-2.5 rounded-lg font-medium text-sm text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 transition-colors"
                id="download-compressed"
              >
                Download Compressed Image
              </button>
              <button
                onClick={() => { setOriginal(null); setCompressed(null) }}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-elevated border border-surface-border transition-colors"
              >
                New Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
