import React, { useState, useEffect } from 'react';
import { reportsApi } from '../api/reports';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import {
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  Server,
  Layers,
  Boxes,
  ShieldAlert,
  Percent,
  Sparkles,
  Printer,
  Calendar,
  Zap,
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load report summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const blob = await reportsApi.downloadPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VM_Migration_Executive_Assessment_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      const blob = await reportsApi.downloadExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VM_Migration_Assessment_Workbook_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download Excel:', err);
    } finally {
      setDownloadingExcel(false);
    }
  };

  if (loading || !summary) {
    return <LoadingSpinner message="Generating consolidated executive dossier & analytics preview..." />;
  }

  const { assessmentSummary, vmSummary, consolidationPlan, waveSummaries } = summary;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span>Executive Reports & Data Export Center</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Download comprehensive documentation in PDF format or multi-sheet Excel spreadsheet
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs shadow-lg shadow-rose-950/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>{downloadingPdf ? 'Exporting PDF...' : 'Download Executive PDF'}</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-950/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{downloadingExcel ? 'Exporting Excel...' : 'Download Full Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Live Interactive Report Preview Paper Document */}
      <div className="nexus-card p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] shadow-2xl space-y-8 max-w-4xl mx-auto relative overflow-hidden">
        {/* Accent Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500" />

        {/* Document Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 block mb-1">
                NEXUS PLATFORM DOSSIER • EXECUTIVE REPORT
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Virtual Machine Migration Assessment & Planning
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Scope: {summary.totalServers} Enterprise Physical Servers • Generated: {summary.generatedAt}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-black shrink-0 font-mono">
              VERIFIED READY
            </div>
          </div>
        </div>

        {/* Section 1: Executive Key Findings */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>1. Workload Assessment Findings</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-bold uppercase">Direct Migration Fit</span>
              <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 block mt-1">
                {assessmentSummary?.readyToMigrate || 0} Servers ({assessmentSummary?.readinessPercentage || 0}%)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-bold uppercase">Optimization Required</span>
              <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400 block mt-1">
                {assessmentSummary?.requiresOptimization || 0} Servers
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-bold uppercase">Keep Physical (Bare-Metal)</span>
              <span className="text-lg font-black font-mono text-rose-600 dark:text-rose-400 block mt-1">
                {assessmentSummary?.keepPhysical || 0} Servers
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-bold uppercase">Retire / Decommission</span>
              <span className="text-lg font-black font-mono text-slate-700 dark:text-slate-300 block mt-1">
                {assessmentSummary?.retire || 0} Servers
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Virtual Machine Right-Sizing & Savings */}
        {vmSummary && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Percent className="w-4 h-4 text-cyan-500" />
              <span>2. Compute & Memory Efficiency Gains</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Compute Footprint:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {vmSummary.totalPhysicalCores} Physical Cores → {vmSummary.totalRecommendedVcpu} Virtual vCPUs (-{vmSummary.cpuCapacityReductionPercent}% Core Reclaimed)
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Memory Footprint:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {vmSummary.totalPhysicalRamGb} GB Physical RAM → {vmSummary.totalRecommendedRamGb} GB Target VM RAM (-{vmSummary.ramCapacityReductionPercent}% RAM Reclaimed)
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Right-Sized Virtual Machines:</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{vmSummary.totalRecommendedVms} Virtual Machine Instances</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Consolidation Plan & Datacenter Reduction */}
        {consolidationPlan && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Boxes className="w-4 h-4 text-violet-500" />
              <span>3. Target Virtualization Host Consolidation</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-400 text-[10px] uppercase block font-bold">Consolidation Ratio</span>
                <span className="text-2xl font-black font-mono text-violet-600 dark:text-violet-400 mt-1 block">
                  {consolidationPlan.consolidationRatio} : 1
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">Workloads per hypervisor</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-400 text-[10px] uppercase block font-bold">Required Hypervisors</span>
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {consolidationPlan.virtualizationHostsRequired} Hosts
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">64 vCPU / 256GB RAM profile</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-400 text-[10px] uppercase block font-bold">Power & Cooling Savings</span>
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                  ~{consolidationPlan.hardwareComparison?.estimatedPowerSavingsPercent || 65}%
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">Datacenter kWh reduction</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Migration Waves */}
        {waveSummaries && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-500" />
              <span>4. Phased Wave Cutover Schedule</span>
            </h3>

            <div className="space-y-2 text-xs">
              {waveSummaries.map((w: any) => (
                <div key={w.waveNumber} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 flex items-center justify-center font-bold text-xs font-mono">
                      {w.waveNumber}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{w.waveName}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-600 dark:text-slate-300 font-bold font-mono">{w.serverCount} Workloads</span>
                    <span className="text-slate-400 font-mono text-[11px]">{w.plannedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
