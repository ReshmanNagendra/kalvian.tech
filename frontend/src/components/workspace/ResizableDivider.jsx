import { useCallback, useRef, useEffect } from 'react'

export default function ResizableDivider({ splitPercent, onSplitChange }) {
  const containerRef = useRef(null)
  const isDragging = useRef(false)

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return

      const container = document.querySelector('.flex-1.flex.flex-row')
      if (!container) return

      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percent = (x / rect.width) * 100

      // Clamp between 20% and 80%
      const clamped = Math.min(80, Math.max(20, percent))
      onSplitChange(clamped)
    }

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    // Touch support
    const handleTouchMove = (e) => {
      if (!isDragging.current) return
      const touch = e.touches[0]

      const container = document.querySelector('.flex-1.flex.flex-row')
      if (!container) return

      const rect = container.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const percent = (x / rect.width) * 100
      const clamped = Math.min(80, Math.max(20, percent))
      onSplitChange(clamped)
    }

    const handleTouchEnd = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSplitChange])

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      className="relative flex-shrink-0 w-[5px] cursor-col-resize group z-10"
      id="workspace-divider"
    >
      {/* Background line */}
      <div className="absolute inset-0 bg-surface-border group-hover:bg-brand-500/40 transition-colors duration-200" />

      {/* Wider invisible hit area */}
      <div className="absolute inset-y-0 -left-2 -right-2" />

      {/* Grip dots */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-brand-400" />
        ))}
      </div>
    </div>
  )
}
