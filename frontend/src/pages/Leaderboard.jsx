import React from 'react';

export default function Leaderboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-6">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-3xl font-bold text-text-primary">Leaderboard</h1>
        <p className="text-text-secondary text-lg">
          Coming Soon
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          Under Construction
        </div>
      </div>
    </div>
  );
}
