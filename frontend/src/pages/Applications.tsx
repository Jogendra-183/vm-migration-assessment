import React, { useState, useEffect } from 'react';
import { applicationsApi } from '../api/data';
import { Application, BusinessCriticality, DowntimeRequirement } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { Modal } from '../components/Common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  AppWindow,
  Search,
  Plus,
  Edit2,
  Trash2,
  ShieldAlert,
  Server,
  User,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [formData, setFormData] = useState<Partial<Application>>({
    name: '',
    type: 'WEB',
    owner: 'IT Operations',
    criticality: 'MEDIUM',
    downtimeRequirement: 'FLEXIBLE',
    hardwareDependency: false,
    virtualizationCompatible: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationsApi.getAll();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (selectedApp) {
        await applicationsApi.update(selectedApp.id, formData);
      } else {
        await applicationsApi.create(formData);
      }
      setIsModalOpen(false);
      fetchApplications();
    } catch (err) {
      console.error('Failed to save application:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (app: Application) => {
    setSelectedApp(app);
    setFormData({
      name: app.name,
      type: app.type,
      owner: app.owner,
      criticality: app.criticality,
      downtimeRequirement: app.downtimeRequirement,
      hardwareDependency: app.hardwareDependency,
      virtualizationCompatible: app.virtualizationCompatible,
    });
    setIsModalOpen(true);
  };

  const filtered = applications.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.owner.toLowerCase().includes(search.toLowerCase());
    const matchesCrit = !criticalityFilter || a.criticality === criticalityFilter;
    const matchesType = !typeFilter || a.type === typeFilter;
    return matchesSearch && matchesCrit && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <AppWindow className="w-5 h-5" />
            </div>
            <span>Enterprise Application Catalog</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Workload inventory detailing ownership, SLA criticality, hardware lock-in, and virtualization readiness
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setSelectedApp(null);
              setFormData({
                name: '',
                type: 'WEB',
                owner: 'IT Operations',
                criticality: 'MEDIUM',
                downtimeRequirement: 'FLEXIBLE',
                hardwareDependency: false,
                virtualizationCompatible: true,
              });
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-950/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Register Application</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="nexus-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications or owner team..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          <select
            value={criticalityFilter}
            onChange={(e) => setCriticalityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Criticalities</option>
            <option value="LOW">Low Criticality</option>
            <option value="MEDIUM">Medium Criticality</option>
            <option value="HIGH">High Criticality</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Types</option>
            <option value="WEB">Web Tier</option>
            <option value="APPLICATION">Application Tier</option>
            <option value="DATABASE">Database</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
            <option value="LEGACY">Legacy</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="nexus-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner message="Querying enterprise application catalog..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Application Name</th>
                  <th className="py-3.5 px-4">Workload Tier</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Criticality</th>
                  <th className="py-3.5 px-4">Downtime Req</th>
                  <th className="py-3.5 px-4">Hardware Lock</th>
                  <th className="py-3.5 px-4">Virtualization Ready</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">{app.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold">
                        {app.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-semibold">{app.owner}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="criticality" value={app.criticality} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono">{app.downtimeRequirement}</td>
                    <td className="py-3.5 px-4">
                      {app.hardwareDependency ? (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">Yes (Locked)</span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {app.virtualizationCompatible ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Compatible</span>
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">Incompatible</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openEditModal(app)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedApp ? `Edit Application: ${selectedApp.name}` : 'Register New Application'}
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Application Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                placeholder="Enterprise CRM Core"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Tier / Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="WEB">Web Tier</option>
                  <option value="APPLICATION">Application Tier</option>
                  <option value="DATABASE">Database</option>
                  <option value="INFRASTRUCTURE">Infrastructure</option>
                  <option value="LEGACY">Legacy</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Owner Team</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Criticality</label>
                <select
                  value={formData.criticality}
                  onChange={(e) => setFormData({ ...formData, criticality: e.target.value as BusinessCriticality })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Downtime Req</label>
                <select
                  value={formData.downtimeRequirement}
                  onChange={(e) => setFormData({ ...formData, downtimeRequirement: e.target.value as DowntimeRequirement })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="FLEXIBLE">Flexible</option>
                  <option value="MINIMAL">Minimal (&lt; 15 mins)</option>
                  <option value="NONE">None (Live vMotion)</option>
                  <option value="STRICT">Strict</option>
                </select>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hardwareDependency}
                  onChange={(e) => setFormData({ ...formData, hardwareDependency: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Hardware Dependency (PCIe Lock)</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.virtualizationCompatible}
                  onChange={(e) => setFormData({ ...formData, virtualizationCompatible: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Virtualization Compatible</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-md shadow-cyan-950/20"
              >
                {formLoading ? 'Saving...' : 'Save Application'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
