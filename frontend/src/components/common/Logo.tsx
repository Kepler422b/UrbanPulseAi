import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showTagline = false }) => {
  return (
    <Link to="/" className={`flex items-center gap-2.5 group select-none ${className}`}>
      <div className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 via-slate-800 to-teal-500/10 border border-cyan-500/30 shadow-sm shadow-cyan-500/20 group-hover:border-cyan-400 transition-colors">
        {/* Custom SVG logo: Skyline silhouette + Pulse waveform + Location Pin */}
        <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle skyline bars */}
          <rect x="5" y="16" width="3.5" height="12" rx="0.75" fill="#38BDF8" fillOpacity="0.4" />
          <rect x="10" y="12" width="3.5" height="16" rx="0.75" fill="#22D3EE" fillOpacity="0.5" />
          <rect x="22.5" y="14" width="3.5" height="14" rx="0.75" fill="#2DD4BF" fillOpacity="0.5" />
          <rect x="27.5" y="18" width="3.5" height="10" rx="0.75" fill="#38BDF8" fillOpacity="0.4" />
          
          {/* Central Location Pin + Pulse Path */}
          <path
            d="M18 4C14.686 4 12 6.686 12 10C12 14.5 18 21 18 21C18 21 24 14.5 24 10C24 6.686 21.314 4 18 4Z"
            stroke="#22D3EE"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
          />
          {/* Pulse heartbeat line */}
          <path
            d="M14.5 10H16.5L17.5 7.5L18.5 12.5L19.5 10H21.5"
            stroke="#F8FAFC"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1 font-bold tracking-tight text-lg text-slate-100">
          <span>Urban<span className="text-cyan-400">Pulse</span></span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-medium border border-cyan-500/30">AI</span>
        </div>
        {showTagline && (
          <span className="text-[10px] text-slate-400 tracking-wide font-normal -mt-0.5">
            Smart City Operations
          </span>
        )}
      </div>
    </Link>
  );
};
