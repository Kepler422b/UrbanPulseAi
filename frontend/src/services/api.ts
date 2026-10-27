import {
  AuthResponse,
  User,
  PublicReport,
  AdminReport,
  StatusHistoryItem,
  InternalNoteItem,
  AnalyticsSummary,
  CategoryDistribution,
  TrendDataPoint,
  ResolutionTimeCategory,
  HotspotCluster,
  InsightAnalysisResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('urbanpulse_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errorJson = await res.json();
        errorMsg = errorJson.detail || errorJson.message || errorMsg;
      } catch {
        // use default error message
      }
      throw new Error(errorMsg);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    console.warn(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: async () => {
    return request<{ status: string; service: string; database_mode: string }>('/health');
  },

  // Auth
  register: async (payload: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login: async (payload: { email: string; password: string }): Promise<AuthResponse> => {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getProfile: async (): Promise<User> => {
    return request<User>('/auth/me');
  },

  changePassword: async (payload: { current_password: string; new_password: string }) => {
    return request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Reports
  uploadImage: async (file: File): Promise<{ image_url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('urbanpulse_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/reports/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Image upload failed');
    }
    return res.json();
  },

  submitReport: async (reportData: {
    category: string;
    title: string;
    description: string;
    locality: string;
    approximate_address: string;
    latitude?: number | null;
    longitude?: number | null;
    severity: string;
    image_url?: string | null;
  }): Promise<{ message: string; public_report_id: string; report: any }> => {
    return request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  getMyReports: async (): Promise<PublicReport[]> => {
    return request<PublicReport[]>('/reports/my');
  },

  getReportDetails: async (reportId: string): Promise<AdminReport> => {
    return request<AdminReport>(`/reports/${reportId}`);
  },

  getReportHistory: async (reportId: string): Promise<StatusHistoryItem[]> => {
    return request<StatusHistoryItem[]>(`/reports/${reportId}/history`);
  },

  getReportNotes: async (reportId: string): Promise<InternalNoteItem[]> => {
    return request<InternalNoteItem[]>(`/reports/${reportId}/notes`);
  },

  // Public
  getPublicReports: async (params?: {
    category?: string;
    status?: string;
    locality?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: PublicReport[]; total: number; page: number; limit: number; total_pages: number }> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.locality) query.append('locality', params.locality);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return request(`/public/reports?${query.toString()}`);
  },

  // Admin
  getAdminReports: async (params?: {
    category?: string;
    status?: string;
    locality?: string;
    severity?: string;
    search?: string;
    sort_by?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: AdminReport[]; total: number; page: number; limit: number; total_pages: number }> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.locality) query.append('locality', params.locality);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.search) query.append('search', params.search);
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return request(`/admin/reports?${query.toString()}`);
  },

  updateStatus: async (reportId: string, status: string, reason?: string) => {
    return request(`/admin/reports/${reportId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },

  assignReport: async (reportId: string, assignedTo: string, note?: string) => {
    return request(`/admin/reports/${reportId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assigned_to: assignedTo, note }),
    });
  },

  addInternalNote: async (reportId: string, note: string) => {
    return request<{ message: string; note: InternalNoteItem }>(`/admin/reports/${reportId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },

  resolveReport: async (reportId: string, resolutionNotes: string) => {
    return request(`/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution_notes: resolutionNotes }),
    });
  },

  markDuplicate: async (reportId: string, originalReportId: string, reason: string) => {
    return request(`/admin/reports/${reportId}/mark-duplicate`, {
      method: 'POST',
      body: JSON.stringify({ original_report_id: originalReportId, reason }),
    });
  },

  getExportCsvUrl: (params?: { category?: string; status?: string; locality?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.locality) query.append('locality', params.locality);
    return `${API_BASE}/admin/export/reports.csv?${query.toString()}`;
  },

  resetDemoData: async () => {
    return request<{ message: string }>('/admin/demo/reset', {
      method: 'POST',
    });
  },

  // Analytics
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    return request<AnalyticsSummary>('/admin/analytics/summary');
  },

  getTrends: async (days: number = 14): Promise<TrendDataPoint[]> => {
    return request<TrendDataPoint[]>(`/admin/analytics/trends?days=${days}`);
  },

  getCategoryDistribution: async (): Promise<CategoryDistribution[]> => {
    return request<CategoryDistribution[]>('/admin/analytics/categories');
  },

  getHotspots: async (): Promise<HotspotCluster[]> => {
    return request<HotspotCluster[]>('/admin/analytics/hotspots');
  },

  getResolutionTimes: async (): Promise<ResolutionTimeCategory[]> => {
    return request<ResolutionTimeCategory[]>('/admin/analytics/resolution-times');
  },

  // AI Insights
  getInsights: async (): Promise<InsightAnalysisResponse> => {
    return request<InsightAnalysisResponse>('/admin/insights');
  },

  runLiveAnalysis: async (): Promise<InsightAnalysisResponse> => {
    return request<InsightAnalysisResponse>('/admin/insights/analyze', {
      method: 'POST',
    });
  },
};
