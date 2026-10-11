import React, { useState, useEffect } from 'react';
import { serversApi } from '../api/servers';
import { wavesApi } from '../api/waves';
import { priorityApi } from '../api/priorities';
import { Server, MigrationWave, MigrationPriority } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { Modal } from '../components/Common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  CalendarDays,
  Search,
  Filter,
  CheckCircle2,
  Sliders,
  Eye,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MigrationPlan: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [waves, setWaves] = useState<MigrationWave[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [waveFilter, setWaveFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');

  // Priority override modal
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [newPriority, setNewPriority] = useState<MigrationPriority>('PRIORITY_1');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [srvList, waveList] = await Promise.all([
        serversApi.getAllServersList(),
        wavesApi.getAllWaves(),
      ]);
      setServers(srvList);
      setWaves(waveList);
    } catch (err) {
      console.error('Failed to load migration plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWaveChange = async (serverId: number, waveIdStr: string) => {
    if (!isAdmin || !waveIdStr) return;
    try {
      await wavesApi.assignServerToWave(serverId, Number(waveIdStr));
      setToastMessage('Server wave assignment updated successfully.');
      setTimeout(() => setToastMessage(null), 4000);
      fetchData();
    } catch (err) {
      console.error('Failed to update wave assignment:', err);
    }
  };

  const handlePriorityOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServer) return;
    try {
      setOverrideLoading(true);
      await priorityApi.overridePriority(selectedServer.id, newPriority, overrideReason);
      setSelectedServer(null);
      setToastMessage(`Priority overridden to ${newPriority} for ${selectedServer.serverName}`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchData();
    } catch (err) {
      console.error('Failed to override priority:', err);
    } finally {
      setOverrideLoading(false);
    }
  };

  const filteredServers = servers.filter((s) => {
    const matchesSearch =
      s.serverName.toLowerCase().includes(search.toLowerCase()) ||
      s.applicationName.toLowerCase().includes(search.toLowerCase());
    const matchesWave = !waveFilter || (s.assignedWaveNumber && String(s.assignedWaveNumber) === waveFilter);
    const matchesPriority = !priorityFilter || s.migrationPriority === priorityFilter;
    const matchesClass = !classificationFilter || s.classification === classificationFilter;
    return matchesSearch && matchesWave && matchesPriority && matchesClass;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-semibold flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-cyan-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span>Workload Migration Master Plan</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Holistic tracking table mapping classifications, risk levels, priorities, target sizing, and wave schedules
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="nexus-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plan by server or app..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
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

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Priorities</option>
            <option value="PRIORITY_1">Priority 1 (Pilot)</option>
            <option value="PRIORITY_2">Priority 2 (Core)</option>
            <option value="PRIORITY_3">Priority 3 (Complex)</option>
            <option value="PRIORITY_4">Priority 4 (Deferred)</option>
          </select>

          <select
            value={waveFilter}
            onChange={(e) => setWaveFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Waves</option>
            {waves.map((w) => (
              <option key={w.id} value={String(w.waveNumber)}>Wave {w.waveNumber} - {w.waveName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="nexus-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner message="Assembling migration master plan..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Server</th>
                  <th className="py-3.5 px-4">Application</th>
                  <th className="py-3.5 px-4">Classification</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className="py-3.5 px-4">Risk</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4 text-center">Target VM Size</th>
                  <th className="py-3.5 px-4">Wave Assignment</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                {filteredServers.map((server) => (
                  <tr key={server.id} className="hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <span
                        onClick={() => navigate(`/servers/${server.id}`)}
                        className="font-extrabold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                      >
                        {server.serverName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-semibold">{server.applicationName}</td>

                    <td className="py-3.5 px-4">
                      <StatusBadge type="classification" value={server.classification} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {server.migrationScore || '-'}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge type="risk" value={server.riskLevel} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <StatusBadge type="priority" value={server.migrationPriority} size="sm" />
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setSelectedServer(server);
                              setNewPriority(server.migrationPriority || 'PRIORITY_1');
                              setOverrideReason('');
                            }}
                            title="Override Priority"
                            className="p-1 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      {server.recommendedVcpu ? (
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">
                          {server.recommendedVcpu} vCPU • {server.recommendedRamGb}GB
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isAdmin && server.classification !== 'RETIRE' && server.classification !== 'KEEP_PHYSICAL' ? (
                        <select
                          value={
                            waves.find((w) => w.waveNumber === server.assignedWaveNumber)?.id || ''
                          }
                          onChange={(e) => handleWaveChange(server.id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-medium"
                        >
                          <option value="">Unassigned</option>
                          {waves.map((w) => (
                            <option key={w.id} value={w.id}>Wave {w.waveNumber} ({w.waveName.split('-')[1]?.trim() || w.waveName})</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-400 text-xs font-mono">
                          {server.assignedWaveNumber ? `Wave ${server.assignedWaveNumber}` : 'Excluded / Deferred'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/servers/${server.id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Full Detail"
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

      {/* Priority Override Modal */}
      {selectedServer && (
        <Modal
          isOpen={!!selectedServer}
          onClose={() => setSelectedServer(null)}
          title={`Administrator Priority Override: ${selectedServer.serverName}`}
          maxWidth="md"
        >
          <form onSubmit={handlePriorityOverrideSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Select Target Migration Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as MigrationPriority)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="PRIORITY_1">Priority 1 (Pilot & Quick Wins)</option>
                <option value="PRIORITY_2">Priority 2 (Core Application Tiers)</option>
                <option value="PRIORITY_3">Priority 3 (Complex & Critical Tiers)</option>
                <option value="PRIORITY_4">Priority 4 (Deferred / Extended)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Reason for Administrator Override</label>
              <textarea
                rows={3}
                required
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Business stakeholder request for expedited migration window"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedServer(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={overrideLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-md shadow-cyan-950/20"
              >
                {overrideLoading ? 'Saving...' : 'Apply Override'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
