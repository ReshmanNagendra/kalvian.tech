
import Badge from './badges';
import WaitlistForm from './waitlistform'; // 1. Bring the component into this file

function App() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        🚧 kalvian.tech {""}
          <Badge type="opens on June"  />
      </h1>
      <p className="text-gray-400 mb-2">
        Community for Kalvium students is coming soon.
      </p>
      <p className="text-xs text-gray-600 mb-8 uppercase tracking-widest font-semibold">
        Not officially affiliated
      </p>
      
      {/* 2. Drop the component here! */}
      <WaitlistForm /> 
      
    </div>
  )
}

export default App;