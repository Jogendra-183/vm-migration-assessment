import React, { useState, useEffect, useMemo, useRef } from 'react';
import { dependenciesApi } from '../api/data';
import { Dependency, DependencyGraph, DependencyType, BusinessCriticality } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { Modal } from '../components/Common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  GitFork,
  Database,
  AppWindow,
  FileText,
  ShieldCheck,
  Globe,
  Search,
  Plus,
  Trash2,
  Filter,
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  ArrowRight,
  Server,
  X,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dependencies: React.FC = () => {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [graph, setGraph] = useState<DependencyGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState('');
  const [viewMode, setViewMode] = useState<'graph' | 'cards' | 'matrix'>('graph');
  const [selectedNode, setSelectedNode] = useState<{ id: string; label: string; type: string } | null>(null);

  // SVG Graph Zoom & Pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [list, g] = await Promise.all([
        dependenciesApi.getAll(),
        dependenciesApi.getGraph(),
      ]);
      setDependencies(list);
      setGraph(g);
    } catch (err) {
      console.error('Failed to load dependency graph:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDepIcon = (type: DependencyType) => {
    switch (type) {
      case 'DATABASE': return <Database className="w-4 h-4 text-emerald-500" />;
      case 'APPLICATION': return <AppWindow className="w-4 h-4 text-cyan-500" />;
      case 'FILE': return <FileText className="w-4 h-4 text-amber-500" />;
      case 'AUTHENTICATION': return <ShieldCheck className="w-4 h-4 text-violet-500" />;
      default: return <Globe className="w-4 h-4 text-slate-400" />;
    }
  };

  const filtered = dependencies.filter((d) => {
    const matchesSearch =
      d.sourceServerName.toLowerCase().includes(search.toLowerCase()) ||
      d.targetServerName.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || d.dependencyType === typeFilter;
    const matchesCrit = !criticalityFilter || d.criticality === criticalityFilter;
    return matchesSearch && matchesType && matchesCrit;
  });

  // Calculate coordinates for nodes in SVG graph view
  const graphNodes = useMemo(() => {
    const uniqueServers = new Map<string, { id: string; name: string; type: string }>();
    dependencies.forEach((d) => {
      if (!uniqueServers.has(d.sourceServerName)) {
        uniqueServers.set(d.sourceServerName, {
          id: d.sourceServerName,
          name: d.sourceServerName,
          type: d.sourceApplicationName?.toLowerCase().includes('db') ? 'DATABASE' : 'SERVER',
        });
      }
      if (!uniqueServers.has(d.targetServerName)) {
        uniqueServers.set(d.targetServerName, {
          id: d.targetServerName,
          name: d.targetServerName,
          type: d.dependencyType === 'DATABASE' ? 'DATABASE' : d.dependencyType === 'AUTHENTICATION' ? 'AUTH' : 'APP',
        });
      }
    });

    const nodes = Array.from(uniqueServers.values());
    const total = nodes.length;
    const radius = 280;
    const centerX = 450;
    const centerY = 320;

    return nodes.map((node, i) => {
      const angle = (i / (total || 1)) * 2 * Math.PI;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [dependencies]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number; name: string; type: string }>();
    graphNodes.forEach((n) => map.set(n.name, n));
    return map;
  }, [graphNodes]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <GitFork className="w-5 h-5" />
            </div>
            <span>Multi-Tier Infrastructure Dependency Topology</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Interactive topology map correlating application frontends, middleware tiers, database clusters, and auth providers
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'graph'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Topology Graph
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'cards'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Connection Cards
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'matrix'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Tabular Matrix
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl nexus-card border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Dependencies</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono block mt-0.5">{dependencies.length} Links</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <GitFork className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl nexus-card border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Database Links</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5">
              {dependencies.filter((d) => d.dependencyType === 'DATABASE').length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl nexus-card border-cyan-500/30 bg-cyan-50/40 dark:bg-cyan-950/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">App Tiers</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono block mt-0.5">
              {dependencies.filter((d) => d.dependencyType === 'APPLICATION').length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            <AppWindow className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl nexus-card border-violet-500/30 bg-violet-50/40 dark:bg-violet-950/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Auth / Directory</span>
            <span className="text-xl sm:text-2xl font-black text-violet-600 dark:text-violet-400 font-mono block mt-0.5">
              {dependencies.filter((d) => d.dependencyType === 'AUTHENTICATION').length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="nexus-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search source or target node..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Dependency Types</option>
            <option value="DATABASE">Database</option>
            <option value="APPLICATION">Application API</option>
            <option value="FILE">File / NFS Share</option>
            <option value="AUTHENTICATION">Authentication</option>
            <option value="EXTERNAL_SERVICE">External Service</option>
          </select>

          <select
            value={criticalityFilter}
            onChange={(e) => setCriticalityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Criticalities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Synthesizing multi-tier dependency topology paths..." />
      ) : viewMode === 'graph' ? (
        /* INTERACTIVE SVG TOPOLOGY GRAPH */
        <div className="nexus-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden relative shadow-2xl min-h-[580px] flex flex-col justify-between">
          {/* Canvas Controls */}
          <div className="absolute top-6 right-6 z-20 flex items-center space-x-1.5 p-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-md">
            <button
              onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* SVG Canvas Area */}
          <div className="w-full h-[520px] overflow-hidden cursor-grab active:cursor-grabbing relative flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox="0 0 900 640"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out',
              }}
            >
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="edgeGradSelected" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Connecting Edges */}
              {dependencies.map((dep) => {
                const src = nodeMap.get(dep.sourceServerName);
                const tgt = nodeMap.get(dep.targetServerName);
                if (!src || !tgt) return null;

                const isConnectedToSelected =
                  selectedNode &&
                  (selectedNode.label === dep.sourceServerName || selectedNode.label === dep.targetServerName);

                return (
                  <g key={`edge-${dep.id}`}>
                    <path
                      d={`M ${src.x} ${src.y} Q ${(src.x + tgt.x) / 2} ${(src.y + tgt.y) / 2 - 30} ${tgt.x} ${tgt.y}`}
                      fill="none"
                      stroke={isConnectedToSelected ? 'url(#edgeGradSelected)' : 'url(#edgeGrad)'}
                      strokeWidth={isConnectedToSelected ? 3 : 1.5}
                      strokeOpacity={selectedNode ? (isConnectedToSelected ? 1 : 0.15) : 0.6}
                      className="animate-pipeline-flow"
                    />
                  </g>
                );
              })}

              {/* Nodes */}
              {graphNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isDB = node.type === 'DATABASE';
                const isAuth = node.type === 'AUTH';

                return (
                  <g
                    key={`node-${node.id}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode({ id: node.id, label: node.name, type: node.type })}
                    className="cursor-pointer group"
                  >
                    {/* Glowing outer circle */}
                    <circle
                      r={isSelected ? 26 : 20}
                      fill={isDB ? '#10B981' : isAuth ? '#8B5CF6' : '#06B6D4'}
                      fillOpacity={isSelected ? 0.4 : 0.15}
                      stroke={isDB ? '#10B981' : isAuth ? '#8B5CF6' : '#06B6D4'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="transition-all duration-300 group-hover:scale-125"
                    />
                    <circle
                      r={isSelected ? 16 : 12}
                      fill={isDB ? '#10B981' : isAuth ? '#8B5CF6' : '#06B6D4'}
                      className="transition-all duration-300"
                    />
                    {/* Node Text Label */}
                    <text
                      y={34}
                      textAnchor="middle"
                      className={`text-[10px] font-mono font-bold transition-all ${
                        isSelected
                          ? 'fill-cyan-400 font-extrabold text-xs'
                          : 'fill-slate-700 dark:fill-slate-300'
                      }`}
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Details Drawer / Slide-Over if a node is selected */}
          {selectedNode && (
            <div className="absolute bottom-6 left-6 right-6 z-20 p-4 rounded-2xl bg-white/95 dark:bg-[#0B0F19]/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white font-mono">
                      {selectedNode.label}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                      {selectedNode.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Connected to{' '}
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                      {dependencies.filter((d) => d.sourceServerName === selectedNode.label || d.targetServerName === selectedNode.label).length}
                    </span>{' '}
                    active multi-tier infrastructure dependencies
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* Connection Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((dep) => (
            <div
              key={dep.id}
              className="nexus-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    {getDepIcon(dep.dependencyType)}
                  </div>
                  <span className="font-bold text-xs text-cyan-600 dark:text-cyan-400 font-mono">{dep.dependencyType}</span>
                </div>
                <StatusBadge type="criticality" value={dep.criticality} size="sm" />
              </div>

              {/* Source -> Target Connection */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="max-w-[42%]">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-sans">Source Node</span>
                  <span className="font-bold text-slate-900 dark:text-white block truncate">{dep.sourceServerName}</span>
                  <span className="text-[10px] text-slate-500 block truncate font-sans">{dep.sourceApplicationName}</span>
                </div>

                <span className="text-cyan-500 font-bold text-base px-2">→</span>

                <div className="max-w-[42%] text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-sans">Target Node</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 block truncate">{dep.targetServerName}</span>
                  <span className="text-[10px] text-slate-500 block truncate font-sans">{dep.targetApplicationName}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 font-medium">
                {dep.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* Tabular Matrix View */
        <div className="nexus-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Source Node</th>
                  <th className="py-3.5 px-4">Target Node</th>
                  <th className="py-3.5 px-4">Dependency Type</th>
                  <th className="py-3.5 px-4">Criticality</th>
                  <th className="py-3.5 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                {filtered.map((dep) => (
                  <tr key={dep.id} className="hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono">{dep.sourceServerName}</td>
                    <td className="py-3.5 px-4 font-bold text-cyan-600 dark:text-cyan-400 font-mono">{dep.targetServerName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold">
                        {dep.dependencyType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="criticality" value={dep.criticality} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">{dep.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
