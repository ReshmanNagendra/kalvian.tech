import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import DashboardLayout from './components/layout/DashboardLayout'
import FocusWorkspace from './pages/FocusWorkspace'
import AttendanceCalculator from './pages/AttendanceCalculator'
import SnippetVault from './pages/SnippetVault'
import ResourceLibrary from './pages/ResourceLibrary'
import AdminModeration from './pages/AdminModeration'
import SquadHuddle from './pages/SquadHuddle'
import ToolsPage from './pages/ToolsPage'
import ImageCompressor from './pages/tools/ImageCompressor'
import FormatConverter from './pages/tools/FormatConverter'
import QRGenerator from './pages/tools/QRGenerator'
import Base64Tool from './pages/tools/Base64Tool'
import ColorPicker from './pages/tools/ColorPicker'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import DashboardHome from './pages/DashboardHome'
import Settings from './pages/Settings'
import PrivateRoute from './components/auth/PrivateRoute'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Navigate } from 'react-router-dom'

// Redirect logged-in users from landing page straight to dashboard
function HomeRedirect() {
  const { currentUser } = useAuth()
  if (currentUser) return <Navigate to="/dashboard" replace />
  return <LandingPage />
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-surface font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Dashboard Pages — locked behind auth */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="settings" element={<Settings />} />
            <Route path="workspace" element={<FocusWorkspace />} />
            <Route path="attendance" element={<AttendanceCalculator />} />
            <Route path="squad" element={<SquadHuddle />} />
            <Route path="vault" element={<SnippetVault />} />
            <Route path="resources" element={<ResourceLibrary />} />
            <Route path="resources/admin" element={<AdminModeration />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="tools/image-compressor" element={<ImageCompressor />} />
            <Route path="tools/format-converter" element={<FormatConverter />} />
            <Route path="tools/qr-generator" element={<QRGenerator />} />
            <Route path="tools/base64" element={<Base64Tool />} />
            <Route path="tools/color-picker" element={<ColorPicker />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App