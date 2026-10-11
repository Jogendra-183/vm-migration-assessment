import React, { useState, useEffect } from 'react';
import { wavesApi } from '../api/waves';
import { MigrationWave, WaveStatus, MigrationWaveServer } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { Modal } from '../components/Common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Calendar,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Server,
  Zap,
  Activity,
  GitFork,
  Cpu,
  CalendarDays,
  ShieldCheck,
  CheckCheck,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MigrationWaves: React.FC = () => {
  const [waves, setWaves] = useState<MigrationWave[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<MigrationWaveServer | null>(null);
  const [targetWaveId, setTargetWaveId] = useState<number | ''>('');
  const [moveNotes, setMoveNotes] = useState('');
  const [moveLoading, setMoveLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activePipelineStage, setActivePipelineStage] = useState<number>(4); // Default to Planning stage

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWaves();
  }, []);

  const fetchWaves = async () => {
    try {
      setLoading(true);
      const data = await wavesApi.getAllWaves();
      setWaves(data);
    } catch (err) {
      console.error('Failed to load migration waves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (waveId: number, status: WaveStatus) => {
    if (!isAdmin) return;
    try {
      await wavesApi.updateWave(waveId, { status });
      setToastMessage('Wave status updated successfully.');
      setTimeout(() => setToastMessage(null), 3000);
      fetchWaves();
    } catch (err) {
      console.error('Failed to update wave status:', err);
    }
  };

  const handleMoveServerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServer || targetWaveId === '') return;
    try {
      setMoveLoading(true);
      await wavesApi.assignServerToWave(selectedServer.serverId, Number(targetWaveId), moveNotes);
      setSelectedServer(null);
      setToastMessage(`Moved ${selectedServer.serverName} to target wave.`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchWaves();
    } catch (err) {
      console.error('Failed to move server between waves:', err);
    } finally {
      setMoveLoading(false);
    }
  };

  const totalAssignedServers = waves.reduce((acc, w) => acc + w.servers.length, 0);

  // 8-stage pipeline specification
  const pipelineStages = [
    { id: 0, name: 'Discovery', count: '41 Nodes', status: 'Completed', icon: Server, color: 'emerald' },
    { id: 1, name: 'Assessment', count: '41 Scored', status: 'Completed', icon: Zap, color: 'emerald' },
    { id: 2, name: 'Dependency Analysis', count: '100% Mapped', status: 'Completed', icon: GitFork, color: 'emerald' },
    { id: 3, name: 'Right-Sizing', count: 'Optimized', status: 'Completed', icon: Cpu, color: 'emerald' },
    { id: 4, name: 'Planning', count: `${waves.length} Waves`, status: 'In Progress', icon: CalendarDays, color: 'cyan' },
    { id: 5, name: 'Provisioning', count: 'GCP Staged', status: 'Queued', icon: Layers, color: 'slate' },
    { id: 6, name: 'Validation', count: 'Pre-flight', status: 'Queued', icon: ShieldCheck, color: 'slate' },
    { id: 7, name: 'Completion', count: 'Cutover', status: 'Pending', icon: CheckCheck, color: 'slate' },
  ];

  if (loading) {
    return <LoadingSpinner message="Orchestrating migration waves & cinematic pipeline execution flow..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-semibold flex items-center justify-between shadow-2xl animate-fade-in">
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
              <Layers className="w-5 h-5" />
            </div>
            <span>Migration Waves Execution Board</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Phased multi-stage schedule grouped by risk profile, dependency ordering, and change window tolerance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
            {waves.length} Active Waves • {totalAssignedServers} Assigned Workloads
          </span>
        </div>
      </div>

      {/* Signature Cinematic Migration Pipeline Visualization */}
      <div className="nexus-card p-6 sm:p-7 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-[#0B0F19] to-slate-900 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              CINEMATIC MIGRATION PIPELINE
            </span>
            <h3 className="text-base font-extrabold text-white mt-0.5 tracking-tight">
              End-to-End Infrastructure Migration Lifecycle
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Stage {activePipelineStage + 1} of 8: <span className="text-cyan-300">{pipelineStages[activePipelineStage].name}</span>
          </span>
        </div>

        {/* Responsive Horizontal Pipeline Track */}
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[780px] flex items-center justify-between relative px-2">
            {/* SVG Connecting Flow Lines */}
            <div className="absolute left-6 right-6 top-6 h-1 pointer-events-none -z-0">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <line
                  x1="0"
                  y1="50%"
                  x2="100%"
                  y2="50%"
                  stroke="#1E293B"
                  strokeWidth="3"
                />
                <line
                  x1="0"
                  y1="50%"
                  x2="60%"
                  y2="50%"
                  stroke="#06B6D4"
                  strokeWidth="3"
                  className="animate-pipeline-flow"
                />
              </svg>
            </div>

            {/* Pipeline Stage Nodes */}
            {pipelineStages.map((stage) => {
              const Icon = stage.icon;
              const isActive = stage.id === activePipelineStage;
              const isDone = stage.status === 'Completed';

              return (
                <div
                  key={stage.id}
                  onClick={() => setActivePipelineStage(stage.id)}
                  className={`flex flex-col items-center relative z-10 cursor-pointer group transition-all duration-300 ${
                    isActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  {/* Glowing Node Circle */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                      isActive
                        ? 'bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 ring-4 ring-cyan-500/30 shadow-cyan-500/50'
                        : isDone
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Stage Label */}
                  <div className="text-center mt-3">
                    <span
                      className={`text-xs font-extrabold tracking-tight block ${
                        isActive
                          ? 'text-cyan-300'
                          : isDone
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      {stage.count}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase mt-1 inline-block ${
                        isDone
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : isActive
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kanban Wave Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {waves.map((wave) => (
          <div
            key={wave.id}
            className="nexus-card rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[calc(100vh-220px)] shadow-xl overflow-hidden group/wave"
          >
            {/* Wave Column Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm">
                    {wave.waveNumber}
                  </span>
                  <span>{wave.waveName.split('-')[1]?.trim() || wave.waveName}</span>
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">
                  {wave.servers.length} VMs
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                {wave.description}
              </p>

              {/* Status Selector & Date */}
              <div className="flex items-center justify-between pt-1">
                {isAdmin ? (
                  <select
                    value={wave.status}
                    onChange={(e) => handleStatusChange(wave.id, e.target.value as WaveStatus)}
                    className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                ) : (
                  <StatusBadge type="waveStatus" value={wave.status} size="sm" />
                )}

                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-cyan-500" />
                  <span>{wave.plannedDate || 'Q3 2026'}</span>
                </span>
              </div>
            </div>

            {/* Server Cards List */}
            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {wave.servers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  No servers assigned to this wave
                </div>
              ) : (
                wave.servers.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all space-y-2 group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4
                          onClick={() => navigate(`/servers/${s.serverId}`)}
                          className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors cursor-pointer"
                        >
                          {s.serverName}
                        </h4>
                        <span className="text-[10px] text-slate-400 block">{s.applicationName}</span>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setSelectedServer(s);
                            setTargetWaveId('');
                            setMoveNotes('');
                          }}
                          title="Move to another wave"
                          className="p-1 rounded text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <StatusBadge type="risk" value={s.riskLevel} size="sm" />
                      <StatusBadge type="priority" value={s.priority} size="sm" />
                    </div>

                    {s.notes && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950/50 p-1.5 rounded border border-slate-200 dark:border-slate-800/60 font-medium">
                        {s.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Move Server Dialog Modal */}
      {selectedServer && (
        <Modal
          isOpen={!!selectedServer}
          onClose={() => setSelectedServer(null)}
          title={`Reassign Wave: ${selectedServer.serverName}`}
          maxWidth="md"
        >
          <form onSubmit={handleMoveServerSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Target Migration Wave</label>
              <select
                required
                value={targetWaveId}
                onChange={(e) => setTargetWaveId(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="">Select Target Wave...</option>
                {waves.map((w) => (
                  <option key={w.id} value={w.id}>
                    Wave {w.waveNumber} - {w.waveName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Reassignment Notes</label>
              <textarea
                rows={2}
                value={moveNotes}
                onChange={(e) => setMoveNotes(e.target.value)}
                placeholder="e.g. Moved forward due to completed application dependency cutover"
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
                disabled={targetWaveId === '' || moveLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-md shadow-cyan-950/20"
              >
                {moveLoading ? 'Moving...' : 'Confirm Reassignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
