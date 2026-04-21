import { Link } from 'react-router-dom'

const tools = [
  {
    id: 'image-compressor',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="9" cy="9" r="2" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
    title: 'Image Compressor',
    desc: 'Drag & drop, adjust quality, download smaller files',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'hover:border-rose-500/30',
  },
  {
    id: 'format-converter',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 014-4h14" />
        <path d="M7 23l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 01-4 4H3" />
      </svg>
    ),
    title: 'Format Converter',
    desc: 'Convert between JSON, CSV, and XML instantly',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'hover:border-sky-500/30',
  },
  {
    id: 'qr-generator',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="8" height="8" rx="1" />
        <rect x="14" y="2" width="8" height="8" rx="1" />
        <rect x="2" y="14" width="8" height="8" rx="1" />
        <rect x="14" y="14" width="4" height="4" rx="0.5" />
        <line x1="22" y1="14" x2="22" y2="22" />
        <line x1="14" y1="22" x2="22" y2="22" />
      </svg>
    ),
    title: 'QR Code Generator',
    desc: 'Turn any text or URL into a scannable QR code',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'hover:border-violet-500/30',
  },
  {
    id: 'base64',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
    title: 'Base64 Encoder/Decoder',
    desc: 'Encode text to Base64 or decode it back instantly',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'hover:border-amber-500/30',
  },
  {
    id: 'color-picker',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="7" r="2" fill="#f87171" stroke="none" />
        <circle cx="7.5" cy="14" r="2" fill="#60a5fa" stroke="none" />
        <circle cx="16.5" cy="14" r="2" fill="#34d399" stroke="none" />
      </svg>
    ),
    title: 'Color Picker & Converter',
    desc: 'Convert between HEX, RGB, and HSL color formats',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    border: 'hover:border-brand-500/30',
  },
]

export default function ToolsPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4">
            <span className="text-brand-400 text-[11px] font-medium tracking-wide uppercase">Utilities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-2">
            Quick Tools
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-md">
            Student-friendly tools you use daily. Everything runs in your browser — no uploads, no tracking.
          </p>
        </div>

        {/* Tool cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {tools.map((tool) => (
            <Link
              key={tool.id}
              to={`/dashboard/tools/${tool.id}`}
              className={`group p-5 rounded-xl bg-surface-card border border-surface-border ${tool.border} transition-all duration-200 hover:translate-y-[-2px]`}
              id={`tool-${tool.id}`}
            >
              <div className={`w-10 h-10 rounded-lg ${tool.bg} flex items-center justify-center mb-3 ${tool.color} transition-transform duration-200 group-hover:scale-110`}>
                {tool.icon}
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">{tool.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{tool.desc}</p>
            </Link>
          ))}
        </div>

        {/* Privacy note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-text-muted animate-fade-in">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0">
            <rect x="3" y="7" width="10" height="7" rx="1.5" />
            <path d="M5 7V5a3 3 0 016 0v2" />
          </svg>
          <span>All processing happens locally in your browser. Nothing is uploaded.</span>
        </div>
      </div>
    </div>
  )
}
