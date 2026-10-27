import React, { useState } from 'react';
import { Info, X, ShieldAlert } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-teal-950/70 border-b border-cyan-500/20 text-xs text-slate-300 py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
            Academic Prototype
          </span>
          <p className="truncate">
            <strong className="text-slate-100">Mira-Bhayandar Pilot Simulation:</strong> Operational figures, reports, and AI insights reflect demonstration datasets for Semester V / IDEA LAB evaluation.
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
