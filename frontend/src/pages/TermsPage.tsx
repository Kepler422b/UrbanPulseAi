import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <FileText className="w-7 h-7 text-cyan-400" />
          <span>Terms of Academic Demonstration</span>
        </h1>
        <p className="text-xs text-slate-400">
          Operational terms and non-emergency demonstration boundaries.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#101F33] border border-slate-800 space-y-6 text-xs text-slate-300 leading-relaxed">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-amber-300 font-bold mb-0.5">Not an Emergency Dispatch Service:</strong>
            Do not use this system for active life-threatening emergencies, gas leaks, structure collapses, or live fire hazards. Please contact local emergency services immediately (112 / Fire / Police).
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-100">1. Nature of the System</h2>
          <p>
            UrbanPulse AI is an engineering demonstration platform designed to illustrate automated civic report routing, priority calculations, and spatial clustering algorithms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-100">2. Demonstration vs Verified Live Municipal Data</h2>
          <p>
            Unless explicitly integrated with authorized Mira-Bhayandar Municipal Corporation (MBMC) credentials, records presented in this application are simulation records for academic review. The authors make no claim of official municipal affiliation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-100">3. Fair Use & Civic Courtesy</h2>
          <p>
            Users agree not to submit fraudulent, abusive, or defamatory content through the reporting interface. Submissions should reflect legitimate observations of potholes, garbage overflow, or broken streetlights.
          </p>
        </section>
      </div>
    </div>
  );
};
