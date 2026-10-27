import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-5">
        <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-slate-100 font-mono">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Urban Sector Not Found</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            The path or resource you requested is not mapped within the UrbanPulse AI system.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors shadow-md shadow-cyan-500/20"
          >
            <Home className="w-4 h-4" />
            <span>Return to City Hub</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
