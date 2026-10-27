import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PublicReport } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { formatDate, formatTimeAgo } from '../utils/formatters';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ExternalLink,
  MapPin,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyReports();
      setReports(data);
    } catch (e) {
      console.warn('Failed to load my reports:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalCount = reports.length;
  const inProgressCount = reports.filter((r) => r.status === 'in_progress').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const openCount = reports.filter((r) => r.status === 'reported').length;

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.public_report_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#101F33] to-[#0D192B] border border-slate-700/80 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Welcome, {user?.name || 'Citizen'}</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
              Citizen Portal
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Monitor the status of your reported municipal complaints and track field repair progress.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 hover:from-cyan-300 hover:to-teal-300 shadow-md shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#101F33] border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Total Submitted</span>
          </div>
          <p className="text-2xl font-bold text-slate-100 font-mono mt-2">{totalCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#101F33] border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Under Review</span>
          </div>
          <p className="text-2xl font-bold text-amber-300 font-mono mt-2">{openCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#101F33] border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span>In Progress</span>
          </div>
          <p className="text-2xl font-bold text-cyan-300 font-mono mt-2">{inProgressCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#101F33] border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </div>
          <p className="text-2xl font-bold text-emerald-300 font-mono mt-2">{resolvedCount}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#101F33] border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search my submissions..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {['all', 'reported', 'in_progress', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Loading your submissions...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#101F33] border border-slate-800 space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-300">No submissions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't reported any urban issues matching the current filters.
            </p>
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit a Report</span>
            </Link>
          </div>
        ) : (
          filteredReports.map((r) => (
            <div
              key={r.public_report_id}
              className="p-5 rounded-xl bg-[#101F33] border border-slate-800/80 hover:border-slate-700 transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                    {r.public_report_id}
                  </span>
                  <CategoryBadge category={r.category} />
                  <StatusBadge status={r.status} />
                  <PriorityBadge level={r.priority_level} score={r.priority_score} showScore />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100 hover:text-cyan-300 transition-colors">
                    <Link to={`/issues/${r.public_report_id}`}>{r.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{r.locality}</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-slate-400">{r.approximate_address}</span>
                  </p>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 max-w-2xl">{r.description}</p>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0 gap-2 shrink-0">
                <span className="text-[11px] text-slate-500 font-mono">
                  Submitted {formatTimeAgo(r.created_at)}
                </span>
                <Link
                  to={`/issues/${r.public_report_id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                >
                  <span>Track Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
