import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { AdminReport } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { Modal } from '../components/common/Modal';
import { formatDate, formatTimeAgo } from '../utils/formatters';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  UserPlus,
  MessageSquare,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Clock,
  RotateCcw,
} from 'lucide-react';

export const AdminIssuesPage: React.FC = () => {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [localityFilter, setLocalityFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [statusReason, setStatusReason] = useState('');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTeam, setAssignTeam] = useState('Sanitation Beat Team 1');
  const [assignNote, setAssignNote] = useState('');

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [internalNoteText, setInternalNoteText] = useState('');

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [originalReportId, setOriginalReportId] = useState('');
  const [duplicateReason, setDuplicateReason] = useState('');

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchReports = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.getAdminReports({
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        locality: localityFilter || undefined,
        search: searchTerm || undefined,
        sort_by: sortBy,
        page,
        limit: 15,
      });
      setReports(res.items);
      setTotalCount(res.total);
      setTotalPages(res.total_pages);
      setCurrentPage(res.page);
    } catch (e) {
      console.warn('Failed to load admin reports:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, [categoryFilter, statusFilter, severityFilter, localityFilter, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports(1);
  };

  // Action handlers
  const handleUpdateStatus = async () => {
    if (!selectedReport) return;
    try {
      await api.updateStatus(selectedReport.public_report_id, newStatus, statusReason);
      setStatusModalOpen(false);
      setActionSuccess(`Status for ${selectedReport.public_report_id} updated to ${newStatus}.`);
      fetchReports(currentPage);
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleAssignReport = async () => {
    if (!selectedReport) return;
    try {
      await api.assignReport(selectedReport.public_report_id, assignTeam, assignNote);
      setAssignModalOpen(false);
      setActionSuccess(`Work ticket assigned to ${assignTeam}.`);
      fetchReports(currentPage);
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    }
  };

  const handleAddInternalNote = async () => {
    if (!selectedReport) return;
    try {
      await api.addInternalNote(selectedReport.public_report_id, internalNoteText);
      setNoteModalOpen(false);
      setInternalNoteText('');
      setActionSuccess(`Internal operational note appended.`);
      fetchReports(currentPage);
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    }
  };

  const handleResolveIssue = async () => {
    if (!selectedReport) return;
    try {
      await api.resolveReport(selectedReport.public_report_id, resolutionNotes);
      setResolveModalOpen(false);
      setResolutionNotes('');
      setActionSuccess(`Report ${selectedReport.public_report_id} marked as resolved.`);
      fetchReports(currentPage);
    } catch (err: any) {
      alert(err.message || 'Resolution update failed');
    }
  };

  const handleMarkDuplicate = async () => {
    if (!selectedReport) return;
    try {
      await api.markDuplicate(selectedReport.public_report_id, originalReportId, duplicateReason);
      setDuplicateModalOpen(false);
      setOriginalReportId('');
      setDuplicateReason('');
      setActionSuccess(`Report marked duplicate of ${originalReportId}.`);
      fetchReports(currentPage);
    } catch (err: any) {
      alert(err.message || 'Failed to mark duplicate');
    }
  };

  const downloadCsv = () => {
    const url = api.getExportCsvUrl({
      category: categoryFilter || undefined,
      status: statusFilter || undefined,
      locality: localityFilter || undefined,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-cyan-400" />
            <span>Municipal Issue Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Prioritize complaints, dispatch field work orders, record internal audit notes, and close resolved tickets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchReports(currentPage)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>

          <button
            onClick={downloadCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#101F33] border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, keyword, assigned team, or locality..."
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

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-xs">
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
              <option value="duplicate">Duplicate</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 text-xs"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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

          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 text-xs"
            >
              <option value="priority">Priority (Highest First)</option>
              <option value="newest">Submission Date (Newest)</option>
              <option value="oldest">Submission Date (Oldest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-[#101F33] border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Report ID</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Title & Locality</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-cyan-400 mx-auto"></div>
                    <p className="mt-2 text-xs">Fetching municipal reports...</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No reports match the selected filters.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.public_report_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      <Link to={`/issues/${r.public_report_id}`} className="hover:underline">
                        {r.public_report_id}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <CategoryBadge category={r.category} />
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-100 truncate hover:text-cyan-300">
                        <Link to={`/issues/${r.public_report_id}`}>{r.title}</Link>
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{r.locality}</span>
                      </p>
                    </td>

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

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium">
                        {r.assigned_to || (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {formatTimeAgo(r.created_at)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Assign Team Button */}
                        <button
                          title="Assign Field Crew"
                          onClick={() => {
                            setSelectedReport(r);
                            setAssignModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>

                        {/* Status Change Button */}
                        <button
                          title="Update Status"
                          onClick={() => {
                            setSelectedReport(r);
                            setNewStatus(r.status);
                            setStatusModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>

                        {/* Add Internal Note */}
                        <button
                          title="Internal Note"
                          onClick={() => {
                            setSelectedReport(r);
                            setNoteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* Resolve */}
                        {r.status !== 'resolved' && (
                          <button
                            title="Mark Resolved"
                            onClick={() => {
                              setSelectedReport(r);
                              setResolveModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Mark Duplicate */}
                        <button
                          title="Mark Duplicate"
                          onClick={() => {
                            setSelectedReport(r);
                            setDuplicateModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-slate-200">{reports.length}</strong> of{' '}
            <strong className="text-slate-200">{totalCount}</strong> records
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => fetchReports(currentPage - 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Page <strong className="text-slate-200">{currentPage}</strong> of{' '}
                <strong className="text-slate-200">{totalPages}</strong>
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => fetchReports(currentPage + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Status: ${selectedReport?.public_report_id}`}
        description="Audit-recorded status transition."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="reported">Reported</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="duplicate">Duplicate</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Audit Reason</label>
            <input
              type="text"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="e.g. Field team arrived at location for initial survey"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"
            >
              Confirm Update
            </button>
          </div>
        </div>
      </Modal>

      {/* 2. Assign Team Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Field Team: ${selectedReport?.public_report_id}`}
        description="Direct dispatch to ward operations or electrical line crews."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Assigned Unit</label>
            <select
              value={assignTeam}
              onChange={(e) => setAssignTeam(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="Ward 2 Road Repair Gang">Ward 2 Road Repair Gang</option>
              <option value="Ward 3 PWD Asphalt Crew">Ward 3 PWD Asphalt Crew</option>
              <option value="Sanitation Beat Team 1">Sanitation Beat Team 1</option>
              <option value="Sanitation Beat Team 4 (Silver Park)">Sanitation Beat Team 4 (Silver Park)</option>
              <option value="Electrical Maintenance Division">Electrical Maintenance Division</option>
              <option value="Emergency Response Line Unit">Emergency Response Line Unit</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Dispatch Note</label>
            <textarea
              rows={2}
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              placeholder="e.g. Bring asphalt patching cold-mix and barricade tape"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignReport}
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"
            >
              Dispatch Assignment
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Internal Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title={`Append Internal Note: ${selectedReport?.public_report_id}`}
        description="Private notes visible exclusively to administrative personnel."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Internal Observation</label>
            <textarea
              required
              rows={3}
              value={internalNoteText}
              onChange={(e) => setInternalNoteText(e.target.value)}
              placeholder="e.g. Contacted Ward Officer regarding secondary dumper truck allocation."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setNoteModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAddInternalNote}
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"
            >
              Save Note
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. Resolve Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title={`Mark Resolved: ${selectedReport?.public_report_id}`}
        description="Record resolution audit notes and close ticket."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Resolution Summary</label>
            <textarea
              required
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Asphalt patch leveled and compacted. Corridor cleared for traffic."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setResolveModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleResolveIssue}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
            >
              Confirm Closure
            </button>
          </div>
        </div>
      </Modal>

      {/* 5. Duplicate Modal */}
      <Modal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        title={`Mark as Duplicate: ${selectedReport?.public_report_id}`}
        description="Link to the parent primary report."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Primary Report ID</label>
            <input
              type="text"
              required
              value={originalReportId}
              onChange={(e) => setOriginalReportId(e.target.value)}
              placeholder="e.g. UP-2026-SP001"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Duplicate Rationale</label>
            <input
              type="text"
              required
              value={duplicateReason}
              onChange={(e) => setDuplicateReason(e.target.value)}
              placeholder="e.g. Identical garbage overflow report for Silver Park Market"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDuplicateModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkDuplicate}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-100 font-bold hover:bg-slate-600"
            >
              Link Duplicate
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
