export default function JarvisCore() {
  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto pointer-events-none opacity-100 select-none z-0">
      
      {/* Ambient Outer Glow */}
      <div className="absolute inset-0 bg-brand-500/15 rounded-full blur-[80px]" />
      
      {/* 3D Scene */}
      <div className="relative w-full h-full flex items-center justify-center transform-gpu" style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}>
        
        {/* Outer dashed orbit */}
        <div className="absolute w-full h-full rounded-full border-[1.5px] border-brand-500/50 border-dashed animate-[spin_30s_linear_infinite]" />
        
        {/* Ring 1 - High tilt */}
        <div 
          className="absolute w-[85%] h-[85%] rounded-full border-2 border-brand-400/40 animate-[spin_20s_linear_infinite]" 
          style={{ transform: 'rotateX(65deg) rotateY(15deg)' }} 
        />
        
        {/* Ring 2 - Opposite tilt */}
        <div 
          className="absolute w-[80%] h-[80%] rounded-full border-2 border-brand-500/60 animate-[spin_15s_linear_infinite_reverse]" 
          style={{ transform: 'rotateX(15deg) rotateY(65deg)' }} 
        />
        
        {/* Ring 3 - Dotted diagonal */}
        <div 
          className="absolute w-[75%] h-[75%] rounded-full border-t-[3px] border-[3px] border-dotted border-brand-300/50 animate-[spin_25s_linear_infinite]" 
          style={{ transform: 'rotateX(45deg) rotateY(45deg)' }} 
        />
        
        {/* Ring 4 - Inverse diagonal */}
        <div 
          className="absolute w-[70%] h-[70%] rounded-full border-l-2 border-brand-500/40 animate-[spin_18s_linear_infinite_reverse]" 
          style={{ transform: 'rotateX(-45deg) rotateY(-45deg)' }} 
        />

        {/* Inner Core */}
        <div className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-brand-400/50 shadow-[inset_0_0_30px_rgba(20,184,166,0.5)] bg-brand-500/10 flex items-center justify-center backdrop-blur-sm animate-[spin_10s_linear_infinite]">
            <div className="absolute w-full h-full rounded-full border-2 border-brand-400/40 animate-ping opacity-30" style={{ animationDuration: '3s' }} />
            
            {/* Core Node */}
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-brand-400 rounded-full shadow-[0_0_20px_#2dd4bf,0_0_40px_#2dd4bf,0_0_60px_#2dd4bf]" />
            
            {/* Mini orbit inside core */}
            <div className="absolute w-12 h-12 rounded-full border-t-2 border-brand-300/60 animate-[spin_2s_linear_infinite]" />
        </div>
      </div>
    </div>
  )
}
