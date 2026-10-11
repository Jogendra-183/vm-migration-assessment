import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serversApi } from '../api/servers';
import { ServerDetail as ServerDetailType } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import {
  ArrowLeft,
  Server as ServerIcon,
  Cpu,
  HardDrive,
  Activity,
  ShieldAlert,
  GitFork,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  AppWindow,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

import { assessmentApi } from '../api/assessments';
import { useAuth } from '../context/AuthContext';

export const ServerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<ServerDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchDetail(Number(id));
    }
  }, [id]);

  const fetchDetail = async (serverId: number) => {
    try {
      setLoading(true);
      const data = await serversApi.getServerDetail(serverId);
      setDetail(data);
    } catch (err) {
      console.error('Failed to fetch server detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSingleAssessment = async () => {
    if (!id) return;
    try {
      setAssessing(true);
      await assessmentApi.assessSingleServer(Number(id));
      await fetchDetail(Number(id));
    } catch (err) {
      console.error('Failed to assess server:', err);
    } finally {
      setAssessing(false);
    }
  };

  if (loading || !detail) {
    return <LoadingSpinner message="Gathering comprehensive server diagnostics, telemetry & right-sizing data..." />;
  }

  const { server, assessment, vmRecommendation, dependencies, performanceMetrics, waveAssignment, sizingComparison } = detail;

  const getFactorScores = () => {
    if (assessment?.scoreBreakdown) {
      return [
        { name: 'CPU', score: Number(assessment.scoreBreakdown.cpuScore) || 0, fill: '#10B981', weight: '25%' },
        { name: 'RAM', score: Number(assessment.scoreBreakdown.ramScore) || 0, fill: '#06B6D4', weight: '20%' },
        { name: 'Storage', score: Number(assessment.scoreBreakdown.storageScore) || 0, fill: '#8B5CF6', weight: '10%' },
        { name: 'Network', score: Number(assessment.scoreBreakdown.networkScore) || 0, fill: '#14B8A6', weight: '10%' },
        { name: 'Compat', score: Number(assessment.scoreBreakdown.compatibilityScore) || 0, fill: '#F59E0B', weight: '15%' },
        { name: 'Deps', score: Number(assessment.scoreBreakdown.dependencyScore) || 0, fill: '#EC4899', weight: '10%' },
        { name: 'Crit', score: Number(assessment.scoreBreakdown.criticalityScore) || 0, fill: '#6366F1', weight: '10%' },
      ];
    }

    const peakCpu = Number(server.peakCpuUtilization) || 50;
    const cpuScore = peakCpu <= 40 ? 95 : peakCpu <= 65 ? 85 : peakCpu <= 80 ? 65 : peakCpu <= 90 ? 40 : 20;

    const peakRam = Number(server.peakRamUtilization) || 50;
    const ramScore = peakRam <= 50 ? 95 : peakRam <= 75 ? 85 : peakRam <= 88 ? 60 : 30;

    const avgStorage = Number(server.averageStorageUtilization) || 50;
    const storageScore = avgStorage <= 50 ? 90 : avgStorage <= 75 ? 80 : avgStorage <= 88 ? 55 : 35;

    const avgNetwork = Number(server.averageNetworkUtilization) || 30;
    const networkScore = avgNetwork <= 40 ? 90 : avgNetwork <= 70 ? 75 : 50;

    let compatScore = 95;
    if (server.hardwareDependency) compatScore = 10;
    else if (server.virtualizationCompatibility === false) compatScore = 15;
    else if (server.operatingSystem?.toLowerCase().includes('2003') || server.operatingSystem?.toLowerCase().includes('2008')) compatScore = 35;

    const depCount = dependencies?.length || 0;
    const depScore = depCount === 0 ? 100 : depCount <= 2 ? 85 : depCount <= 4 ? 65 : 45;

    const crit = server.businessCriticality;
    const critScore = crit === 'LOW' ? 95 : crit === 'MEDIUM' ? 80 : crit === 'HIGH' ? 60 : 35;

    return [
      { name: 'CPU', score: cpuScore, fill: '#10B981', weight: '25%' },
      { name: 'RAM', score: ramScore, fill: '#06B6D4', weight: '20%' },
      { name: 'Storage', score: storageScore, fill: '#8B5CF6', weight: '10%' },
      { name: 'Network', score: networkScore, fill: '#14B8A6', weight: '10%' },
      { name: 'Compat', score: compatScore, fill: '#F59E0B', weight: '15%' },
      { name: 'Deps', score: depScore, fill: '#EC4899', weight: '10%' },
      { name: 'Crit', score: critScore, fill: '#6366F1', weight: '10%' },
    ];
  };

  const scoreBreakdownData = getFactorScores();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Back button & Status badges */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/servers')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Server Inventory</span>
        </button>

        <div className="flex items-center space-x-2">
          <StatusBadge type="classification" value={server.classification} size="md" />
          <StatusBadge type="risk" value={server.riskLevel} size="md" />
          <StatusBadge type="priority" value={server.migrationPriority} size="md" />
        </div>
      </div>

      {/* Main Server Header Card */}
      <div className="nexus-card p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-[#0B0F19] dark:via-[#0E1526] dark:to-[#0B0F19] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-sm shrink-0">
            <ServerIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {server.serverName}
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                {server.ipAddress}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Hostname: <span className="font-semibold text-slate-700 dark:text-slate-200">{server.hostname}</span> • OS: {server.operatingSystem} {server.osVersion} • Status: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{server.currentStatus}</span>
            </p>
          </div>
        </div>

        {/* Assessment Score Badge & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {assessment ? (
            <div className="flex items-center space-x-4 p-3.5 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Migration Score</span>
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{assessment.migrationScore}/100</span>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Risk Score</span>
                <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">{assessment.riskScore}/100</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Assessment Pending</span>
            </div>
          )}

          {isAdmin && (
            <button
              onClick={handleRunSingleAssessment}
              disabled={assessing}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-950/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-slate-950 stroke-slate-950" />
              <span>{assessing ? 'Evaluating Node...' : assessment ? 'Re-run Assessment' : 'Run Assessment'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Specifications & Assessment Reason */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Physical Hardware Specs */}
        <div className="nexus-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-500" />
            <span>Hardware Specifications</span>
          </h3>
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400">CPU Architecture:</span>
              <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px] font-mono">{server.cpuModel}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400">CPU Cores:</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{server.cpuCores} Cores</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400">RAM Capacity:</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{server.totalRamGb} GB</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400">Storage Capacity:</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{server.totalStorageGb} GB ({server.storageType})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400">Network Interface:</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{server.networkBandwidthGbps} Gbps</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Host Age:</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{server.serverAgeYears} Years</span>
            </div>
          </div>
        </div>

        {/* Application & Workload Context */}
        <div className="nexus-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <AppWindow className="w-4 h-4 text-teal-500" />
            <span>Application Characteristics</span>
          </h3>
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400">Application Name:</span>
              <span className="font-bold text-slate-900 dark:text-white">{server.applicationName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400">Workload Type:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{server.applicationType}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400">Owner Team:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{server.applicationOwner}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400">Business Criticality:</span>
              <StatusBadge type="criticality" value={server.businessCriticality} size="sm" />
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400">Downtime Window:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{server.downtimeRequirement}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Hardware Dependency:</span>
              <span className={server.hardwareDependency ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
                {server.hardwareDependency ? 'Yes (Bare-Metal Lock)' : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Classification Rationale & Wave */}
        <div className="nexus-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span>Assessment Analysis & Rationale</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {assessment?.reason || 'Evaluation in progress or awaiting assessment trigger.'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Assigned Wave:</span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800 font-mono">
              {waveAssignment ? `Wave ${waveAssignment.waveNumber} - ${waveAssignment.waveName}` : 'Unassigned / Deferred'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Sizing Comparison Card: Current Physical vs Recommended VM */}
      {vmRecommendation && sizingComparison && (
        <div className="nexus-card p-6 sm:p-7 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-50 to-cyan-50/20 dark:from-slate-900 dark:to-cyan-950/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-500" />
                <span>VM Right-Sizing Analysis (Physical Source vs Target Virtual Machine)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target Google Cloud Machine Type: <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{vmRecommendation.recommendedVcpu <= 2 ? 'e2-standard-2' : vmRecommendation.recommendedVcpu <= 4 ? 'e2-standard-4' : vmRecommendation.recommendedVcpu <= 8 ? 'e2-standard-8' : `n2-standard-${vmRecommendation.recommendedVcpu}`}</span> with 20% safety margin buffer
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-mono">
              +{sizingComparison.cpuHeadroomSavingsPercent}% Core Savings
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            {/* vCPU */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Compute (Cores)</span>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <div>
                  <span className="text-xl font-black text-rose-500">{sizingComparison.physicalCores} Cores</span>
                  <span className="text-[10px] text-slate-400 block font-sans">Physical</span>
                </div>
                <span className="text-slate-400 font-bold">→</span>
                <div>
                  <span className="text-xl font-black text-emerald-500">{sizingComparison.recommendedVcpu} vCPU</span>
                  <span className="text-[10px] text-slate-400 block font-sans">Recommended</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-2 font-mono">
                Headroom savings: {sizingComparison.cpuHeadroomSavingsPercent}%
              </span>
            </div>

            {/* RAM */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Memory (RAM)</span>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <div>
                  <span className="text-xl font-black text-rose-500">{sizingComparison.physicalRamGb} GB</span>
                  <span className="text-[10px] text-slate-400 block font-sans">Physical</span>
                </div>
                <span className="text-slate-400 font-bold">→</span>
                <div>
                  <span className="text-xl font-black text-emerald-500">{sizingComparison.recommendedRamGb} GB</span>
                  <span className="text-[10px] text-slate-400 block font-sans">Recommended</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-2 font-mono">
                Headroom savings: {sizingComparison.ramHeadroomSavingsPercent}%
              </span>
            </div>

            {/* Storage */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Storage Capacity</span>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <div>
                  <span className="text-xl font-bold text-slate-500">{sizingComparison.physicalStorageGb} GB</span>
                  <span className="text-[10px] text-slate-400 block font-sans">Physical</span>
                </div>
                <span className="text-slate-400 font-bold">→</span>
                <div>
                  <span className="text-xl font-black text-emerald-500">{sizingComparison.recommendedStorageGb} GB</span>
                  <span className="text-[10px] text-slate-400 block font-sans">Virtual Disk</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-2">Thin-provisioned SAN</span>
            </div>

            {/* Post Mig Util */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Post-Mig Load</span>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. CPU Load:</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{sizingComparison.estimatedPostMigCpuUtil}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. RAM Load:</span>
                  <span className="font-bold font-mono text-cyan-600 dark:text-cyan-400">{sizingComparison.estimatedPostMigRamUtil}%</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1.5">Balanced target utilization</span>
            </div>
          </div>
        </div>
      )}

      {/* Row: Telemetry Timeseries & Scoring Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Telemetry Timeseries Chart */}
        <div className="nexus-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide">Historical Telemetry Timeseries</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">CPU & RAM load fluctuations over sampling window</p>
            </div>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} tickFormatter={(t) => t?.substring(11, 16) || ''} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(val: any) => [`${val}%`, '']}
                />
                <Area type="monotone" dataKey="cpuUtilization" name="CPU Util (%)" stroke="#06B6D4" fillOpacity={1} fill="url(#cpuGrad)" />
                <Area type="monotone" dataKey="ramUtilization" name="RAM Util (%)" stroke="#3B82F6" fillOpacity={1} fill="url(#ramGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scoring Factor Breakdown */}
        <div className="nexus-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide">Migration Sub-Score Factors</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">7-factor weighted suitability breakdown</p>
            </div>
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(val: any, _name: any, item: any) => [`${val} / 100 (${item.payload.weight} weight)`, 'Sub-Score']}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {scoreBreakdownData.map((entry, index) => (
                    <Cell key={`factor-bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dependencies Section */}
      <div className="nexus-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide mb-3 flex items-center gap-2">
          <GitFork className="w-4 h-4 text-cyan-500" />
          <span>Server Inter-Dependencies ({dependencies.length} Connected Workloads)</span>
        </h3>
        {dependencies.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">No inbound or outbound dependencies mapped for this host.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {dependencies.map((dep) => {
              const isSource = dep.sourceServerId === server.id;
              return (
                <div key={dep.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {isSource ? `Target: ${dep.targetServerName}` : `Source: ${dep.sourceServerName}`}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                      {dep.dependencyType}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{dep.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
