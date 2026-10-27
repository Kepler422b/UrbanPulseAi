import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AdminReport, StatusHistoryItem, InternalNoteItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { Modal } from '../components/common/Modal';
import { formatDate, formatTimeAgo } from '../utils/formatters';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { createCustomMarkerIcon } from '../components/map/mapIcons';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  UserPlus,
  MessageSquare,
  AlertTriangle,
  History,
  FileText,
  Camera,
  Layers,
} from 'lucide-react';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [report, setReport] = useState<AdminReport | null>(null);
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [notes, setNotes] = useState<InternalNoteItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Admin action modals
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [statusReason, setStatusReason] = useState('');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTeam, setAssignTeam] = useState('Ward 3 PWD Asphalt Crew');
  const [assignNote, setAssignNote] = useState('');

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [repData, histData] = await Promise.all([
        api.getReportDetails(id),
        api.getReportHistory(id),
      ]);
      setReport(repData);
      setHistory(histData);

      if (isAdmin) {
        try {
          const notesData = await api.getReportNotes(id);
          setNotes(notesData);
        } catch {
          // Non-admin or notes not found
        }
      }
    } catch (e: any) {
      setError(e.message || 'Report not found');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, isAdmin]);

  const handleUpdateStatus = async () => {
    if (!id) return;
    try {
      await api.updateStatus(id, newStatus, statusReason);
      setStatusModalOpen(false);
      fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleAssign = async () => {
    if (!id) return;
    try {
      await api.assignReport(id, assignTeam, assignNote);
      setAssignModalOpen(false);
      fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    }
  };

  const handleAddNote = async () => {
    if (!id) return;
    try {
      await api.addInternalNote(id, noteText);
      setNoteModalOpen(false);
      setNoteText('');
      fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    }
  };

  const handleResolve = async () => {
    if (!id) return;
    try {
      await api.resolveReport(id, resolutionNotes);
      setResolveModalOpen(false);
      setResolutionNotes('');
      fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Resolution failed');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
        <p className="text-xs text-slate-400 mt-2">Loading report telemetry...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-[#101F33] border border-slate-800 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-100">Report Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'The requested issue identifier does not exist.'}</p>
        <Link
          to="/issues"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 text-cyan-300 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explorer</span>
        </Link>
      </div>
    );
  }

  const mapLat = report.latitude || 19.2952;
  const mapLng = report.longitude || 72.8544;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous view</span>
        </button>
      </div>

      {/* Main Header Card */}
      <div className="p-6 rounded-2xl bg-[#101F33] border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-extrabold text-cyan-400 bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-500/30">
              {report.public_report_id}
            </span>
            <CategoryBadge category={report.category} />
            <StatusBadge status={report.status} />
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge
              level={report.priority_level}
              score={report.priority_score}
              showScore
              explanation={report.priority_factors?.explanation}
            />
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">{report.title}</h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-200">{report.locality}</span>
            <span>&bull;</span>
            <span>{report.approximate_address}</span>
          </p>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          {report.description}
        </p>

        {/* Priority Engine Factors Breakdown */}
        {report.priority_factors && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                Explainable Priority Scoring Breakdown
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                Total: {report.priority_factors.total_score} / 100
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {report.priority_factors.explanation}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-500">Severity Weight (40%):</span>
                <p className="font-mono text-slate-200 font-semibold">
                  {report.priority_factors.severity_score}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Recurrence Weight (35%):</span>
                <p className="font-mono text-slate-200 font-semibold">
                  {report.priority_factors.recurrence_score}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Waiting Time Weight (25%):</span>
                <p className="font-mono text-slate-200 font-semibold">
                  {report.priority_factors.waiting_time_score}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Action Buttons */}
        {isAdmin && (
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAssignModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Assign Crew</span>
            </button>

            <button
              onClick={() => setStatusModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Update Status</span>
            </button>

            <button
              onClick={() => setNoteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Add Internal Note</span>
            </button>

            {report.status !== 'resolved' && (
              <button
                onClick={() => setResolveModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold transition-colors ml-auto"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid: Map & Image & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map & Metadata (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Map */}
          <div className="p-5 rounded-2xl bg-[#101F33] border border-slate-800 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Geocoded Position</span>
            </h3>

            <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-800">
              <MapContainer
                center={[mapLat, mapLng]}
                zoom={14}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[mapLat, mapLng]} icon={createCustomMarkerIcon('#22D3EE')}>
                  <Popup>
                    <div className="p-1 text-xs">
                      <strong>{report.title}</strong>
                      <p>{report.locality}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>Latitude: {mapLat.toFixed(5)}°N</span>
              <span>Longitude: {mapLng.toFixed(5)}°E</span>
            </div>
          </div>

          {/* Photo if present */}
          {report.image_url && (
            <div className="p-5 rounded-2xl bg-[#101F33] border border-slate-800 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>On-Site Photographic Evidence</span>
              </h3>
              <div className="rounded-xl overflow-hidden border border-slate-800 max-h-72">
                <img
                  src={report.image_url}
                  alt="On-site evidence"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Resolution notes if resolved */}
          {report.resolution_notes && (
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Resolution Audit Notes</span>
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {report.resolution_notes}
              </p>
              {report.resolved_at && (
                <span className="text-[10px] text-emerald-400 block pt-1">
                  Completed {formatDate(report.resolved_at)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Status Timeline & Internal Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status History Audit */}
          <div className="p-5 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-3">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Status History Audit Trail</span>
            </h3>

            <div className="space-y-4 text-xs">
              {history.map((h, idx) => (
                <div key={idx} className="relative pl-6 pb-2 border-l border-slate-800 last:border-0 last:pb-0">
                  <span className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-slate-900" />
                  <div className="flex items-center justify-between">
                    <StatusBadge status={h.new_status} />
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTimeAgo(h.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1">{h.reason}</p>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Updated by: <strong className="text-slate-400">{h.changed_by_name}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Administrative Notes (Admin Exclusive) */}
          {isAdmin && (
            <div className="p-5 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Internal Operational Notes</span>
                </h3>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  Restricted
                </span>
              </div>

              {notes.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No internal notes appended yet.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <strong className="text-slate-300">{n.admin_name}</strong>
                        <span>{formatTimeAgo(n.created_at)}</span>
                      </div>
                      <p className="text-xs text-slate-200">{n.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Issue Status"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs"
            >
              <option value="reported">Reported</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="duplicate">Duplicate</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Reason</label>
            <input
              type="text"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="e.g. Dispatched asphalt cold mix unit"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setStatusModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">
              Cancel
            </button>
            <button onClick={handleUpdateStatus} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold">
              Update Status
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Field Unit"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Unit</label>
            <select
              value={assignTeam}
              onChange={(e) => setAssignTeam(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs"
            >
              <option value="Ward 3 PWD Asphalt Crew">Ward 3 PWD Asphalt Crew</option>
              <option value="Ward 2 Road Repair Gang">Ward 2 Road Repair Gang</option>
              <option value="Sanitation Beat Team 1">Sanitation Beat Team 1</option>
              <option value="Electrical Maintenance Division">Electrical Maintenance Division</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Dispatch Note</label>
            <input
              type="text"
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              placeholder="e.g. Priority inspection required today"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setAssignModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">
              Cancel
            </button>
            <button onClick={handleAssign} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold">
              Dispatch
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Add Internal Note"
      >
        <div className="space-y-4 text-xs">
          <textarea
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Administrative operational note..."
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setNoteModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">
              Cancel
            </button>
            <button onClick={handleAddNote} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold">
              Save Note
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Mark Issue Resolved"
      >
        <div className="space-y-4 text-xs">
          <textarea
            rows={3}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Provide resolution details for audit history..."
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setResolveModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">
              Cancel
            </button>
            <button onClick={handleResolve} className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold">
              Close Issue
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
