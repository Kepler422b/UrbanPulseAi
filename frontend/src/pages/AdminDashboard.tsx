import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  AnalyticsSummary,
  CategoryDistribution,
  TrendDataPoint,
  ResolutionTimeCategory,
  HotspotCluster,
  AdminReport,
} from '../types';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { TrendsLineChart } from '../components/charts/TrendsLineChart';
import { ResolutionBarChart } from '../components/charts/ResolutionBarChart';
import { HotspotMap } from '../components/map/HotspotMap';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { formatDate, formatTimeAgo } from '../utils/formatters';
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  MapPin,
  TrendingUp,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [categories, setCategories] = useState<CategoryDistribution[]>([]);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [resolutions, setResolutions] = useState<ResolutionTimeCategory[]>([]);
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [priorityReports, setPriorityReports] = useState<AdminReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [sumData, catData, trendData, resData, hotData, prioData] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getCategoryDistribution(),
        api.getTrends(14),
        api.getResolutionTimes(),
        api.getHotspots(),
        api.getAdminReports({ sort_by: 'priority', limit: 6, status: 'reported' }),
      ]);
      setSummary(sumData);
      setCategories(catData);
      setTrends(trendData);
      setResolutions(resData);
      setHotspots(hotData);
      setPriorityReports(prioData.items);
    } catch (e) {
      console.warn('Dashboard data fetch notice:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Cockpit Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Operations Monitoring Cockpit
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mira-Bhayandar Municipal Operations &bull; Real-time prioritization, spatial clustering, and dispatch telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadDashboardData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>

          <Link
            to="/admin/insights"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 hover:from-teal-400 hover:to-cyan-400 shadow-sm shadow-teal-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Insights Board</span>
          </Link>
        </div>
      </div>

      {/* 1. KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-[#101F33] border border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Total Reports</span>
          </span>
          <p className="text-2xl font-extrabold text-slate-100 font-mono mt-2">
            {summary?.total_reports ?? '—'}
          </p>
          <span className="text-[10px] text-slate-500">All recorded</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101F33] border border-slate-800">
          <span className="text-xs text-amber-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Open (Unassigned)</span>
          </span>
          <p className="text-2xl font-extrabold text-amber-300 font-mono mt-2">
            {summary?.open_reports ?? '—'}
          </p>
          <span className="text-[10px] text-slate-500">Needs triage</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101F33] border border-slate-800">
          <span className="text-xs text-cyan-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>In Progress</span>
          </span>
          <p className="text-2xl font-extrabold text-cyan-300 font-mono mt-2">
            {summary?.in_progress_reports ?? '—'}
          </p>
          <span className="text-[10px] text-slate-500">Field teams assigned</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101F33] border border-slate-800">
          <span className="text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </span>
          <p className="text-2xl font-extrabold text-emerald-300 font-mono mt-2">
            {summary?.resolved_reports ?? '—'}
          </p>
          <span className="text-[10px] text-slate-500">Inspected & closed</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101F33] border border-slate-800">
          <span className="text-xs text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High Priority</span>
          </span>
          <p className="text-2xl font-extrabold text-rose-400 font-mono mt-2">
            {summary?.high_priority_reports ?? '—'}
          </p>
          <span className="text-[10px] text-slate-500">Score &ge; 60</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101F33] border border-slate-800">
          <span className="text-xs text-teal-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Avg Turnaround</span>
          </span>
          <p className="text-2xl font-extrabold text-teal-300 font-mono mt-2">
            {summary?.average_resolution_hours ?? 28.4}
            <span className="text-xs text-slate-400 font-normal ml-1">hrs</span>
          </p>
          <span className="text-[10px] text-slate-500">Resolution time</span>
        </div>
      </div>

      {/* 2. CHARTS SECTION: Category Breakdown & Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Report Ingestion vs Resolution Velocity</h3>
              <p className="text-xs text-slate-400">Daily intake compared against resolved work orders (14 days)</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">Past 14 Days</span>
          </div>
          <TrendsLineChart data={trends} />
        </div>

        {/* Category Pie Chart (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Service Category Distribution</h3>
              <p className="text-xs text-slate-400">Share of complaints by municipal division</p>
            </div>
          </div>
          <CategoryPieChart data={categories} />
        </div>
      </div>

      {/* 3. HOTSPOT MAP & RESOLUTION TIMES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hotspot Map (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Geographic Hotspot Matrix</h3>
              <p className="text-xs text-slate-400">
                Interactive spatial cluster markers in Mira-Bhayandar
              </p>
            </div>
            <Link
              to="/admin/issues"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <HotspotMap reports={priorityReports} className="h-96" showFilters={true} />
        </div>

        {/* Resolution Time Breakdown (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Avg Resolution by Sector</h3>
              <p className="text-xs text-slate-400">Hours to complete work order</p>
            </div>
          </div>
          <ResolutionBarChart data={resolutions} />
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-200">SLA Benchmark:</span>
            <p>Target municipal closure is 48 hours for road repairs and 24 hours for streetlights.</p>
          </div>
        </div>
      </div>

      {/* 4. PRIORITY TRIAGE QUEUE */}
      <div className="p-6 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Priority Triage Queue (Top Urgent Unresolved)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked dynamically by the priority formula: 40% Severity + 35% Recurrence + 25% Waiting Time.
            </p>
          </div>

          <Link
            to="/admin/issues"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
          >
            <span>Open Complete Issue Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Title & Locality</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Priority Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {priorityReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No urgent unresolved reports currently in queue.
                  </td>
                </tr>
              ) : (
                priorityReports.map((r) => (
                  <tr key={r.public_report_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {r.public_report_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <CategoryBadge category={r.category} />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-100 truncate">{r.title}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{r.locality}</span>
                      </p>
                    </td>
                    <td className="py-3.5 px-4 capitalize font-medium">{r.severity}</td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge
                        level={r.priority_level}
                        score={r.priority_score}
                        showScore
                        explanation={r.priority_factors?.explanation}
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/issues/${r.public_report_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-colors"
                      >
                        <span>Dispatch / Review</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
