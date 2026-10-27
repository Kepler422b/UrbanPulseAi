import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Globe, Sparkles, MapPin, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      <div className="space-y-3 text-center sm:text-left border-b border-slate-800 pb-8">
        <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold">
          Academic Innovation Initiative
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          About UrbanPulse AI
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          An AI-powered Urban Operations Monitoring and Optimization Platform designed to observe operational patterns in urban environments and demonstrate a concrete system for municipal service improvement.
        </p>
      </div>

      {/* Academic Mission Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#101F33] border border-cyan-500/20 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-cyan-300 text-sm font-bold">
          <Building2 className="w-5 h-5 text-cyan-400" />
          <span>Academic Context & Problem Statement</span>
        </div>

        <blockquote className="border-l-2 border-cyan-400 pl-4 py-1 italic text-slate-200 text-sm">
          "To observe operational patterns in urban environments and demonstrate a very basic system for improvement."
          <footer className="text-[11px] text-slate-400 mt-1 not-italic">
            &mdash; Semester V / IDEA LAB Smart Urban Systems Curriculum
          </footer>
        </blockquote>

        <p className="text-xs text-slate-300 leading-relaxed">
          Traditional municipal grievance redressal systems suffer from high latency, duplicate registrations, and a lack of spatial correlation. Urban local bodies often address complaints as isolated tickets rather than diagnosing the underlying structural root causes—such as poor asphalt sub-drainage or undersized community refuse containers.
        </p>
      </div>

      {/* Pilot Scope: Mira-Bhayandar */}
      <div className="p-6 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
          <MapPin className="w-5 h-5 text-cyan-400" />
          <span>Primary Pilot Context: Mira-Bhayandar, Maharashtra, India</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Mira-Bhayandar is a rapidly developing municipal corporation region adjoining the Mumbai Metropolitan Region. Its dense transit nodes (Station Roads, Western Express Highway corridors), active commercial markets (Silver Park, Bhayandar West), and residential clusters (Kanakia, Poonam Sagar) make it an ideal simulated environment to test civic pattern detection models.
        </p>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px]">
            <strong>Important Disclaimer:</strong> This web platform is an independent academic engineering prototype. Unless verified API integration credentials are authenticated, the figures and issues shown represent simulated demonstration data.
          </p>
        </div>
      </div>

      {/* Extensible Architecture & SDG 11 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#101F33] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
            <Globe className="w-4 h-4 text-teal-400" />
            <span>UN SDG Goal 11 Alignment</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Directly advances Target 11.6 (reducing environmental impact of cities) and Target 11.7 (safe, inclusive public spaces) by providing transparent data loops between residents and urban administrators.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#101F33] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Extensible Architecture</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            While initially supporting roads, garbage, and streetlights, the modular schema easily expands to cover water supply leakage, stormwater desilting, stray animal care, and public park maintenance.
          </p>
        </div>
      </div>
    </div>
  );
};
