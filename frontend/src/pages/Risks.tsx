import React, { useState, useEffect } from 'react';
import { riskApi } from '../api/risks';
import { RiskMatrix, ServerRisk } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const Risks: React.FC = () => {
  const [matrix, setMatrix] = useState<RiskMatrix | null>(null);
  const [allRisks, setAllRisks] = useState<ServerRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mat, list] = await Promise.all([
        riskApi.getRiskMatrix(),
        riskApi.getAllRisks(),
      ]);
      setMatrix(mat);
      setAllRisks(list);
    } catch (err) {
      console.error('Failed to load risk analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !matrix) {
    return <LoadingSpinner message="Evaluating multi-tier risk index & factor vectors..." />;
  }

  const frequencyChartData = Object.entries(matrix.commonRiskFactorFrequency).map(([factor, count]) => ({
    factor: factor.length > 35 ? factor.substring(0, 35) + '...' : factor,
    fullFactor: factor,
    count,
  })).sort((a, b) => b.count - a.count);

  const filteredRisks = allRisks.filter((r) => {
    const matchesSearch =
      r.serverName.toLowerCase().includes(search.toLowerCase()) ||
      r.applicationName.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = !levelFilter || r.riskLevel === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span>Migration Risk Intelligence Matrix</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Evaluating downtime sensitivity, hardware lock-in, OS vintage, and multi-tier dependency topology
        </p>
      </div>

      {/* 4-Tier Risk Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="nexus-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Low Risk (0–30)</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-2 block">{matrix.lowRiskCount}</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Standard workloads suitable for automated Wave 1 pilot cutover</p>
        </div>

        <div className="nexus-card p-5 rounded-2xl border border-cyan-500/30 bg-cyan-50/40 dark:bg-cyan-950/20 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Medium Risk (31–60)</span>
            <AlertCircle className="w-5 h-5 text-cyan-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-2 block">{matrix.mediumRiskCount}</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Standard application tiers requiring scheduled maintenance window</p>
        </div>

        <div className="nexus-card p-5 rounded-2xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">High Risk (61–80)</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-2 block">{matrix.highRiskCount}</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Tier-1 databases or high peak loads needing staging rehearsals</p>
        </div>

        <div className="nexus-card p-5 rounded-2xl border border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Critical Risk (81–100)</span>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-2 block">{matrix.criticalRiskCount}</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">PCIe hardware lock, zero-downtime, or bare-metal retention</p>
        </div>
      </div>

      {/* Top Risk Factor Frequency Chart */}
      <div className="nexus-card p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide mb-1">
          Top Risk Factor Frequency Distribution
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-medium">
          Identified potential migration bottlenecks across physical server workloads
        </p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={frequencyChartData} layout="vertical" margin={{ top: 5, right: 30, left: 160, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis dataKey="factor" type="category" stroke="#94a3b8" fontSize={10} width={150} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '0.75rem', color: '#fff' }}
                formatter={(val: any, _name: any, item: any) => [`${val} Servers`, item.payload.fullFactor]}
              />
              <Bar dataKey="count" fill="#F59E0B" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="nexus-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search risk profile by server or application..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Risk Levels</option>
          <option value="LOW">Low Risk</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="HIGH">High Risk</option>
          <option value="CRITICAL">Critical Risk</option>
        </select>
      </div>

      {/* Server Risk Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRisks.map((risk) => (
          <div
            key={risk.serverId}
            className="nexus-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all space-y-3 cursor-pointer shadow-sm hover:shadow-xl group"
            onClick={() => navigate(`/servers/${risk.serverId}`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {risk.serverName}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{risk.applicationName} • {risk.operatingSystem}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">Score: {risk.riskScore}</span>
                <StatusBadge type="risk" value={risk.riskLevel} size="sm" />
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 leading-relaxed font-medium">
              {risk.riskReason}
            </p>

            {risk.mitigationRecommendations?.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block">
                  Recommended Mitigations:
                </span>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {risk.mitigationRecommendations.map((mit, i) => (
                    <li key={i} className="flex items-start space-x-1.5 text-[11px]">
                      <span className="text-cyan-500 mt-0.5">•</span>
                      <span>{mit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
