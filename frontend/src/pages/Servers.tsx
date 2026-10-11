import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serversApi } from '../api/servers';
import { Server, ServerCreateRequest, BusinessCriticality, DowntimeRequirement } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';
import { Modal } from '../components/Common/Modal';
import { ConfirmDialog } from '../components/Common/ConfirmDialog';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { EmptyState } from '../components/Common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import {
  Server as ServerIcon,
  Search,
  Plus,
  Upload,
  Download,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Cpu,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from 'lucide-react';

export const Servers: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('');
  const [osFilter, setOsFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [operatingSystems, setOperatingSystems] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 15;
  const { refreshServerCount } = useInventory();

  // Modals & Toast
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'telemetry' | 'app'>('basic');

  const defaultFormData: ServerCreateRequest = {
    serverName: '',
    hostname: '',
    ipAddress: '',
    operatingSystem: 'Ubuntu Linux',
    osVersion: '22.04 LTS',
    cpuModel: 'Intel Xeon Gold 5218',
    cpuCores: 8,
    totalRamGb: 32,
    totalStorageGb: 500,
    storageType: 'SSD',
    networkBandwidthGbps: 1.0,
    averageCpuUtilization: 25.0,
    peakCpuUtilization: 45.0,
    averageRamUtilization: 40.0,
    peakRamUtilization: 60.0,
    averageStorageUtilization: 50.0,
    averageNetworkUtilization: 15.0,
    applicationName: '',
    applicationType: 'WEB',
    applicationOwner: 'IT Operations',
    businessCriticality: 'MEDIUM',
    downtimeRequirement: 'FLEXIBLE',
    hardwareDependency: false,
    virtualizationCompatibility: true,
    serverAgeYears: 3.0,
  };

  const [formData, setFormData] = useState<ServerCreateRequest>(defaultFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [importLoading, setImportLoading] = useState(false);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchServers();
  }, [search, criticalityFilter, osFilter, statusFilter, currentPage]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const fetchMetadata = async () => {
    try {
      const osList = await serversApi.getOperatingSystems();
      setOperatingSystems(osList);
    } catch (err) {
      console.error('Failed to fetch OS metadata:', err);
    }
  };

  const fetchServers = async () => {
    try {
      setLoading(true);
      const res = await serversApi.getServers({
        search: search || undefined,
        criticality: criticalityFilter || undefined,
        os: osFilter || undefined,
        status: statusFilter || undefined,
        page: currentPage,
        size: pageSize,
        sortBy: 'id',
        sortDir: 'asc',
      });
      setServers(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
      refreshServerCount();
    } catch (err) {
      console.error('Failed to fetch servers:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.serverName.trim()) {
      setFormError('Server Name is required.');
      return false;
    }
    if (!formData.hostname.trim()) {
      setFormError('Hostname is required.');
      return false;
    }
    if (!formData.ipAddress.trim()) {
      setFormError('IP Address is required.');
      return false;
    }
    if (formData.cpuCores < 1) {
      setFormError('CPU Cores must be at least 1.');
      return false;
    }
    if (formData.totalRamGb < 1) {
      setFormError('RAM must be at least 1 GB.');
      return false;
    }
    if (formData.totalStorageGb < 1) {
      setFormError('Storage must be at least 1 GB.');
      return false;
    }
    if (formData.peakCpuUtilization < 0 || formData.peakCpuUtilization > 100) {
      setFormError('Peak CPU Utilization must be between 0% and 100%.');
      return false;
    }
    if (formData.averageCpuUtilization < 0 || formData.averageCpuUtilization > 100) {
      setFormError('Average CPU Utilization must be between 0% and 100%.');
      return false;
    }
    if (formData.peakRamUtilization < 0 || formData.peakRamUtilization > 100) {
      setFormError('Peak RAM Utilization must be between 0% and 100%.');
      return false;
    }
    if (formData.averageRamUtilization < 0 || formData.averageRamUtilization > 100) {
      setFormError('Average RAM Utilization must be between 0% and 100%.');
      return false;
    }
    if (!formData.applicationName.trim()) {
      setFormError('Primary Application Name is required.');
      return false;
    }
    if (!formData.applicationOwner.trim()) {
      setFormError('Application Owner is required.');
      return false;
    }
    return true;
  };

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormLoading(true);
    setFormError(null);
    try {
      await serversApi.createServer(formData);
      setIsAddModalOpen(false);
      setFormData(defaultFormData);
      showToast('Server added successfully.', 'success');
      fetchServers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create server.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServer) return;
    if (!validateForm()) return;
    setFormLoading(true);
    setFormError(null);
    try {
      await serversApi.updateServer(selectedServer.id, formData);
      setIsEditModalOpen(false);
      showToast('Server updated successfully.', 'success');
      fetchServers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update server.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteServer = async () => {
    if (!selectedServer) return;
    setFormLoading(true);
    try {
      await serversApi.deleteServer(selectedServer.id);
      setIsDeleteModalOpen(false);
      showToast(`Server ${selectedServer.serverName} deleted successfully.`, 'success');
      fetchServers();
    } catch (err: any) {
      console.error('Failed to delete server:', err);
      showToast(err.response?.data?.message || 'Failed to delete server.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    setImportLoading(true);
    try {
      const result = await serversApi.importCsv(importFile);
      setImportResult(result);
      showToast(`Import completed: ${result.successfulImports} servers added.`, 'success');
      fetchServers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to import CSV.');
    } finally {
      setImportLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData(defaultFormData);
    setActiveFormTab('basic');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (server: Server) => {
    setSelectedServer(server);
    setFormData({
      serverName: server.serverName,
      hostname: server.hostname,
      ipAddress: server.ipAddress,
      operatingSystem: server.operatingSystem,
      osVersion: server.osVersion,
      cpuModel: server.cpuModel,
      cpuCores: server.cpuCores,
      totalRamGb: server.totalRamGb,
      totalStorageGb: server.totalStorageGb,
      storageType: server.storageType,
      networkBandwidthGbps: server.networkBandwidthGbps,
      averageCpuUtilization: server.averageCpuUtilization,
      peakCpuUtilization: server.peakCpuUtilization,
      averageRamUtilization: server.averageRamUtilization,
      peakRamUtilization: server.peakRamUtilization,
      averageStorageUtilization: server.averageStorageUtilization,
      averageNetworkUtilization: server.averageNetworkUtilization,
      applicationName: server.applicationName,
      applicationType: server.applicationType,
      applicationOwner: server.applicationOwner,
      businessCriticality: server.businessCriticality,
      downtimeRequirement: server.downtimeRequirement,
      hardwareDependency: server.hardwareDependency,
      virtualizationCompatibility: server.virtualizationCompatibility,
      serverAgeYears: server.serverAgeYears,
    });
    setActiveFormTab('basic');
    setFormError(null);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-2xl transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="font-semibold text-xs tracking-wide">{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <ServerIcon className="w-5 h-5" />
            </div>
            <span>Physical Server Inventory</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-mono font-bold">
              {totalElements} Nodes
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Discovering and evaluating {totalElements} enterprise host machines across web, app, database, and infrastructure tiers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={serversApi.exportCsvUrl()}
            download
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
            <span>Export CSV</span>
          </a>

          {isAdmin && (
            <>
              <button
                onClick={() => { setImportResult(null); setFormError(null); setIsImportModalOpen(true); }}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={openAddModal}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-950/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Add Server</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="nexus-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
            placeholder="Search hostname, IP, OS, application..."
            className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={criticalityFilter}
            onChange={(e) => { setCriticalityFilter(e.target.value); setCurrentPage(0); }}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Criticalities</option>
            <option value="LOW">Low Criticality</option>
            <option value="MEDIUM">Medium Criticality</option>
            <option value="HIGH">High Criticality</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={osFilter}
            onChange={(e) => { setOsFilter(e.target.value); setCurrentPage(0); }}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Operating Systems</option>
            {operatingSystems.map((os) => (
              <option key={os} value={os}>{os}</option>
            ))}
          </select>

          {(search || criticalityFilter || osFilter || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setCriticalityFilter(''); setOsFilter(''); setStatusFilter(''); setCurrentPage(0); }}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-bold px-2 py-1 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="nexus-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner message="Querying live host telemetry & configuration inventory..." />

        ) : servers.length === 0 ? (
          <EmptyState
            title="No servers match your criteria"
            description="Clear or adjust your search filter or click '+ Add Server' to create one."
            onAction={() => { setSearch(''); setCriticalityFilter(''); setOsFilter(''); }}
            actionLabel="Reset Filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Server</th>
                  <th className="py-3.5 px-4">IP & Hostname</th>
                  <th className="py-3.5 px-4">OS Vintage</th>
                  <th className="py-3.5 px-4 text-center">Physical Specs</th>
                  <th className="py-3.5 px-4 text-center">Peak Load</th>
                  <th className="py-3.5 px-4">Application</th>
                  <th className="py-3.5 px-4">Classification</th>
                  <th className="py-3.5 px-4">Risk</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                {servers.map((server) => (
                  <tr
                    key={server.id}
                    className="hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/servers/${server.id}`)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {server.serverName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        Age: {server.serverAgeYears} yrs • {server.currentStatus}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      <div className="font-semibold text-cyan-700 dark:text-cyan-300">{server.ipAddress}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{server.hostname}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 dark:text-white font-semibold">{server.operatingSystem}</div>
                      <div className="text-[10px] text-slate-400">{server.osVersion}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">{server.cpuCores}c</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span className="font-bold text-slate-900 dark:text-white">{server.totalRamGb}GB</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span className="text-slate-500 dark:text-slate-400">{server.totalStorageGb}GB</span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <div className="flex items-center justify-center space-x-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          server.peakCpuUtilization >= 80
                            ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700'
                        }`}>
                          CPU: {server.peakCpuUtilization}%
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          server.peakRamUtilization >= 85
                            ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700'
                        }`}>
                          RAM: {server.peakRamUtilization}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 dark:text-white font-bold">{server.applicationName}</div>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <span className="text-[10px] text-slate-400">{server.applicationType}</span>
                        <span className="text-slate-400">•</span>
                        <StatusBadge type="criticality" value={server.businessCriticality} size="sm" />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge type="classification" value={server.classification} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge type="risk" value={server.riskLevel} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => navigate(`/servers/${server.id}`)}
                          title="View 360° Detail"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditModal(server)}
                              title="Edit Server"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedServer(server); setIsDeleteModalOpen(true); }}
                              title="Delete Server"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {servers.length} of {totalElements} servers
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-white px-2">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Server Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
          title={isAddModalOpen ? 'Add Physical Server to Inventory' : `Edit Server: ${selectedServer?.serverName}`}
          maxWidth="4xl"
        >
          <form onSubmit={isAddModalOpen ? handleCreateServer : handleEditServer} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center space-x-2.5 shadow-lg">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-semibold">{formError}</span>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setActiveFormTab('basic')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 text-xs ${
                  activeFormTab === 'basic'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-950/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>1. Basic & Hardware</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('telemetry')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 text-xs ${
                  activeFormTab === 'telemetry'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-950/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>2. Telemetry & Load</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('app')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 text-xs ${
                  activeFormTab === 'app'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-950/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3. App & Business</span>
              </button>
            </div>

            {/* TAB 1: Basic & Hardware */}
            {activeFormTab === 'basic' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Server Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.serverName}
                      disabled={isEditModalOpen}
                      onChange={(e) => setFormData({ ...formData, serverName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      placeholder="e.g. APP-SERVER-41"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Hostname *</label>
                    <input
                      type="text"
                      required
                      value={formData.hostname}
                      onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. app-srv-41.corp.local"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">IP Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.ipAddress}
                      onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="e.g. 10.0.12.41"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Operating System *</label>
                    <select
                      value={formData.operatingSystem}
                      onChange={(e) => setFormData({ ...formData, operatingSystem: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Ubuntu Linux">Ubuntu Linux</option>
                      <option value="Red Hat Enterprise Linux">Red Hat Enterprise Linux</option>
                      <option value="Windows Server">Windows Server</option>
                      <option value="CentOS Linux">CentOS Linux</option>
                      <option value="Debian GNU/Linux">Debian GNU/Linux</option>
                      <option value="Oracle Linux">Oracle Linux</option>
                      <option value="SUSE Linux Enterprise">SUSE Linux Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">OS Version *</label>
                    <input
                      type="text"
                      required
                      value={formData.osVersion}
                      onChange={(e) => setFormData({ ...formData, osVersion: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. 22.04 LTS or 2022"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">CPU Model / Architecture</label>
                    <input
                      type="text"
                      value={formData.cpuModel}
                      onChange={(e) => setFormData({ ...formData, cpuModel: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Intel Xeon Gold 6348"
                    />
                  </div>
                </div>

                {/* Hardware Specs Grid */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Physical Hardware Specifications
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">CPU Cores *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.cpuCores}
                        onChange={(e) => setFormData({ ...formData, cpuCores: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Total RAM (GB) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.totalRamGb}
                        onChange={(e) => setFormData({ ...formData, totalRamGb: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Total Storage (GB) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.totalStorageGb}
                        onChange={(e) => setFormData({ ...formData, totalStorageGb: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Storage Media</label>
                      <select
                        value={formData.storageType}
                        onChange={(e) => setFormData({ ...formData, storageType: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                      >
                        <option value="NVMe SSD">NVMe SSD</option>
                        <option value="SSD">SSD</option>
                        <option value="HDD">HDD</option>
                        <option value="SAN">SAN</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Telemetry & Utilization */}
            {activeFormTab === 'telemetry' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Workload Telemetry & Resource Utilization (%)
                    </span>
                    <span className="text-[10px] text-emerald-400">Used by Scoring & Right-Sizing Engines</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Peak CPU (%) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        required
                        value={formData.peakCpuUtilization}
                        onChange={(e) => setFormData({ ...formData, peakCpuUtilization: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Avg CPU (%) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        required
                        value={formData.averageCpuUtilization}
                        onChange={(e) => setFormData({ ...formData, averageCpuUtilization: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Peak RAM (%) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        required
                        value={formData.peakRamUtilization}
                        onChange={(e) => setFormData({ ...formData, peakRamUtilization: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Avg RAM (%) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        required
                        value={formData.averageRamUtilization}
                        onChange={(e) => setFormData({ ...formData, averageRamUtilization: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 pt-2 border-t border-slate-800/80">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Avg Storage Util (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.averageStorageUtilization}
                        onChange={(e) => setFormData({ ...formData, averageStorageUtilization: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Avg Network Util (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.averageNetworkUtilization}
                        onChange={(e) => setFormData({ ...formData, averageNetworkUtilization: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Bandwidth (Gbps)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={formData.networkBandwidthGbps}
                        onChange={(e) => setFormData({ ...formData, networkBandwidthGbps: parseFloat(e.target.value) || 1.0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: App & Business */}
            {activeFormTab === 'app' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Primary Application *</label>
                    <input
                      type="text"
                      required
                      value={formData.applicationName}
                      onChange={(e) => setFormData({ ...formData, applicationName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. ERP Backend Service"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Application Type *</label>
                    <select
                      value={formData.applicationType}
                      onChange={(e) => setFormData({ ...formData, applicationType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="WEB">Web Tier</option>
                      <option value="APPLICATION">Application Server</option>
                      <option value="DATABASE">Database Tier</option>
                      <option value="ERP">Enterprise Resource Planning (ERP)</option>
                      <option value="CRM">Customer Relationship Management</option>
                      <option value="ANALYTICS">Analytics & BI</option>
                      <option value="CACHE">Cache & In-Memory</option>
                      <option value="MIDDLEWARE">Middleware / Messaging</option>
                      <option value="INFRASTRUCTURE">Core Infrastructure</option>
                      <option value="MONITORING">Observability & Monitoring</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Application Owner *</label>
                    <input
                      type="text"
                      required
                      value={formData.applicationOwner}
                      onChange={(e) => setFormData({ ...formData, applicationOwner: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Cloud Operations Team"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Business Criticality *</label>
                    <select
                      value={formData.businessCriticality}
                      onChange={(e) => setFormData({ ...formData, businessCriticality: e.target.value as BusinessCriticality })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="LOW">Tier 4 - Low Criticality</option>
                      <option value="MEDIUM">Tier 3 - Medium Criticality</option>
                      <option value="HIGH">Tier 2 - High Criticality</option>
                      <option value="CRITICAL">Tier 1 - Mission Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Downtime Requirement *</label>
                    <select
                      value={formData.downtimeRequirement}
                      onChange={(e) => setFormData({ ...formData, downtimeRequirement: e.target.value as DowntimeRequirement })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="FLEXIBLE">Flexible (Maintenance Window OK)</option>
                      <option value="MINIMAL">Minimal (&lt; 15 Minutes)</option>
                      <option value="NONE">Zero Downtime (Live vMotion)</option>
                      <option value="STRICT">Strict / High SLA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Server Age (Years)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.serverAgeYears}
                      onChange={(e) => setFormData({ ...formData, serverAgeYears: parseFloat(e.target.value) || 1.0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Compatibility & Hardware Constraints */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <label className="flex items-center space-x-2.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.virtualizationCompatibility}
                      onChange={(e) => setFormData({ ...formData, virtualizationCompatibility: e.target.checked })}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                    />
                    <span className="font-semibold text-xs">Virtualization Compatible OS / Kernel</span>
                  </label>

                  <label className="flex items-center space-x-2.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hardwareDependency}
                      onChange={(e) => setFormData({ ...formData, hardwareDependency: e.target.checked })}
                      className="rounded border-slate-700 text-rose-500 focus:ring-0 w-4 h-4"
                    />
                    <span className="font-semibold text-xs text-rose-300">Has Hardware Lock (PCIe Card / USB Dongle)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="flex space-x-2">
                {activeFormTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={() => setActiveFormTab(activeFormTab === 'app' ? 'telemetry' : 'basic')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    ← Previous Tab
                  </button>
                )}
                {activeFormTab !== 'app' && (
                  <button
                    type="button"
                    onClick={() => setActiveFormTab(activeFormTab === 'basic' ? 'telemetry' : 'app')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold"
                  >
                    Next Tab →
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Saving Server...' : isAddModalOpen ? 'Save & Add Server' : 'Update Server'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Import Physical Servers via CSV"
          maxWidth="lg"
        >
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="p-6 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl text-center bg-slate-950/40 transition-colors">
              <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Select Server CSV file to upload</p>
              <p className="text-xs text-slate-400 mt-1">Supports standard CSV headers matching inventory specs</p>
              <input
                type="file"
                accept=".csv"
                required
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="mt-4 text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500"
              />
            </div>

            {importResult && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Import Completed</span>
                  <span className="text-emerald-400">+{importResult.successfulImports} Added</span>
                </div>
                <p className="text-slate-400">Total Processed: {importResult.totalProcessed}</p>
                {importResult.errors?.length > 0 && (
                  <div className="text-rose-400 text-[11px] max-h-24 overflow-y-auto space-y-1">
                    {importResult.errors.map((err: string, idx: number) => (
                      <div key={idx}>• {err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white bg-slate-800 text-xs"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!importFile || importLoading}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                {importLoading ? 'Uploading & Validating...' : 'Process Import'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {isDeleteModalOpen && selectedServer && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteServer}
          title="Delete Physical Server"
          message={`Are you sure you want to remove this server "${selectedServer.serverName}" (${selectedServer.ipAddress}) from the inventory? This will remove all associated assessment telemetry and wave assignments.`}
          confirmText="Delete Server"
          isDanger
          loading={formLoading}
        />
      )}
    </div>
  );
};

