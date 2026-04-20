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

function App() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Dashboard Pages */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<div className="p-8 text-text-secondary">Welcome to your workspace. Select a tool from the sidebar to begin.</div>} />
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
  )
}

export default App