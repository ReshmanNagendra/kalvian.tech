import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from './ui/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm transition-transform duration-200 group-hover:scale-110">
              k
            </div>
            <span className="text-text-primary font-semibold text-base tracking-tight">
              kalvian<span className="text-brand-500">.tech</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
             <ThemeToggle />
             {currentUser ? (
               <div className="flex items-center gap-3">
                 <span className="text-sm font-medium text-text-secondary hidden sm:block">{currentUser.email.split('@')[0]}</span>
                 <button onClick={handleLogout} className="text-sm text-text-secondary hover:text-red-400 transition-colors">
                   Logout
                 </button>
               </div>
             ) : (
               <Link to="/login" className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-colors">
                 Sign In
               </Link>
             )}
          </div>
        </div>
      </div>
    </nav>
  )
}
