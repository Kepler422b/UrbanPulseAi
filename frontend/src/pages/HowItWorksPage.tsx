import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
      <div className="space-y-3 text-center sm:text-left border-b border-slate-800 pb-8">
        <span className="text-xs uppercase font-mono tracking-widest text-teal-400 font-bold">
          Operational Architecture
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          How UrbanPulse AI Operates
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          An end-to-end framework transforming unstructured citizen grievance reports into prioritized municipal work orders and strategic predictive insights.
        </p>
      </div>

      {/* 4 STAGES */}
      <div className="space-y-8">
        {/* Stage 1: Citizen Submission */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold flex items-center justify-center text-sm border border-cyan-500/30">
              01
            </span>
            <h2 className="text-xl font-bold text-slate-100">Citizen Ingestion & Geocoding</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Residents submit complaints via an intuitive, accessible web form. They drop a pin on an OpenStreetMap Leaflet interface or optionally allow browser GPS geolocation. A photo can be attached for visual verification.
          </p>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
            <span className="text-cyan-400 font-semibold block">Duplicate Prevention Mechanism:</span>
            Submissions with identical categories and proximate titles submitted in the same locality within 10 minutes are flagged to prevent spam and accidental double-clicks.
          </div>
        </div>

        {/* Stage 2: Priority Engine */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold flex items-center justify-center text-sm border border-amber-500/30">
              02
            </span>
            <h2 className="text-xl font-bold text-slate-100">Explainable Priority Scoring Formula</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Instead of opaque black-box machine learning, UrbanPulse AI utilizes a deterministic, mathematically transparent priority formula:
          </p>

          <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 text-xs space-y-2">
            <code className="text-amber-300 font-bold block text-sm font-mono">
              Priority Score = (0.40 × Severity) + (0.35 × Recurrence) + (0.25 × Waiting Time)
            </code>
            <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
              <li><strong>Severity (40%):</strong> Low (25), Medium (50), High (75), Critical (100).</li>
              <li><strong>Recurrence (35%):</strong> Evaluates count of active or recent complaints in the same locality within 14 days.</li>
              <li><strong>Waiting Time (25%):</strong> Normalized elapsed hours open (capped at 168 hours = 7 days).</li>
            </ul>
          </div>
        </div>

        {/* Stage 3: Operational Triage & Dispatch */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold flex items-center justify-center text-sm border border-emerald-500/30">
              03
            </span>
            <h2 className="text-xl font-bold text-slate-100">Municipal Triage, Assignment & History Audit</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Operations supervisors assign work orders directly to field teams (e.g. Ward 3 PWD Asphalt Crew, Electrical Maintenance Division). Every status transition is logged with UTC timestamps, author identities, and operational notes for complete public accountability.
          </p>
        </div>

        {/* Stage 4: AI Pattern Detection */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 font-mono font-bold flex items-center justify-center text-sm border border-teal-500/30">
              04
            </span>
            <h2 className="text-xl font-bold text-slate-100">AI Pattern Detection & Actionable Recommendations</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The platform executes real aggregate analytics across all database records to detect infrastructure patterns:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-slate-200">Garbage Bottlenecks:</strong>
              <p className="text-slate-400 text-[11px]">
                Detects &ge; 3 waste reports in a sector within 14 days, recommending increased bin capacity or extra sweeper sweeps.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-slate-200">Asphalt Surface Peeling:</strong>
              <p className="text-slate-400 text-[11px]">
                Clusters repeated pothole reports along road segments to issue unified work orders and inspect stormwater gutter drainage.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/report"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 hover:from-cyan-300 hover:to-teal-300 shadow-lg shadow-cyan-500/25 transition-all"
        >
          <span>Try Submitting a Report</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
