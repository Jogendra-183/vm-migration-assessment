import React, { useState, useEffect } from 'react';
import { assessmentApi } from '../api/assessments';
import { Assessment, AssessmentSummary } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { Modal } from '../components/Common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Trash2,
  Percent,
  Search,
  Eye,
  Sliders,
  Award,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AssessmentPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [summary, setSummary] = useState<AssessmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [search, setSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [list, sum] = await Promise.all([
        assessmentApi.getAllAssessments(),
        assessmentApi.getSummary(),
      ]);
      setAssessments(list);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAssessment = async () => {
    if (!isAdmin) return;
    try {
      setRunning(true);
      const res = await assessmentApi.runAssessment();
      setAssessments(res.results);
      setSummary(res.summary);
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Failed to run assessment simulation:', err);
    } finally {
      setRunning(false);
    }
  };

  const filteredAssessments = assessments.filter((a) => {
    const matchesSearch =
      a.serverName.toLowerCase().includes(search.toLowerCase()) ||
      a.applicationName.toLowerCase().includes(search.toLowerCase());
    const matchesClass = !classificationFilter || a.classification === classificationFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-semibold flex items-center justify-between shadow-2xl animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-cyan-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Hero Assessment Banner */}
      <div className="nexus-card p-6 sm:p-7 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-slate-900/95 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Algorithmic Suitability & Right-Sizing Engine</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Multi-Factor Migration Assessment
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-medium">
            Evaluates 7 multi-dimensional parameters (CPU/RAM/Storage/Network load, application compatibility, dependency complexity, and business criticality) to calculate precise suitability scores, risk levels, and wave scheduling across all inventory servers.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleRunAssessment}
            disabled={running}
            className="relative z-10 flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-cyan-950/30 transition-all active:scale-95 whitespace-nowrap disabled:opacity-50"
          >
            {running ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Evaluating Entire Fleet...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950 stroke-slate-950" />
                <span>Run Full Assessment</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-2xl nexus-card border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Workloads</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">{summary.totalServers}</span>
          </div>
          <div className="p-4 rounded-2xl nexus-card border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Ready to Migrate</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">{summary.readyToMigrate}</span>
          </div>
          <div className="p-4 rounded-2xl nexus-card border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Optimize First</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1 block">{summary.requiresOptimization}</span>
          </div>
          <div className="p-4 rounded-2xl nexus-card border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">Keep Physical</span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1 block">{summary.keepPhysical}</span>
          </div>
          <div className="p-4 rounded-2xl nexus-card border-slate-300 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Retire / Decom</span>
            <span className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-300 font-mono mt-1 block">{summary.retire}</span>
          </div>
          <div className="p-4 rounded-2xl nexus-card border-violet-500/30 bg-violet-50/50 dark:bg-violet-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 block">Avg Fleet Score</span>
            <span className="text-xl sm:text-2xl font-black text-violet-600 dark:text-violet-400 font-mono mt-1 block">{summary.averageMigrationScore}/100</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="nexus-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by server or application name..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Classifications</option>
            <option value="READY_TO_MIGRATE">Ready to Migrate</option>
            <option value="REQUIRES_OPTIMIZATION">Requires Optimization</option>
            <option value="KEEP_PHYSICAL">Keep Physical</option>
            <option value="RETIRE">Retire</option>
          </select>
        </div>
      </div>

      {/* Assessment Table */}
      <div className="nexus-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner message="Calculating dynamic suitability scores and risk matrix..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Server</th>
                  <th className="py-3.5 px-4">Application</th>
                  <th className="py-3.5 px-4 text-center">Suitability Score</th>
                  <th className="py-3.5 px-4">Classification</th>
                  <th className="py-3.5 px-4 text-center">Risk Score</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4">Migration Priority</th>
                  <th className="py-3.5 px-4 text-right">Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                {filteredAssessments.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 transition-colors group cursor-pointer"
                    onClick={() => setSelectedAssessment(a)}
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {a.serverName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-semibold">{a.applicationName}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center space-x-1 font-bold font-mono text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs">
                        <span>{a.migrationScore}</span>
                        <span className="text-slate-400 font-normal">/100</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="classification" value={a.classification} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {a.riskScore}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="risk" value={a.riskLevel} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="priority" value={a.migrationPriority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedAssessment(a)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Score Breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assessment Factor Detail Modal */}
      {selectedAssessment && (
        <Modal
          isOpen={!!selectedAssessment}
          onClose={() => setSelectedAssessment(null)}
          title={`Assessment Factor Breakdown: ${selectedAssessment.serverName}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Classification</span>
                <StatusBadge type="classification" value={selectedAssessment.classification} size="md" />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Suitability</span>
                <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">{selectedAssessment.migrationScore} / 100</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Risk Score</span>
                <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">{selectedAssessment.riskScore} / 100</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Algorithmic Rationale:</span>
              <p className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-800 font-medium">
                {selectedAssessment.reason}
              </p>
            </div>

            {selectedAssessment.scoreBreakdown && (
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">Sub-Score Factors (Weighted 0-100):</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400 font-sans">CPU Factor (25%):</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{selectedAssessment.scoreBreakdown.cpuScore}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400 font-sans">RAM Factor (20%):</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{selectedAssessment.scoreBreakdown.ramScore}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400 font-sans">Storage Factor (10%):</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{selectedAssessment.scoreBreakdown.storageScore}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400 font-sans">Network Factor (10%):</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{selectedAssessment.scoreBreakdown.networkScore}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400 font-sans">Compatibility (15%):</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{selectedAssessment.scoreBreakdown.compatibilityScore}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400 font-sans">Dependency (10%):</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{selectedAssessment.scoreBreakdown.dependencyScore}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  const sId = selectedAssessment.serverId;
                  setSelectedAssessment(null);
                  navigate(`/servers/${sId}`);
                }}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-bold flex items-center space-x-1"
              >
                <span>View Full 360° Specs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedAssessment(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
