import { Link } from 'react-router-dom'

export default function LandingPage() {
  const features = [
    {
      title: 'Focus Workspace',
      description: 'Split-screen setup to keep your Dojo problem and code in one view.',
      icon: '💻',
      status: 'Live',
      link: '/dashboard/workspace'
    },
    {
      title: 'Attendance Strategist',
      description: 'Know exactly how many sessions you can skip before dropping into the danger zone.',
      icon: '📊',
      status: 'Live',
      link: '/dashboard/attendance'
    },
    {
      title: 'Squad Huddle',
      description: 'See who is online across all 23 campuses and spin up instant war rooms.',
      icon: '👥',
      status: 'Live',
      link: '/dashboard/squad'
    },
    {
      title: 'Snippet Vault',
      description: 'Save and tag your best DSA algorithms for open-book exam prep.',
      icon: '🔒',
      status: 'Live',
      link: '/dashboard/vault'
    },
    {
      title: 'Resource Library',
      description: 'Crowd-sourced PDFs and cheatsheets. Upvote the best materials.',
      icon: '📚',
      status: 'Live',
      link: '/dashboard/resources'
    },
    {
      title: 'Quick Utilities',
      description: 'Format converters, image compressors, and QR generators.',
      icon: '🛠️',
      status: 'Live',
      link: '/dashboard/tools'
    }
  ]

  const stats = [
    { number: '23', label: 'Universities' },
    { number: '1000+', label: 'Students' },
    { number: '7', label: 'Core Features' },
    { number: '100%', label: 'Free' }
  ]

  return (
    <div className="min-h-screen bg-surface text-text-primary flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 pb-16">
        
        {/* Launch Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 font-medium text-sm mb-8 ring-1 ring-brand-500/20">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          Live now
        </div>

        {/* Tagline */}
        <p className="text-brand-500 font-bold tracking-wider uppercase text-sm mb-4">
          The platform Kalvium students actually want to use
        </p>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          Stop fighting the portal. <br className="hidden md:block"/> Start owning your semester.
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Built by students who got tired of confusing UIs, scattered resources, and zero cross-campus connection.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link to="/dashboard" className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg transition-all shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:-translate-y-0.5">
            Get Started
          </Link>
          <a href="#features" className="w-full sm:w-auto px-8 py-3.5 bg-transparent border-[1.5px] border-surface-border hover:border-brand-600 text-text-primary font-medium rounded-lg transition-all hover:-translate-y-0.5">
            View Features
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-surface-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-surface-border">
          {stats.map((stat) => (
             <div key={stat.label} className="text-center px-4">
                <p className="text-4xl md:text-5xl font-bold text-brand-500 mb-2">{stat.number}</p>
                <p className="text-sm text-text-secondary font-medium tracking-wide uppercase">{stat.label}</p>
             </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything you need. Nothing you don't.</h2>
          <p className="text-text-secondary">Instant access tools with zero loading screens.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link 
               to={feature.link} 
               key={feature.title} 
               className="group bg-surface-card border border-surface-border p-6 rounded-xl hover:border-brand-600 transition-all duration-300 hover:-translate-y-1 block text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{feature.icon}</span>
                <span className="px-2 py-1 text-xs font-semibold bg-brand-500/10 text-brand-400 rounded-md">
                   {feature.status}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-text-primary group-hover:text-brand-500 transition-colors">
                 {feature.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                 {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-surface-border bg-surface-card py-12 text-center text-sm text-text-secondary flex flex-col items-center">
         <p className="font-medium text-text-primary mb-2">Built by Kalvium students, for Kalvium students ⚡</p>
         <p className="mb-6">Not officially affiliated with Kalvium.</p>
         
         <div className="flex gap-6 mb-6">
            <a href="#" className="hover:text-brand-400 transition-colors">GitHub</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Discord</a>
         </div>

         <p>© 2026 kalvian.tech. All rights reserved.</p>
      </footer>
    </div>
  )
}
