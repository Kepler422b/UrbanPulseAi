import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldAlert,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  Layers,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Building2,
  Construction,
  Trash2,
  LightbulbOff,
  Globe2,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsSummary, PublicReport } from '../types';
import { HotspotMap } from '../components/map/HotspotMap';

export const LandingPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentReports, setRecentReports] = useState<PublicReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, repRes] = await Promise.all([
          api.getAnalyticsSummary(),
          api.getPublicReports({ limit: 10 }),
        ]);
        setSummary(sumRes);
        setRecentReports(repRes.items);
      } catch (e) {
        console.warn('Backend loading notice on landing page:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/80 bg-gradient-to-b from-[#07111F] via-[#091527] to-[#07111F]">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Next-Gen Smart City Operations Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.1]">
                Every Urban Signal.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400">
                  One Intelligent City.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                UrbanPulse AI turns scattered citizen complaints into structured, location-aware operational intelligence. Helping administrators prioritize urgent civic hazards, detect recurring infrastructure bottlenecks, and coordinate rapid municipal resolution.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/report"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 hover:from-cyan-300 hover:to-teal-300 shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Report an Issue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/issues"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors"
                >
                  <span>Explore City Dashboard</span>
                </Link>
              </div>

              {/* Context Tag */}
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  Pilot Context: Mira-Bhayandar, Maharashtra
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  Semester V / IDEA LAB Project
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual & Live Stats Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-[#101F33]/90 border border-slate-700/80 shadow-2xl backdrop-blur-md relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Municipal Live Status
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">Mira-Bhayandar Ward Grid</span>
                </div>

                {/* 4 Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" /> Total Logged
                    </span>
                    <p className="text-2xl font-extrabold text-slate-100 mt-1 font-mono">
                      {summary ? summary.total_reports : 22}
                    </p>
                    <span className="text-[10px] text-slate-500">Citizen submissions</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Open / In Progress
                    </span>
                    <p className="text-2xl font-extrabold text-amber-300 mt-1 font-mono">
                      {summary ? summary.open_reports + summary.in_progress_reports : 16}
                    </p>
                    <span className="text-[10px] text-slate-500">Active work tickets</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                    <p className="text-2xl font-extrabold text-emerald-300 mt-1 font-mono">
                      {summary ? summary.resolved_reports : 6}
                    </p>
                    <span className="text-[10px] text-slate-500">Inspected & cleared</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> High Priority
                    </span>
                    <p className="text-2xl font-extrabold text-rose-300 mt-1 font-mono">
                      {summary ? summary.high_priority_reports : 7}
                    </p>
                    <span className="text-[10px] text-slate-500">Urgent attention</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Avg Resolution Turnaround:</span>
                  <strong className="text-slate-200 font-mono">
                    {summary ? summary.average_resolution_hours : 28.4} hours
                  </strong>
                </div>
              </div>

              {/* Demo Mode Notice Card */}
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-slate-300">
                  <strong className="text-cyan-300">Academic Demo Data:</strong> Operational figures reflect simulated municipal records for academic evaluation. Not connected to live MBMC systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SUPPORTED CIVIC CATEGORIES */}
      <section className="py-16 bg-[#07111F] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
              Targeted Urban Operational Scope
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Initial Service Categories
            </h3>
            <p className="text-sm text-slate-400">
              Built on an extensible architecture designed to scale across all departments of municipal administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category 1 */}
            <div className="p-6 rounded-xl bg-[#101F33] border border-amber-500/20 hover:border-amber-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Construction className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-100">Potholes & Damaged Roads</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track asphalt craters, sunken trenching from pipeline repairs, and crumbling road edges that compromise motorist and two-wheeler safety.
              </p>
              <div className="pt-2 text-xs text-amber-400 font-medium">
                Corridor recurrence detection active &rarr;
              </div>
            </div>

            {/* Category 2 */}
            <div className="p-6 rounded-xl bg-[#101F33] border border-emerald-500/20 hover:border-emerald-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-100">Garbage Overflow & Waste</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log overflowing dumper bins, illegal demolition debris dumping, and delayed secondary collection sweeps to safeguard public hygiene.
              </p>
              <div className="pt-2 text-xs text-emerald-400 font-medium">
                Capacity bottleneck tracking active &rarr;
              </div>
            </div>

            {/* Category 3 */}
            <div className="p-6 rounded-xl bg-[#101F33] border border-cyan-500/20 hover:border-cyan-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <LightbulbOff className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-100">Broken & Flickering Streetlights</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Report non-functional luminaires, leaning damaged poles, and feeder pillar outages along critical pedestrian transit corridors.
              </p>
              <div className="pt-2 text-xs text-cyan-400 font-medium">
                Corridor dark-stretch safety alerts active &rarr;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS WORKFLOW */}
      <section className="py-16 bg-[#091527] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-teal-400 font-bold">
              Operational Lifecycle
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              How UrbanPulse AI Operates
            </h3>
            <p className="text-sm text-slate-400">
              From citizen submission to field crew resolution and strategic municipal policy optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Report',
                desc: 'Citizen submits issue with exact map coordinates, severity, and photo verification in under 60 seconds.',
                badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
              },
              {
                step: '02',
                title: 'Prioritize',
                desc: 'Scoring engine calculates priority based on severity (40%), recurrence (35%), and waiting time (25%).',
                badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
              },
              {
                step: '03',
                title: 'Assign & Resolve',
                desc: 'Supervisors dispatch tickets directly to field teams with internal work notes and track resolution audits.',
                badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
              },
              {
                step: '04',
                title: 'AI Pattern Analysis',
                desc: 'Rule-based intelligence isolates recurring hotspots and generates municipal resource recommendations.',
                badgeColor: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
              },
            ].map((st) => (
              <div key={st.step} className="p-6 rounded-xl bg-[#101F33] border border-slate-800 space-y-3 relative">
                <div className={`w-9 h-9 rounded-lg font-mono font-bold flex items-center justify-center text-sm border ${st.badgeColor}`}>
                  {st.step}
                </div>
                <h4 className="text-base font-bold text-slate-100">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. GEOGRAPHIC HOTSPOT MAP PREVIEW */}
      <section className="py-16 bg-[#07111F] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
                Location Intelligence
              </h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                Mira-Bhayandar Hotspot Map
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Visualizing spatial clustering across Silver Park, Kanakia, Bhayandar, and Kashimira.
              </p>
            </div>

            <Link
              to="/issues"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <span>Open Full Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0B1728] p-2">
            <HotspotMap reports={recentReports} className="h-[420px]" />
          </div>
        </div>
      </section>

      {/* 5. AI-ASSISTED RECOMMENDATIONS & SDG 11 */}
      <section className="py-16 bg-[#091527]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                <Globe2 className="w-3.5 h-3.5" />
                <span>UN Sustainable Development Goal 11</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-tight">
                Data-Driven Municipal Insights for Sustainable Futures
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                UrbanPulse AI demonstrates how transparent, explainable operational algorithms empower urban local bodies (ULBs) to transition from purely reactive firefighting to proactive, preventive maintenance.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-cyan-500/20 text-cyan-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-200">Explainable Priority Engine</h5>
                    <p className="text-xs text-slate-400">Formulaic transparency ensures fair municipal resource allocation without opaque black-box biases.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-teal-500/20 text-teal-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-200">Bottleneck & Capacity Detection</h5>
                    <p className="text-xs text-slate-400">Identifies chronic garbage overflow points to recommend bin volume expansion and route adjustments.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-amber-500/20 text-amber-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-200">Safety Corridor Monitoring</h5>
                    <p className="text-xs text-slate-400">Flags consecutive streetlight outages along high-traffic routes to enhance pedestrian and women safety.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Insight Card Visual */}
            <div className="p-6 rounded-2xl bg-[#101F33] border border-cyan-500/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-xs font-bold text-cyan-300 font-mono">INSIGHT SAMPLE</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  High Evidence
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-100">
                  Garbage Overflow Recurrence: Silver Park Market Sector
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Observation Window: Past 14 Days &bull; 4 Correlated Reports</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Algorithmic Rationale:</span>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    4 separate submissions within 350 meters indicate regular dumper capacity saturation prior to morning market hours.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-cyan-400 font-semibold">Recommended Municipal Action:</span>
                  <p className="text-slate-200 text-[11px] mt-0.5 font-medium">
                    Deploy an auxiliary 1.1m³ dumper bin and schedule secondary mechanical sweeper collection at 07:30 AM daily.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-slate-500">Semester V Prototype Analysis</span>
                <Link to="/admin/insights" className="text-cyan-400 hover:text-cyan-300 font-medium text-xs">
                  Inspect All Insights &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
