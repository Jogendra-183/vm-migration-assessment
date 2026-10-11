import React, { useState, useEffect } from 'react';
import { vmApi } from '../api/recommendations';
import { VmRecommendation, VmRecommendationSummary } from '../types';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import {
  Cpu,
  Search,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingDown,
  Layers,
  HardDrive,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VmRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<VmRecommendation[]>([]);
  const [summary, setSummary] = useState<VmRecommendationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [list, sum] = await Promise.all([
        vmApi.getAllRecommendations(),
        vmApi.getSummary().catch(() => null),
      ]);
      setRecommendations(list);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load VM recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = recommendations.filter((r) =>
    r.serverName.toLowerCase().includes(search.toLowerCase()) ||
    r.applicationName.toLowerCase().includes(search.toLowerCase())
  );

  const effectiveSummary = summary || (recommendations.length > 0 ? {
    totalRecommendedVms: recommendations.length,
    totalPhysicalCores: recommendations.reduce((acc, r) => acc + (r.currentCpuCores || 0), 0),
    totalRecommendedVcpu: recommendations.reduce((acc, r) => acc + (r.recommendedVcpu || 0), 0),
    totalPhysicalRamGb: recommendations.reduce((acc, r) => acc + (r.currentRamGb || 0), 0),
    totalRecommendedRamGb: recommendations.reduce((acc, r) => acc + (r.recommendedRamGb || 0), 0),
    totalPhysicalStorageGb: recommendations.reduce((acc, r) => acc + (r.currentStorageGb || 0), 0),
    totalRecommendedStorageGb: recommendations.reduce((acc, r) => acc + (r.recommendedStorageGb || 0), 0),
    cpuCapacityReductionPercent: Math.round(
      ((recommendations.reduce((acc, r) => acc + (r.currentCpuCores || 0), 0) -
        recommendations.reduce((acc, r) => acc + (r.recommendedVcpu || 0), 0)) /
        (recommendations.reduce((acc, r) => acc + (r.currentCpuCores || 0), 1) || 1)) * 100
    ),
    ramCapacityReductionPercent: Math.round(
      ((recommendations.reduce((acc, r) => acc + (r.currentRamGb || 0), 0) -
        recommendations.reduce((acc, r) => acc + (r.recommendedRamGb || 0), 0)) /
        (recommendations.reduce((acc, r) => acc + (r.currentRamGb || 0), 1) || 1)) * 100
    ),
  } : null);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <span>VM Right-Sizing Intelligence Hub</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Algorithmic target sizing derived from peak operational load telemetry with a 20% safety margin buffer
          </p>
        </div>
      </div>

      {/* Aggregate Savings Summary KPI Cards */}
      {effectiveSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="nexus-card p-5 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-50/50 via-white to-cyan-100/20 dark:from-slate-900 dark:to-cyan-950/30 shadow-md">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">vCPU Compute Savings</span>
            <div className="mt-2 flex items-baseline justify-between font-mono">
              <span className="text-2xl font-black text-cyan-700 dark:text-cyan-400">
                {effectiveSummary.totalPhysicalCores} → {effectiveSummary.totalRecommendedVcpu} vCPU
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                -{effectiveSummary.cpuCapacityReductionPercent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Reclaimed <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{effectiveSummary.totalPhysicalCores - effectiveSummary.totalRecommendedVcpu}</span> physical host cores
            </p>
          </div>

          <div className="nexus-card p-5 rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-50/50 via-white to-teal-100/20 dark:from-slate-900 dark:to-teal-950/30 shadow-md">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">RAM Footprint Savings</span>
            <div className="mt-2 flex items-baseline justify-between font-mono">
              <span className="text-2xl font-black text-teal-700 dark:text-teal-400">
                {effectiveSummary.totalPhysicalRamGb} → {effectiveSummary.totalRecommendedRamGb} GB
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                -{effectiveSummary.ramCapacityReductionPercent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Reclaimed <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{effectiveSummary.totalPhysicalRamGb - effectiveSummary.totalRecommendedRamGb} GB</span> unutilized memory
            </p>
          </div>

          <div className="nexus-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Target Virtual Instances</span>
            <div className="mt-2 flex items-baseline justify-between font-mono">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{effectiveSummary.totalRecommendedVms} VMs</span>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-sans">Right-Sized</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">GCP Compute Engine instance standard sizing</p>
          </div>

          <div className="nexus-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Storage Allocation</span>
            <div className="mt-2 flex items-baseline justify-between font-mono">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{effectiveSummary.totalRecommendedStorageGb} GB</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-sans">Thin Provisioned</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">High performance persistent SSD SAN</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="nexus-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search server or application..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400">{filtered.length} Recommendations</span>
      </div>

      {/* Recommendation Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Calculating virtual machine right-sizing matrices..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rec) => (
            <div
              key={rec.id}
              className="nexus-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all group cursor-pointer shadow-sm hover:shadow-xl"
              onClick={() => navigate(`/servers/${rec.serverId}`)}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {rec.serverName}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{rec.applicationName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    +{rec.vcpuSavings} Cores Saved
                  </span>
                </div>
              </div>

              {/* Sizing Comparison Grid */}
              <div className="grid grid-cols-2 gap-3 my-4 text-xs font-mono">
                {/* Compute */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Compute (Cores)</span>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-slate-500">{rec.currentCpuCores} Phys</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{rec.recommendedVcpu} vCPU</span>
                  </div>
                </div>

                {/* Memory */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">RAM (Memory)</span>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-slate-500">{rec.currentRamGb} GB</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{rec.recommendedRamGb} GB</span>
                  </div>
                </div>

                {/* Storage */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Disk Storage</span>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-slate-500">{rec.currentStorageGb} GB</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-200">{rec.recommendedStorageGb} GB</span>
                  </div>
                </div>

                {/* Post-Mig Utilization */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Est. Post-Mig Load</span>
                  <div className="mt-1.5 flex items-center justify-between font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400">{rec.estimatedCpuUtilization}% CPU</span>
                    <span className="text-cyan-600 dark:text-cyan-400">{rec.estimatedRamUtilization}% RAM</span>
                  </div>
                </div>
              </div>

              {/* Reasoning Description */}
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 line-clamp-2 font-medium">
                {rec.recommendationReason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
