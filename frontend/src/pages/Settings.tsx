import React, { useState, useEffect, useMemo } from 'react';
import { settingsApi } from '../api/settings';
import { SystemSetting } from '../types';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Cpu,
  ShieldAlert,
  Boxes,
  HelpCircle,
  Database,
  Moon,
  Sun,
  AlertTriangle,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
  Check,
  RefreshCw,
  X
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [settingsByCategory, setSettingsByCategory] = useState<Record<string, SystemSetting[]>>({});
  const [initialValues, setInitialValues] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const { isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.getCategorizedSettings();
      setSettingsByCategory(res.categorizedSettings);

      const values: Record<string, string> = {};
      Object.values(res.categorizedSettings).flat().forEach((s) => {
        values[s.settingKey] = s.settingValue;
      });
      setInitialValues(values);
      setFormValues(values);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setFormValues(initialValues);
    setToastMessage('Reverted all unsaved modifications to current server values.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Compute modified fields (Before & After audit)
  const modifiedKeys = useMemo(() => {
    return Object.keys(formValues).filter(
      (key) => formValues[key] !== initialValues[key]
    );
  }, [formValues, initialValues]);

  const handleConfirmSave = async () => {
    if (!isAdmin) return;
    try {
      setSaving(true);
      setShowReviewModal(false);
      await settingsApi.batchUpdate(formValues);
      setInitialValues(formValues);
      setToastMessage(`Successfully saved ${modifiedKeys.length > 0 ? modifiedKeys.length : 'all'} configuration parameters to PostgreSQL.`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchSettings();
    } catch (err) {
      console.error('Failed to save settings:', err);
      setToastMessage('Error saving settings. Please check parameters.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toUpperCase()) {
      case 'SCORING_WEIGHT':
      case 'SCORING':
        return <Sliders className="w-4 h-4 text-cyan-400" />;
      case 'UTILIZATION_THRESHOLD':
      case 'THRESHOLD':
        return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'RISK_THRESHOLD':
      case 'RISK':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'CONSOLIDATION':
        return <Boxes className="w-4 h-4 text-purple-400" />;
      case 'VM_SIZING':
        return <Layers className="w-4 h-4 text-amber-400" />;
      case 'WAVE_PLANNING':
        return <Calendar className="w-4 h-4 text-teal-400" />;
      default:
        return <SettingsIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  // Calculate sum of scoring weights
  const scoringWeightSum = useMemo(() => {
    const weights = Object.keys(formValues)
      .filter((k) => k.startsWith('weight_'))
      .map((k) => parseFloat(formValues[k]) || 0);
    return weights.reduce((acc, curr) => acc + curr, 0);
  }, [formValues]);

  // Categories list
  const categoryKeys = Object.keys(settingsByCategory);

  const filteredCategories = useMemo(() => {
    if (activeTab === 'ALL') return categoryKeys;
    return categoryKeys.filter((cat) => cat.toUpperCase().includes(activeTab.toUpperCase()));
  }, [categoryKeys, activeTab]);

  if (loading) {
    return <LoadingSpinner message="Querying algorithmic engine configuration..." />;
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 text-xs font-semibold flex items-center justify-between shadow-2xl backdrop-blur-md animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-cyan-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Engine Status & Primary Controls */}
      <div className="nexus-card p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-wide flex items-center gap-2">
                NEXUS Engine Tuning & Parameters
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  v2.4 PostgreSQL Persistence
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Calibrate migration scoring weights, CPU/RAM thresholds, hypervisor capacities, and risk classification boundaries.
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {modifiedKeys.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>{modifiedKeys.length} Unsaved Changes</span>
            </div>
          )}

          {modifiedKeys.length > 0 && (
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Revert</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                if (modifiedKeys.length > 0) {
                  setShowReviewModal(true);
                } else {
                  handleConfirmSave();
                }
              }}
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Persisting...' : modifiedKeys.length > 0 ? `Review & Save (${modifiedKeys.length})` : 'Save Configuration'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Platform & Theme Preferences Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Theme Preferences */}
        <div className="nexus-card p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Interface Theme</div>
              <div className="text-[11px] text-slate-400">
                Current: <span className="text-cyan-300 font-mono font-semibold">{isDark ? 'Midnight Dark (Default)' : 'Clean Light Mode'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
            <span>Switch to {isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        {/* Database Connection Status */}
        <div className="nexus-card p-4 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>Database State</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-400">
              PostgreSQL <span className="font-mono text-emerald-400">vmmigration</span> • 41 Registered Nodes
            </div>
          </div>
        </div>

        {/* Algorithm Compliance Status */}
        <div className="nexus-card p-4 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Weights Verification</div>
            <div className="text-[11px] text-slate-400">
              Total Weight: <span className={`font-mono font-bold ${Math.abs(scoringWeightSum - 1.0) < 0.01 ? 'text-cyan-400' : 'text-amber-400'}`}>{(scoringWeightSum * 100).toFixed(0)}%</span>
              {Math.abs(scoringWeightSum - 1.0) < 0.01 ? (
                <span className="ml-1 text-emerald-400 font-semibold">(Normalized 1.00)</span>
              ) : (
                <span className="ml-1 text-amber-400 font-semibold">(!= 100%)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ALL'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-950'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          All Parameters ({Object.values(settingsByCategory).flat().length})
        </button>
        {categoryKeys.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === cat
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-950'
                : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {getCategoryIcon(cat)}
            <span>{cat.replace(/_/g, ' ')}</span>
            <span className="text-[10px] opacity-75 font-mono">({settingsByCategory[cat]?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* Interactive Visualizer Cards */}
      {/* 1. CPU & RAM Threshold Scales */}
      {(activeTab === 'ALL' || activeTab.includes('UTILIZATION') || activeTab.includes('THRESHOLD')) && (
        <div className="nexus-card p-6 border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Interactive Threshold Scale Previews
                </h3>
                <p className="text-[11px] text-slate-400">
                  Visual boundary partitions for classification into Low, Normal, High, and Saturated tiers
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
              UTILIZATION_THRESHOLD
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU Scale */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200">CPU Tier Boundaries</span>
                <span className="text-[11px] font-mono text-slate-400">
                  Low: {formValues['threshold_cpu_low'] || '40'}% • Normal: {formValues['threshold_cpu_normal'] || '70'}% • High: {formValues['threshold_cpu_high'] || '85'}%
                </span>
              </div>
              <div className="h-6 w-full rounded-lg overflow-hidden flex text-[10px] font-bold text-slate-950">
                <div
                  style={{ width: `${parseFloat(formValues['threshold_cpu_low'] || '40')}%` }}
                  className="bg-emerald-400 flex items-center justify-center transition-all"
                  title="Underutilized (Candidate for Downsizing)"
                >
                  &lt;{formValues['threshold_cpu_low'] || '40'}% Low
                </div>
                <div
                  style={{ width: `${Math.max(5, parseFloat(formValues['threshold_cpu_normal'] || '70') - parseFloat(formValues['threshold_cpu_low'] || '40'))}%` }}
                  className="bg-cyan-400 flex items-center justify-center transition-all"
                  title="Normal Target Zone"
                >
                  Normal
                </div>
                <div
                  style={{ width: `${Math.max(5, parseFloat(formValues['threshold_cpu_high'] || '85') - parseFloat(formValues['threshold_cpu_normal'] || '70'))}%` }}
                  className="bg-amber-400 flex items-center justify-center transition-all"
                  title="High Load"
                >
                  High
                </div>
                <div
                  style={{ width: `${Math.max(5, 100 - parseFloat(formValues['threshold_cpu_high'] || '85'))}%` }}
                  className="bg-rose-500 text-white flex items-center justify-center transition-all"
                  title="Critical Saturation Risk"
                >
                  Peak
                </div>
              </div>
            </div>

            {/* RAM Scale */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200">RAM Tier Boundaries</span>
                <span className="text-[11px] font-mono text-slate-400">
                  Low: {formValues['threshold_ram_low'] || '50'}% • Normal: {formValues['threshold_ram_normal'] || '75'}% • High: {formValues['threshold_ram_high'] || '90'}%
                </span>
              </div>
              <div className="h-6 w-full rounded-lg overflow-hidden flex text-[10px] font-bold text-slate-950">
                <div
                  style={{ width: `${parseFloat(formValues['threshold_ram_low'] || '50')}%` }}
                  className="bg-emerald-400 flex items-center justify-center transition-all"
                  title="RAM Low"
                >
                  &lt;{formValues['threshold_ram_low'] || '50'}% Low
                </div>
                <div
                  style={{ width: `${Math.max(5, parseFloat(formValues['threshold_ram_normal'] || '75') - parseFloat(formValues['threshold_ram_low'] || '50'))}%` }}
                  className="bg-cyan-400 flex items-center justify-center transition-all"
                  title="RAM Normal"
                >
                  Normal
                </div>
                <div
                  style={{ width: `${Math.max(5, parseFloat(formValues['threshold_ram_high'] || '90') - parseFloat(formValues['threshold_ram_normal'] || '75'))}%` }}
                  className="bg-amber-400 flex items-center justify-center transition-all"
                  title="RAM High"
                >
                  High
                </div>
                <div
                  style={{ width: `${Math.max(5, 100 - parseFloat(formValues['threshold_ram_high'] || '90'))}%` }}
                  className="bg-rose-500 text-white flex items-center justify-center transition-all"
                  title="RAM Critical"
                >
                  Critical
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Cards Grid */}
      <form onSubmit={(e) => { e.preventDefault(); setShowReviewModal(true); }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCategories.map((category) => {
          const settings = settingsByCategory[category] || [];
          return (
            <div key={category} className="nexus-card p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                {/* Category Card Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-slate-800">
                      {getCategoryIcon(category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                        {category.replace(/_/g, ' ')}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {category === 'SCORING_WEIGHT' && 'Determines suitability ranking formula (Target: 1.0)'}
                        {category === 'UTILIZATION_THRESHOLD' && 'Metric ranges for CPU and RAM workload classification'}
                        {category === 'VM_SIZING' && 'Headroom padding for Google Cloud compute instance sizing'}
                        {category === 'CONSOLIDATION' && 'Target bare-metal hypervisor physical capacity limits'}
                        {category === 'RISK_THRESHOLD' && 'Score bands categorizing servers into Low, Medium, High & Critical'}
                        {category === 'WAVE_PLANNING' && 'Batch sizing limits for migration execution waves'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                    {category}
                  </span>
                </div>

                {/* Settings Input List */}
                <div className="space-y-4 pt-4">
                  {settings.map((setting) => {
                    const isModified = formValues[setting.settingKey] !== initialValues[setting.settingKey];
                    const val = formValues[setting.settingKey] ?? setting.settingValue;

                    return (
                      <div
                        key={setting.settingKey}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isModified
                            ? 'bg-amber-500/5 border-amber-500/40'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start text-xs mb-1.5">
                          <div>
                            <label className="font-semibold text-slate-200 block">
                              {setting.settingKey.replace(/_/g, ' ').toUpperCase()}
                            </label>
                            <span className="text-[10px] font-mono text-cyan-400/90">{setting.settingKey}</span>
                          </div>

                          {isModified && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                              Original: {initialValues[setting.settingKey]}
                            </span>
                          )}
                        </div>

                        {/* Input with Slider (for weights or percentages) */}
                        {setting.settingKey.startsWith('weight_') ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                disabled={!isAdmin}
                                value={parseFloat(val) || 0}
                                onChange={(e) => handleInputChange(setting.settingKey, e.target.value)}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                              />
                              <input
                                type="number"
                                min="0"
                                max="1"
                                step="0.05"
                                disabled={!isAdmin}
                                value={val}
                                onChange={(e) => handleInputChange(setting.settingKey, e.target.value)}
                                className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 text-right font-mono font-bold focus:border-cyan-400 focus:outline-none"
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                              <span>0%</span>
                              <span>Weight: {((parseFloat(val) || 0) * 100).toFixed(0)}%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="text"
                              disabled={!isAdmin}
                              value={val}
                              onChange={(e) => handleInputChange(setting.settingKey, e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 disabled:opacity-60 font-mono transition-colors"
                            />
                          </div>
                        )}

                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>{setting.description}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </form>

      {/* Review & Confirmation Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="nexus-card w-full max-w-xl p-6 border-cyan-500/40 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Confirm Configuration Changes</h3>
                  <p className="text-xs text-slate-400">Review parameter diff before persisting to database</p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modifiedKeys.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900 text-xs text-slate-300">
                No modifications detected. Saving will re-validate current server parameters.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  Parameters to be updated ({modifiedKeys.length}):
                </div>
                {modifiedKeys.map((key) => (
                  <div key={key} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-cyan-300 font-medium">{key}</span>
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-rose-400 line-through opacity-80">{initialValues[key]}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-emerald-400 font-bold">{formValues[key]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>These values directly dictate scoring calculations, bin-packing, and risk assignments across all 41 workloads.</span>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={saving}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950 transition-all"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Applying Changes...' : 'Confirm & Save to Database'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
