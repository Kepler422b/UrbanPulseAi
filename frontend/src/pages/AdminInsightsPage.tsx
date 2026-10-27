import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { OperationalInsight } from '../types';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { formatDate } from '../utils/formatters';
import {
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const AdminInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<OperationalInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisNotice, setAnalysisNotice] = useState<string>('');

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await api.getInsights();
      setInsights(res.insights);
      setAnalysisNotice(res.analysis_notice);
    } catch (e) {
      console.warn('Failed to load insights:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunLiveAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await api.runLiveAnalysis();
      setInsights(res.insights);
      setAnalysisNotice(res.analysis_notice);
    } catch (e) {
      console.warn('Failed to trigger live analysis:', e);
      alert('Analysis trigger failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getEvidenceBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
            High Confidence
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Medium Confidence
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Emerging Pattern
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-teal-400" />
              <span>AI Operational Insights & Pattern Engine</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explainable rule-based pattern detection analyzing recurrent spatial clusters, SLA delays, and municipal capacity bottlenecks.
          </p>
        </div>

        <button
          onClick={handleRunLiveAnalysis}
          disabled={isAnalyzing}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 hover:from-teal-300 hover:to-cyan-300 shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing Pattern Matrix...' : 'Run Live Analysis'}</span>
        </button>
      </div>

      {/* Rationale Notice */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-cyan-950/40 border border-teal-500/30 text-xs text-slate-300 space-y-1">
        <div className="flex items-center gap-2 text-teal-300 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Transparent Algorithmic Rationale Active</span>
        </div>
        <p className="text-[11px] text-slate-400">
          {analysisNotice || 'Calculated using real statistical rules and cluster boundaries over Mira-Bhayandar municipal database records.'}
        </p>
      </div>

      {/* Insights Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Computing operational pattern models...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#101F33] border border-slate-800 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-200">No abnormal operational clusters detected</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All sectors currently operate within normal limits, or complaints are evenly distributed without dense recurrent hotspots.
            </p>
          </div>
        ) : (
          insights.map((ins) => (
            <div
              key={ins.insight_id}
              className="p-6 rounded-2xl bg-[#101F33] border border-slate-800 hover:border-teal-500/40 transition-all shadow-xl space-y-4"
            >
              {/* Insight Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
                    {ins.insight_id}
                  </span>
                  <CategoryBadge category={ins.category} />
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <strong>{ins.locality}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Window: {ins.observation_period}
                  </span>
                  {getEvidenceBadge(ins.evidence_level)}
                </div>
              </div>

              {/* Rationale & Recommendation Box */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Observed Operational Pattern
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{ins.explanation}</p>
                  <div className="text-[11px] text-slate-500 font-mono pt-1">
                    Supporting Dataset: {ins.supporting_count} correlated complaints
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/20 space-y-2">
                  <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-teal-400" />
                    Recommended Municipal Action
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {ins.recommendation}
                  </p>
                </div>
              </div>

              {/* Linked Reports Reference Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800/80">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-500 text-[11px]">Correlated Records:</span>
                  {ins.report_ids.map((id) => (
                    <Link
                      key={id}
                      to={`/issues/${id}`}
                      className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                    >
                      {id}
                    </Link>
                  ))}
                </div>

                <span className="text-[11px] text-slate-500">
                  Engine Timestamp: {formatDate(ins.generated_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
