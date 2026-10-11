import React, { useState, useEffect } from 'react';
import { consolidationApi } from '../api/consolidation';
import { ConsolidationPlan, HostPlacement } from '../types';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import {
  Boxes,
  Server,
  Cpu,
  HardDrive,
  Zap,
  Leaf,
  Layers,
  ArrowRight,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const Consolidation: React.FC = () => {
  const [plan, setPlan] = useState<ConsolidationPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Custom Simulator states
  const [customVcpu, setCustomVcpu] = useState(64);
  const [customRam, setCustomRam] = useState(256);
  const [customStorage, setCustomStorage] = useState(4000);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const data = await consolidationApi.getLatestPlan();
      setPlan(data);
    } catch (err) {
      console.error('Failed to load consolidation plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCalculating(true);
      const res = await consolidationApi.calculateCustom({
        customHostVcpu: customVcpu,
        customHostRamGb: customRam,
        customHostStorageGb: customStorage,
      });
      setPlan(res);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setCalculating(false);
    }
  };

  if (loading || !plan) {
    return <LoadingSpinner message="Executing bin-packing algorithm across virtual hypervisor hosts..." />;
  }

  const { hardwareComparison, hostPlacements } = plan;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
            <Boxes className="w-5 h-5" />
          </div>
          <span>Virtualization Host Consolidation Simulator</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          First-Fit Decreasing (FFD) bin-packing allocating {plan.migratableServers} migratable workloads onto enterprise hypervisor hosts
        </p>
      </div>

      {/* Main KPI Ratio Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="nexus-card p-5 rounded-2xl border border-violet-500/30 bg-violet-50/40 dark:bg-violet-950/20 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Consolidation Ratio</span>
          <div className="mt-2 flex items-baseline justify-between font-mono">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.consolidationRatio} : 1</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-800 font-sans">
              Optimal Density
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Packing <span className="font-mono font-bold text-violet-600 dark:text-violet-400">{plan.migratableServers}</span> physical workloads onto <span className="font-mono font-bold text-violet-600 dark:text-violet-400">{plan.virtualizationHostsRequired}</span> virtual hosts
          </p>
        </div>

        <div className="nexus-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Hardware Host Reduction</span>
          <div className="mt-2 flex items-baseline justify-between font-mono">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.totalPhysicalServers} → {plan.virtualizationHostsRequired}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-sans">
              -{Math.round(((plan.totalPhysicalServers - plan.virtualizationHostsRequired) / plan.totalPhysicalServers) * 100)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{plan.totalPhysicalServers - plan.virtualizationHostsRequired}</span> physical servers retired or consolidated
          </p>
        </div>

        <div className="nexus-card p-5 rounded-2xl border border-teal-500/30 bg-teal-50/40 dark:bg-teal-950/20 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Power & Cooling Savings</span>
          <div className="mt-2 flex items-baseline justify-between font-mono">
            <span className="text-3xl font-black text-teal-600 dark:text-teal-400">~{hardwareComparison.estimatedPowerSavingsPercent}%</span>
            <Leaf className="w-5 h-5 text-teal-500" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Estimated annual datacenter kWh reduction</p>
        </div>

        <div className="nexus-card p-5 rounded-2xl border border-cyan-500/30 bg-cyan-50/40 dark:bg-cyan-950/20 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Rack Space Compression</span>
          <div className="mt-2 flex items-baseline justify-between font-mono">
            <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400">~{hardwareComparison.estimatedRackSpaceSavingsPercent}%</span>
            <Server className="w-5 h-5 text-cyan-500" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Rack unit footprint compression</p>
        </div>
      </div>

      {/* Simulator Tuning Bar */}
      <div className="nexus-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-500" />
              <span>Hypervisor Host Hardware Specs Simulator</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dynamically re-run bin-packing calculations based on custom host hardware configurations
            </p>
          </div>
        </div>

        <form onSubmit={handleSimulate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Host vCPU Capacity</label>
            <input
              type="number"
              min="16"
              max="256"
              value={customVcpu}
              onChange={(e) => setCustomVcpu(parseInt(e.target.value) || 64)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Host RAM Capacity (GB)</label>
            <input
              type="number"
              min="64"
              max="1024"
              value={customRam}
              onChange={(e) => setCustomRam(parseInt(e.target.value) || 256)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Host Storage Capacity (GB)</label>
            <input
              type="number"
              min="1000"
              max="20000"
              value={customStorage}
              onChange={(e) => setCustomStorage(parseInt(e.target.value) || 4000)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={calculating}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-cyan-950/20 active:scale-95 disabled:opacity-50"
          >
            {calculating ? 'Simulating...' : 'Recalculate Bin-Packing'}
          </button>
        </form>
      </div>

      {/* Bin-Packing Visual Host Allocation Cards */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-500" />
          <span>Hypervisor Host Allocation Breakdown ({hostPlacements.length} Hosts Required)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {hostPlacements.map((host) => (
            <div key={host.hostIndex} className="nexus-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{host.hostName}</span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  {host.hostedServerNames.length} VMs Placed
                </span>
              </div>

              {/* CPU utilization bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400 font-sans">vCPU Allocation:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {host.allocatedVcpu} / {host.hostVcpuCapacity} ({host.cpuUtilizationPercentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${Math.min(100, host.cpuUtilizationPercentage)}%` }}
                  />
                </div>
              </div>

              {/* RAM utilization bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400 font-sans">RAM Allocation:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                    {host.allocatedRamGb} / {host.hostRamCapacityGb} GB ({host.ramUtilizationPercentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full"
                    style={{ width: `${Math.min(100, host.ramUtilizationPercentage)}%` }}
                  />
                </div>
              </div>

              {/* Hosted VMs pills */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 font-sans">
                  Assigned Workload Nodes:
                </span>
                <div className="flex flex-wrap gap-1">
                  {host.hostedServerNames.map((vm, i) => (
                    <span key={i} className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                      {vm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before vs After Hardware Comparison Table */}
      <div className="nexus-card p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide mb-4">
          Hardware Comparison: Existing Physical Infrastructure vs Target Virtualized Cloud
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Metric</th>
                <th className="py-3 px-4 text-rose-500">Physical (Before)</th>
                <th className="py-3 px-4 text-emerald-500">Target Virtual (After)</th>
                <th className="py-3 px-4 text-right">Net Savings / Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Total Host Servers</td>
                <td className="py-3 px-4 font-mono">{hardwareComparison.beforePhysicalHostCount} Dedicated Physical Servers</td>
                <td className="py-3 px-4 font-mono">{hardwareComparison.afterVirtualHostCount} Enterprise Hypervisors</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {hardwareComparison.beforePhysicalHostCount - hardwareComparison.afterVirtualHostCount} Fewer Physical Hosts
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Total Compute Capacity</td>
                <td className="py-3 px-4 font-mono">{hardwareComparison.beforeTotalCores} Physical Cores</td>
                <td className="py-3 px-4 font-mono">{hardwareComparison.afterTotalVcpu} Right-Sized vCPUs</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  +{Math.round(((hardwareComparison.beforeTotalCores - hardwareComparison.afterTotalVcpu) / hardwareComparison.beforeTotalCores) * 100)}% CPU Efficiency
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Total Memory Capacity</td>
                <td className="py-3 px-4 font-mono">{hardwareComparison.beforeTotalRamGb} GB Physical RAM</td>
                <td className="py-3 px-4 font-mono">{hardwareComparison.afterTotalRamGb} GB Target VM RAM</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  +{Math.round(((hardwareComparison.beforeTotalRamGb - hardwareComparison.afterTotalRamGb) / hardwareComparison.beforeTotalRamGb) * 100)}% Memory Efficiency
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Estimated Power & Cooling</td>
                <td className="py-3 px-4 font-mono">100% Baseline</td>
                <td className="py-3 px-4 font-mono">~{100 - hardwareComparison.estimatedPowerSavingsPercent}% Consumption</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  ~{hardwareComparison.estimatedPowerSavingsPercent}% Power Saved
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Rack Units (42U Racks)</td>
                <td className="py-3 px-4 font-mono">~40U (Full Rack)</td>
                <td className="py-3 px-4 font-mono">~{hardwareComparison.afterVirtualHostCount * 2}U (2U Per Host)</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  ~{hardwareComparison.estimatedRackSpaceSavingsPercent}% Rack Space Saved
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
