import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard';
import { DashboardStats } from '../types';
import { KpiCard } from '../components/Common/KpiCard';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Trash2,
  Percent,
  ShieldAlert,
  Cpu,
  Boxes,
  Activity,
  Play,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <LoadingSpinner message="Synthesizing real-time infrastructure telemetry & migration intelligence..." />;
  }

  const classificationColors: Record<string, string> = {
    READY_TO_MIGRATE: '#10B981',
    REQUIRES_OPTIMIZATION: '#F59E0B',
    KEEP_PHYSICAL: '#EF4444',
    RETIRE: '#64748B',
  };

  const riskColors: Record<string, string> = {
    LOW: '#10B981',
    MEDIUM: '#06B6D4',
    HIGH: '#F59E0B',
    CRITICAL: '#EF4444',
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner Announcement & CTA */}
      <div className="nexus-card p-6 sm:p-7 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-slate-900/95 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25 shrink-0 flex items-center justify-center">
            <Zap className="w-6 h-6 fill-slate-950 stroke-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                NEXUS Migration Suitability Engine
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                LIVE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
              Evaluating <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{stats.totalServers} physical host environments</span> across utilization telemetry, OS compatibility, GCP right-sizing, and bin-packing consolidation.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/assessment')}
          className="relative z-10 flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-xl shadow-cyan-950/40 transition-all active:scale-95 whitespace-nowrap"
        >
          <Play className="w-4 h-4 fill-slate-950 stroke-slate-950" />
          <span>Execute Full Assessment</span>
        </button>
      </div>

      {/* Row 1: Primary Classification KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Workload Inventory & Suitability Breakdown
          </h3>
          <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
            Total Monitored: {stats.totalServers} Nodes
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="Total Physical Hosts"
            value={stats.totalServers}
            subtitle="Discovered inventory scope"
            icon={Server}
            color="slate"
          />
          <KpiCard
            title="Ready to Migrate"
            value={stats.readyToMigrate}
            subtitle={`${Math.round((stats.readyToMigrate / (stats.totalServers || 1)) * 100)}% direct compatibility`}
            icon={CheckCircle2}
            color="emerald"
            badge="Direct Fit"
            badgeType="success"
          />
          <KpiCard
            title="Requires Optimization"
            value={stats.requiresOptimization}
            subtitle="Needs OS patch or memory tuning"
            icon={AlertTriangle}
            color="amber"
            badge="Action Req."
            badgeType="warning"
          />
          <KpiCard
            title="Keep Physical"
            value={stats.keepPhysical}
            subtitle="Bare-metal / Hardware lock-in"
            icon={HardDrive}
            color="rose"
            badge="Bare Metal"
            badgeType="danger"
          />
          <KpiCard
            title="Retire / Decom"
            value={stats.retire}
            subtitle="Obsolete & abandoned servers"
            icon={Trash2}
            color="cyan"
            badge="Cost Avoidance"
            badgeType="info"
          />
        </div>
      </div>

      {/* Row 2: Secondary Transformation Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Migration Readiness"
          value={`${stats.migrationReadinessPercent}%`}
          subtitle="Workload cloud suitability index"
          icon={Percent}
          color="emerald"
        />
        <KpiCard
          title="High/Critical Risk"
          value={stats.highRiskServersCount}
          subtitle="Requires wave isolation & staging"
          icon={ShieldAlert}
          color="rose"
        />
        <KpiCard
          title="Target GCP VMs"
          value={stats.recommendedVmCount}
          subtitle="Right-sized compute instances"
          icon={Cpu}
          color="cyan"
        />
        <KpiCard
          title="Consolidation Ratio"
          value={`${stats.consolidationRatio}:1`}
          subtitle={`Across ${stats.virtualizationHostsRequired} virtual hypervisors`}
          icon={Boxes}
          color="violet"
        />
      </div>

      {/* Row 3: Visual Charts (Classification Breakdown & Risk Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classification Distribution */}
        <div className="nexus-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide">
                Workload Classification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Distribution across <span className="font-mono font-bold">{stats.totalServers}</span> physical servers
              </p>
            </div>
            <button
              onClick={() => navigate('/servers')}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-bold flex items-center space-x-1"
            >
              <span>Explore List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.classificationChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="label"
                >
                  {stats.classificationChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.colorHex || classificationColors[entry.classification] || '#06B6D4'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F19',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  }}
                  formatter={(val: any, name: any, item: any) => [`${val} Servers (${item.payload.percentage}%)`, name]}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="nexus-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide">
                Risk Assessment Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluated on OS vintage, downtime tolerance, & dependencies
              </p>
            </div>
            <button
              onClick={() => navigate('/risks')}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-bold flex items-center space-x-1"
            >
              <span>Risk Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.riskChart} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="label" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F19',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  }}
                  formatter={(val: any, name: any, item: any) => [`${val} Servers (${item.payload.percentage}%)`, 'Count']}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {stats.riskChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.colorHex || riskColors[entry.riskLevel] || '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Average Resource Utilization Telemetry Gauges */}
      <div className="nexus-card p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              <span>Aggregate Baseline Telemetry</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real metrics aggregated across all {stats.totalServers} physical nodes
            </p>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/80 font-mono">
            Active Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CPU Util */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Avg CPU Load</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold font-mono text-sm">{stats.averageCpuUtilization}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Number(stats.averageCpuUtilization))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-2 font-medium">Significant headroom for VM core consolidation</span>
          </div>

          {/* RAM Util */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Avg RAM Load</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-extrabold font-mono text-sm">{stats.averageRamUtilization}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Number(stats.averageRamUtilization))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-2 font-medium">Healthy memory allocation buffer</span>
          </div>

          {/* Storage Util */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Avg Storage Load</span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold font-mono text-sm">{stats.averageStorageUtilization}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Number(stats.averageStorageUtilization))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-2 font-medium">Optimal for thin-provisioned virtual SAN</span>
          </div>

          {/* Network Util */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Avg Network Load</span>
              <span className="text-violet-600 dark:text-violet-400 font-extrabold font-mono text-sm">{stats.averageNetworkUtilization}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Number(stats.averageNetworkUtilization))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-2 font-medium">Fits within standard 10GbE virtual switches</span>
          </div>
        </div>
      </div>

      {/* Row 5: Infrastructure Before vs After Comparison */}
      <div className="nexus-card p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide">
              Infrastructure Transformation Model (Physical Source vs Target Virtual)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Calculated efficiency through bin-packing hypervisor consolidation
            </p>
          </div>
          <button
            onClick={() => navigate('/consolidation')}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-bold flex items-center space-x-1"
          >
            <span>Consolidation Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Host Count Footprint
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-rose-500 font-mono">{stats.infrastructureComparison.physicalServersCount}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Physical Servers</span>
              </div>
              <span className="text-slate-400 text-xl font-bold">→</span>
              <div>
                <span className="text-3xl font-black text-emerald-500 font-mono">{stats.infrastructureComparison.targetVirtualHostsCount}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Hypervisors</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Host Reduction:</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {Math.round(((stats.infrastructureComparison.physicalServersCount - stats.infrastructureComparison.targetVirtualHostsCount) / (stats.infrastructureComparison.physicalServersCount || 1)) * 100)}% Fewer Physical Nodes
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              CPU Capacity Optimization
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-rose-500 font-mono">{stats.infrastructureComparison.physicalTotalCores}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Physical Cores</span>
              </div>
              <span className="text-slate-400 text-xl font-bold">→</span>
              <div>
                <span className="text-3xl font-black text-emerald-500 font-mono">{stats.infrastructureComparison.targetTotalVcpu}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Right-Sized vCPUs</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Core Efficiency Gain:</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">+{stats.infrastructureComparison.coreReductionPercent}% Savings</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Memory Footprint Optimization
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-rose-500 font-mono">{stats.infrastructureComparison.physicalTotalRamGb} GB</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Physical RAM</span>
              </div>
              <span className="text-slate-400 text-xl font-bold">→</span>
              <div>
                <span className="text-3xl font-black text-emerald-500 font-mono">{stats.infrastructureComparison.targetTotalRamGb} GB</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Right-Sized RAM</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold">RAM Efficiency Gain:</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">+{stats.infrastructureComparison.ramReductionPercent}% Savings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
