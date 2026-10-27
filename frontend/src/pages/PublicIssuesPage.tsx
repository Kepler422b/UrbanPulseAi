import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PublicReport } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { HotspotMap } from '../components/map/HotspotMap';
import { formatDate, formatTimeAgo } from '../utils/formatters';
import {
  Search,
  Filter,
  List,
  Map,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const PublicIssuesPage: React.FC = () => {
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [localityFilter, setLocalityFilter] = useState<string>('');

  const fetchPublicReports = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.getPublicReports({
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        locality: localityFilter || undefined,
        search: searchTerm || undefined,
        page,
        limit: 15,
      });
      setReports(res.items);
      setTotalCount(res.total);
      setTotalPages(res.total_pages);
      setCurrentPage(res.page);
    } catch (e) {
      console.warn('Failed to load public reports:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicReports(1);
  }, [categoryFilter, statusFilter, localityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPublicReports(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <span>Public Civic Explorer</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
              Mira-Bhayandar
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and monitor municipal issue reports across all sectors. Privacy-safe public records.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'list'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'map'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#101F33] border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports by title, keyword, or report ID..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 text-xs"
            >
              <option value="">All Categories</option>
              <option value="potholes_damaged_roads">Potholes & Roads</option>
              <option value="garbage_overflow">Garbage & Waste</option>
              <option value="broken_streetlights">Streetlights</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 text-xs"
            >
              <option value="">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1">Locality</label>
            <select
              value={localityFilter}
              onChange={(e) => setLocalityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 text-xs"
            >
              <option value="">All Localities</option>
              <option value="Silver Park">Silver Park</option>
              <option value="Kanakia Park">Kanakia Park</option>
              <option value="Poonam Sagar">Poonam Sagar</option>
              <option value="Shanti Nagar">Shanti Nagar</option>
              <option value="Bhayandar West">Bhayandar West</option>
              <option value="Bhayandar East">Bhayandar East</option>
              <option value="Kashimira">Kashimira</option>
              <option value="Deepak Hospital Area">Deepak Hospital Area</option>
              <option value="Golden Nest">Golden Nest</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTENT: MAP OR LIST */}
      {viewMode === 'map' ? (
        <div className="space-y-3">
          <HotspotMap reports={reports} className="h-[600px]" showFilters={false} />
          <p className="text-xs text-slate-500 text-right">
            Displaying {reports.length} geocoded reports. Pins approximate locality coordinates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong className="text-slate-200">{reports.length}</strong> of{' '}
              <strong className="text-slate-200">{totalCount}</strong> reports
            </span>
          </div>

          {isLoading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
              <p className="text-xs text-slate-400 mt-2">Loading municipal reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#101F33] border border-slate-800 space-y-2">
              <Layers className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No matching reports found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((r) => (
                <div
                  key={r.public_report_id}
                  className="p-5 rounded-xl bg-[#101F33] border border-slate-800 hover:border-cyan-500/30 transition-all shadow-sm flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                        {r.public_report_id}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                      <Link to={`/issues/${r.public_report_id}`}>{r.title}</Link>
                    </h3>

                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{r.locality} &bull; {r.approximate_address}</span>
                    </p>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {r.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <CategoryBadge category={r.category} />
                      <PriorityBadge level={r.priority_level} score={r.priority_score} showScore />
                    </div>

                    <Link
                      to={`/issues/${r.public_report_id}`}
                      className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                      aria-label={`View details for ${r.public_report_id}`}
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => fetchPublicReports(currentPage - 1)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400">
                Page <strong className="text-slate-200">{currentPage}</strong> of{' '}
                <strong className="text-slate-200">{totalPages}</strong>
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => fetchPublicReports(currentPage + 1)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
