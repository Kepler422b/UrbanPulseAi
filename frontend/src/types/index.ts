export type UserRole = 'citizen' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type IssueCategory =
  | 'potholes_damaged_roads'
  | 'garbage_overflow'
  | 'broken_streetlights'
  | 'water_drainage_leakage';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus = 'reported' | 'in_progress' | 'resolved' | 'duplicate';

export interface PriorityFactors {
  severity_score: number;
  recurrence_score: number;
  waiting_time_score: number;
  total_score: number;
  priority_level: IssueSeverity;
  explanation: string;
}

export interface PublicReport {
  id: string;
  public_report_id: string;
  category: IssueCategory;
  title: string;
  description: string;
  locality: string;
  approximate_address: string;
  latitude?: number | null;
  longitude?: number | null;
  severity: IssueSeverity;
  priority_score: number;
  priority_level: IssueSeverity;
  status: IssueStatus;
  image_url?: string | null;
  created_at: string;
  updated_at?: string | null;
  resolved_at?: string | null;
}

export interface AdminReport extends PublicReport {
  user_id?: string | null;
  reporter_name?: string | null;
  assigned_to?: string | null;
  resolution_notes?: string | null;
  priority_factors?: PriorityFactors | null;
  internal_notes_count: number;
  duplicate_of?: string | null;
}

export interface StatusHistoryItem {
  report_id: string;
  old_status?: string | null;
  new_status: string;
  changed_by_name: string;
  timestamp: string;
  reason?: string | null;
}

export interface InternalNoteItem {
  id: string;
  report_id: string;
  admin_name: string;
  note: string;
  created_at: string;
}

export interface AnalyticsSummary {
  total_reports: number;
  open_reports: number;
  in_progress_reports: number;
  resolved_reports: number;
  high_priority_reports: number;
  average_resolution_hours: number;
  is_demo_data: boolean;
}

export interface CategoryDistribution {
  category: string;
  label: string;
  count: number;
  percentage: number;
  open_count: number;
  resolved_count: number;
}

export interface TrendDataPoint {
  date: string;
  reported: number;
  resolved: number;
}

export interface ResolutionTimeCategory {
  category: string;
  label: string;
  avg_hours: number;
  resolved_count: number;
}

export interface HotspotCluster {
  locality: string;
  latitude: number;
  longitude: number;
  total_issues: number;
  potholes_count: number;
  garbage_count: number;
  streetlights_count: number;
  unresolved_count: number;
  risk_level: 'high' | 'medium' | 'standard';
}

export interface OperationalInsight {
  insight_id: string;
  insight_type: 'hotspot' | 'recurring_issue' | 'prolonged_unresolved' | 'volume_surge' | 'potential_duplicate';
  category: string;
  category_label: string;
  locality: string;
  observation_period: string;
  supporting_count: number;
  explanation: string;
  recommendation: string;
  evidence_level: 'high' | 'medium' | 'emerging';
  report_ids: string[];
  generated_at: string;
  is_demo_analysis: boolean;
}

export interface InsightAnalysisResponse {
  insights: OperationalInsight[];
  total_insights: number;
  generated_at: string;
  analysis_notice: string;
}
