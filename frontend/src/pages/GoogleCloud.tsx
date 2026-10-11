import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Square,
  Trash2,
  RefreshCw,
  Server,
  Cpu,
  HardDrive,
  ShieldAlert,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  DollarSign,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { serversApi } from '../api/servers';
import { Server as ServerType } from '../types';
import { cloudApi } from '../api/cloud';
import {
  CloudHealth,
  MachineTypeOption,
  ProvisioningPreviewResponse,
  ProvisioningRequest,
  CloudVm,
  CloudOperation,
} from '../types/cloud';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';

export const GoogleCloud: React.FC = () => {
  const { isAdmin } = useAuth();
  const [servers, setServers] = useState<ServerType[]>([]);

  // State
  const [activeTab, setActiveTab] = useState<'provision' | 'requests' | 'vms' | 'operations'>('provision');
  const [health, setHealth] = useState<CloudHealth | null>(null);
  const [zones, setZones] = useState<string[]>([]);
  const [machineTypes, setMachineTypes] = useState<MachineTypeOption[]>([]);
  const [requests, setRequests] = useState<ProvisioningRequest[]>([]);
  const [cloudVms, setCloudVms] = useState<CloudVm[]>([]);
  const [operations, setOperations] = useState<CloudOperation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [selectedServerId, setSelectedServerId] = useState<number>(1);
  const [selectedZone, setSelectedZone] = useState<string>('us-central1-a');
  const [selectedMachineType, setSelectedMachineType] = useState<string>('e2-small');
  const [diskSizeGb, setDiskSizeGb] = useState<number>(50);

  // Preview State
  const [preview, setPreview] = useState<ProvisioningPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  // Polling helper
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [healthData, zonesData, mTypesData, reqsData, vmsData, opsData, serversData] = await Promise.all([
        cloudApi.checkHealth().catch(() => null),
        cloudApi.getZones().catch(() => ['us-central1-a', 'us-central1-b', 'asia-south1-a']),
        cloudApi.getMachineTypes().catch(() => []),
        cloudApi.listProvisioningRequests().catch(() => []),
        cloudApi.listVms().catch(() => []),
        cloudApi.listOperations().catch(() => []),
        serversApi.getServers({ size: 100 }).catch(() => ({ content: [] })),
      ]);

      if (healthData) setHealth(healthData);
      if (zonesData.length > 0) setZones(zonesData);
      if (mTypesData.length > 0) setMachineTypes(mTypesData);
      setRequests(reqsData);
      setCloudVms(vmsData);
      setOperations(opsData);
      if (serversData && serversData.content && serversData.content.length > 0) {
        setServers(serversData.content);
        setSelectedServerId((prev) => prev || serversData.content[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load Google Cloud data.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFetchPreview = async () => {
    if (!selectedServerId) return;
    setPreviewLoading(true);
    setError(null);
    try {
      const p = await cloudApi.generatePreview({
        serverId: selectedServerId,
        preferredZone: selectedZone,
        overrideMachineType: selectedMachineType,
        bootDiskSizeGb: diskSizeGb,
      });
      setPreview(p);
      if (p.recommendedMachineType) {
        setSelectedMachineType(p.recommendedMachineType);
      }
      if (p.recommendedDiskGb) {
        setDiskSizeGb(p.recommendedDiskGb);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to generate preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!preview) return;
    setActionLoading(true);
    setError(null);
    try {
      await cloudApi.createProvisioningRequest({
        serverId: preview.serverId,
        zone: selectedZone,
        machineType: selectedMachineType,
        bootDiskSizeGb: diskSizeGb,
      });
      setSuccessMsg(`Provisioning request created successfully for ${preview.serverName}! It is now awaiting Administrator review.`);
      setActiveTab('requests');
      loadData(true);
      setPreview(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: number, approve: boolean) => {
    setActionLoading(true);
    setError(null);
    try {
      await cloudApi.approveProvisioningRequest(id, {
        approved: approve,
        comment: approve ? 'Approved for pilot test in Free Trial environment.' : 'Rejected by administrator.',
      });
      setSuccessMsg(approve ? 'Request approved!' : 'Request rejected.');
      loadData(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecute = async (id: number) => {
    setActionLoading(true);
    setError(null);
    try {
      await cloudApi.executeProvisioningRequest(id);
      setSuccessMsg('Provisioning submitted to Google Cloud Compute Engine! Tracking asynchronous operation.');
      setActiveTab('vms');
      loadData(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Execution failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartVm = async (id: number) => {
    setActionLoading(true);
    try {
      await cloudApi.startVm(id);
      setSuccessMsg('Start command dispatched to Compute Engine.');
      loadData(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Start failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopVm = async (id: number) => {
    setActionLoading(true);
    try {
      await cloudApi.stopVm(id);
      setSuccessMsg('Stop command dispatched to Compute Engine.');
      loadData(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Stop failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncVm = async (id: number) => {
    setActionLoading(true);
    try {
      await cloudApi.syncVm(id);
      setSuccessMsg('VM state synchronized with Google Cloud.');
      loadData(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Sync failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVm = async (id: number) => {
    if (!window.confirm('Are you sure you want to terminate this test VM? This deletes the Compute Engine instance.')) {
      return;
    }
    setActionLoading(true);
    try {
      await cloudApi.deleteVm(id);
      setSuccessMsg('Termination command dispatched to Compute Engine.');
      loadData(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedServer = servers.find((s) => s.id === selectedServerId);

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <LoadingSpinner message="Connecting to Google Cloud Compute Engine..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Connection & Free Trial Controls */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-cyan-500/30 p-6 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25 flex items-center justify-center">
              <Cloud className="w-8 h-8 stroke-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white tracking-wide">
                  Google Cloud Compute Engine Integration
                </h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  health?.connected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${health?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  {health?.connected ? 'GCP Connected' : 'Disconnected'}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Connected to Project:{' '}
                <span className="font-mono text-cyan-300 font-semibold">{health?.projectId || 'project-7a8d1679-ad3e-46db-bb2'}</span>
                {' • '}Zone: <span className="text-slate-300 font-mono">{health?.defaultZone || 'us-central1-a'}</span>
                {' • '}Active Managed VMs: <span className="text-emerald-400 font-bold">{cloudVms.filter(v => v.status === 'RUNNING').length}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Free Trial Balance</div>
              <div className="text-sm font-extrabold text-emerald-400">₹28,797 Active Credits</div>
            </div>
            <button
              onClick={() => loadData()}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold text-sm flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
              Verify State
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold">Error Encountered</div>
            <div>{error}</div>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold">Success</div>
            <div>{successMsg}</div>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('provision')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
            activeTab === 'provision'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          1. Provisioning Preview & Request
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          2. Approval Queue ({requests.filter(r => r.status === 'PENDING_APPROVAL').length})
        </button>
        <button
          onClick={() => setActiveTab('vms')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
            activeTab === 'vms'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Server className="w-4 h-4" />
          3. Managed Cloud VMs ({cloudVms.length})
        </button>
        <button
          onClick={() => setActiveTab('operations')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
            activeTab === 'operations'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4" />
          4. Operations Log ({operations.length})
        </button>
      </div>

      {/* TAB 1: PROVISIONING PREVIEW & REQUEST */}
      {activeTab === 'provision' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Selector */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                Select Source Server for Cloud Pilot
              </h2>
              <p className="text-xs text-slate-400">
                Choose one of the 40 assessed physical servers. The engine will retrieve its assessment score, right-sized machine tier, and verify safety eligibility.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Source Server
                  </label>
                  <select
                    value={selectedServerId}
                    onChange={(e) => {
                      setSelectedServerId(Number(e.target.value));
                      setPreview(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {servers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.serverName} ({s.operatingSystem}) - {s.cpuCores} cores, {s.totalRamGb} GB RAM
                      </option>
                    ))}
                  </select>
                </div>

                {selectedServer && (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Application:</span>
                      <span className="font-semibold text-white">{selectedServer.applicationName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Business Criticality:</span>
                      <span className="font-semibold text-white">{selectedServer.businessCriticality}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Hardware Dependency:</span>
                      <span className={selectedServer.hardwareDependency ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {selectedServer.hardwareDependency ? 'Yes (PCIe Lock)' : 'None (Cloud Ready)'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Target Zone
                    </label>
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      {zones.map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      GCP Machine Type
                    </label>
                    <select
                      value={selectedMachineType}
                      onChange={(e) => setSelectedMachineType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      {machineTypes.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name} ({m.vcpu} vCPU, {m.memoryGb} GB RAM) - ₹{m.estimatedMonthlyCostInr}/mo
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Boot Disk Capacity (GB)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={200}
                    value={diskSizeGb}
                    onChange={(e) => setDiskSizeGb(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Capped at 200 GB for Free Trial safety. Standard pd-standard ($0.04/GB/mo).
                  </span>
                </div>

                <button
                  onClick={handleFetchPreview}
                  disabled={previewLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2"
                >
                  {previewLoading ? <LoadingSpinner size="sm" /> : <Sparkles className="w-4 h-4" />}
                  Generate Pre-Flight Preview
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Pre-Flight Preview Card */}
          <div className="lg:col-span-7">
            {preview ? (
              <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-xl font-black text-white">{preview.serverName} Preview</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        preview.eligibleForProvisioning
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {preview.eligibleForProvisioning ? 'Eligible for Cloud Provisioning' : 'Blocked from Provisioning'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Algorithmic Readiness Score: <span className="text-cyan-300 font-bold">{preview.migrationScore}/100</span>
                      {' • '}Classification: <span className="font-semibold text-white">{preview.classification}</span>
                      {' • '}Risk Tier: <span className="font-semibold text-amber-300">{preview.riskLevel}</span>
                    </p>
                  </div>
                </div>

                {/* Warnings / Blocking notices */}
                {preview.warnings.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Assessment & Guardrail Notices
                    </div>
                    {preview.warnings.map((w, idx) => (
                      <div key={idx} className="pl-5 list-disc">• {w}</div>
                    ))}
                  </div>
                )}

                {/* Comparison Matrix */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Physical Source Server</div>
                    <div className="text-sm font-semibold text-white">{preview.sourceCores} Physical Cores</div>
                    <div className="text-sm font-semibold text-white">{preview.sourceRamGb} GB RAM</div>
                    <div className="text-sm font-semibold text-white">{preview.sourceStorageGb} GB Storage</div>
                    <div className="text-xs text-slate-400">{preview.sourceOs}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-2">
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Target Google Cloud VM</div>
                    <div className="text-sm font-bold text-white">{preview.recommendedMachineType} ({preview.recommendedVcpu} vCPU)</div>
                    <div className="text-sm font-bold text-white">{preview.recommendedRamGb} GB RAM</div>
                    <div className="text-sm font-bold text-white">{preview.recommendedDiskGb} GB {preview.recommendedDiskType}</div>
                    <div className="text-xs text-cyan-300">{preview.zone} • {preview.network}</div>
                  </div>
                </div>

                {/* Transparent Cost Estimation */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Monthly Cost</span>
                    <span className="text-lg font-black text-emerald-400">
                      ₹{preview.estimatedMonthlyCostInr}{' '}
                      <span className="text-xs text-slate-400 font-normal">(${preview.estimatedMonthlyCostUsd} USD)</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {preview.costAssumptions}
                  </p>
                  <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 text-indigo-400 mt-0.5" />
                    <div>{preview.trialCreditsNotice}</div>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setPreview(null)}
                    className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRequest}
                    disabled={!preview.eligibleForProvisioning || actionLoading}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition flex items-center gap-2"
                  >
                    {actionLoading ? <LoadingSpinner size="sm" /> : <ChevronRight className="w-4 h-4" />}
                    Submit for Admin Approval
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[350px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center bg-slate-900/30">
                <Sparkles className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="text-base font-bold text-slate-300">Ready for Cloud Pre-Flight Simulation</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Select a server from the left panel and click &quot;Generate Pre-Flight Preview&quot; to review right-sized specs, machine types, and non-billable estimates.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPROVAL QUEUE */}
      {activeTab === 'requests' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">Administrator Provisioning Approval Queue</h2>
              <p className="text-xs text-slate-400">
                To guarantee zero accidental provisioning, every cloud VM must be explicitly reviewed and approved by an Administrator before creation.
              </p>
            </div>
            <button onClick={() => loadData(true)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No provisioning requests in queue. Generate a preview in Tab 1 to submit a request.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Request ID</th>
                    <th className="py-3 px-3">Source Server</th>
                    <th className="py-3 px-3">Instance Name</th>
                    <th className="py-3 px-3">Machine Type</th>
                    <th className="py-3 px-3">Zone</th>
                    <th className="py-3 px-3">Disk</th>
                    <th className="py-3 px-3">Est. Cost</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3 font-mono text-cyan-400">REQ-{r.id}</td>
                      <td className="py-3 px-3 font-bold text-white">{r.sourceServerName}</td>
                      <td className="py-3 px-3 font-mono text-slate-300">{r.instanceName}</td>
                      <td className="py-3 px-3 font-semibold">{r.machineType}</td>
                      <td className="py-3 px-3">{r.zone}</td>
                      <td className="py-3 px-3">{r.bootDiskSizeGb} GB</td>
                      <td className="py-3 px-3 font-semibold text-emerald-400">₹{r.estimatedMonthlyCost}/mo</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          r.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                          r.status === 'APPROVED' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-extrabold' :
                          r.status === 'CREATING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 animate-pulse' :
                          r.status === 'REJECTED' || r.status === 'FAILED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === 'PENDING_APPROVAL' && isAdmin && (
                            <>
                              <button
                                onClick={() => handleApprove(r.id, true)}
                                disabled={actionLoading}
                                title="Approve Request"
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleApprove(r.id, false)}
                                disabled={actionLoading}
                                title="Reject Request"
                                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition flex items-center gap-1.5"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                          {r.status === 'APPROVED' && isAdmin && (
                            <button
                              onClick={() => handleExecute(r.id)}
                              disabled={actionLoading}
                              title="Provision VM on Google Cloud Compute Engine"
                              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/30 transition flex items-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5 fill-slate-950" />
                              Create VM on GCP
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANAGED CLOUD VMS */}
      {activeTab === 'vms' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">Application-Managed Google Cloud Instances</h2>
              <p className="text-xs text-slate-400">
                Live instances running inside project <span className="font-mono text-cyan-300">{health?.projectId}</span>. Use safe controls to start, stop, or terminate test resources.
              </p>
            </div>
            <button onClick={() => loadData(true)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {cloudVms.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No cloud virtual machines provisioned yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Instance Name</th>
                    <th className="py-3 px-3">Source Server</th>
                    <th className="py-3 px-3">Zone</th>
                    <th className="py-3 px-3">Machine Type</th>
                    <th className="py-3 px-3">IP Addresses</th>
                    <th className="py-3 px-3">Est. Cost</th>
                    <th className="py-3 px-3">Cloud Status</th>
                    <th className="py-3 px-3 text-right">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {cloudVms.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3 font-mono font-bold text-cyan-300">{v.instanceName}</td>
                      <td className="py-3 px-3">{v.sourceServerName || 'N/A'}</td>
                      <td className="py-3 px-3">{v.zone}</td>
                      <td className="py-3 px-3 font-semibold">{v.machineType}</td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div>Int: {v.internalIp || 'Assigning...'}</div>
                        {v.externalIp && <div className="text-slate-400">Ext: {v.externalIp}</div>}
                      </td>
                      <td className="py-3 px-3 font-semibold text-emerald-400">₹{v.estimatedMonthlyCost}/mo</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          v.status === 'RUNNING' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          v.status === 'STOPPED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                          v.status === 'PROVISIONING' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleSyncVm(v.id)}
                          title="Sync Status from GCP"
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition inline-flex"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        {v.status === 'STOPPED' && isAdmin && (
                          <button
                            onClick={() => handleStartVm(v.id)}
                            title="Start VM"
                            className="p-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition inline-flex"
                          >
                            <Play className="w-3.5 h-3.5 fill-emerald-300" />
                          </button>
                        )}
                        {v.status === 'RUNNING' && isAdmin && (
                          <button
                            onClick={() => handleStopVm(v.id)}
                            title="Stop VM (pauses compute charges)"
                            className="p-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition inline-flex"
                          >
                            <Square className="w-3.5 h-3.5 fill-amber-300" />
                          </button>
                        )}
                        {v.status !== 'TERMINATED' && isAdmin && (
                          <button
                            onClick={() => handleDeleteVm(v.id)}
                            title="Terminate & Clean Up Resource"
                            className="p-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: OPERATIONS LOG */}
      {activeTab === 'operations' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">Compute Engine Asynchronous Operations Log</h2>
              <p className="text-xs text-slate-400">
                Audit trail of instance creations, starts, stops, and cleanup operations verified against Google Cloud ZoneOperations.
              </p>
            </div>
            <button onClick={() => loadData(true)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {operations.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No cloud operations recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Operation ID</th>
                    <th className="py-3 px-3">Action Type</th>
                    <th className="py-3 px-3">Target Resource</th>
                    <th className="py-3 px-3">Zone</th>
                    <th className="py-3 px-3">Initiated By</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {operations.map((op) => (
                    <tr key={op.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3 font-mono text-cyan-400 max-w-[200px] truncate">{op.operationId}</td>
                      <td className="py-3 px-3 font-bold text-white">{op.operationType}</td>
                      <td className="py-3 px-3 font-mono">{op.targetResource}</td>
                      <td className="py-3 px-3">{op.zone}</td>
                      <td className="py-3 px-3">{op.initiatedBy || 'admin'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          op.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          op.status === 'RUNNING' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {op.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{new Date(op.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
