import { IssueCategory, IssueSeverity, IssueStatus } from '../types';

export const CATEGORY_INFO: Record<IssueCategory, { label: string; icon: string; color: string }> = {
  potholes_damaged_roads: {
    label: 'Potholes & Damaged Roads',
    icon: 'construction',
    color: '#F59E0B',
  },
  garbage_overflow: {
    label: 'Garbage Overflow & Waste',
    icon: 'trash-2',
    color: '#10B981',
  },
  broken_streetlights: {
    label: 'Broken Streetlights',
    icon: 'lightbulb-off',
    color: '#38BDF8',
  },
  water_drainage_leakage: {
    label: 'Water & Drainage Leakage',
    icon: 'droplets',
    color: '#818CF8',
  },
};

export function getCategoryLabel(category: string): string {
  if (category in CATEGORY_INFO) {
    return CATEGORY_INFO[category as IssueCategory].label;
  }
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getStatusBadgeConfig(status: IssueStatus | string) {
  switch (status) {
    case 'reported':
      return { label: 'Reported', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'in_progress':
      return { label: 'In Progress', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    case 'resolved':
      return { label: 'Resolved', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'duplicate':
      return { label: 'Duplicate', bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' };
    default:
      return { label: status, bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' };
  }
}

export function getPriorityBadgeConfig(level: IssueSeverity | string) {
  switch (level) {
    case 'critical':
      return { label: 'Critical', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40' };
    case 'high':
      return { label: 'High', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' };
    case 'medium':
      return { label: 'Medium', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' };
    case 'low':
      return { label: 'Low', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    default:
      return { label: level, bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/30' };
  }
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  } catch {
    return dateStr;
  }
}
