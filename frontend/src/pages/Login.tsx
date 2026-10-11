import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import {
  ShieldCheck,
  Zap,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  Loader2,
  Sun,
  Moon,
  Sparkles,
  KeyRound,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';
import { CinematicInfinityMigration } from '../components/Login/CinematicInfinityMigration';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecoveryHint, setShowRecoveryHint] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  // ─── THEME CHANGER (LIGHT & DARK MODE) ──────────────────────────────────────
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('nexus_login_theme') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('nexus_login_theme', nextTheme);
  };

  // Sync theme class to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ─── STRONG PASSWORD ANALYZER ────────────────────────────────────────────────
  const checkPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'No password', color: 'bg-slate-500', textCol: 'text-slate-400' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', textCol: 'text-rose-400' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', textCol: 'text-amber-400' };
    if (score === 3) return { score: 3, label: 'Strong', color: 'bg-cyan-400', textCol: 'text-cyan-400' };
    return { score: 4, label: 'Enterprise Shielded', color: 'bg-emerald-400', textCol: 'text-emerald-400' };
  };

  const passwordStrength = checkPasswordStrength(password);

  // Generate an enterprise-grade randomized strong password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let res = '';
    for (let i = 0; i < 14; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  // Caps lock listener
  const handleKeyActivity = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(username, password);
      login(response.token, {
        id: response.id,
        username: response.username,
        role: response.role,
        createdAt: new Date().toISOString(),
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Authentication failed. Please verify operator credentials and server connectivity.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userType: 'admin' | 'viewer') => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('viewer');
      setPassword('viewer123');
    }
    setError(null);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-start p-4 sm:p-6 lg:p-8 xl:p-12 select-none bg-[#050A18]"
    >
      {/* ═══════════════════════════════════════════════════════════════════════════
          FULL-SCREEN CINEMATIC INFINITE 3D MIGRATION WORLD
         ═══════════════════════════════════════════════════════════════════════════ */}
      <CinematicInfinityMigration />

      {/* ═══════════════════════════════════════════════════════════════════════════
          FLOATING TRANSLUCENT GLASS LOGIN CARD (Theme Responsive & Ultra-Premium)
         ═══════════════════════════════════════════════════════════════════════════ */}
      <div
        className={`relative z-30 w-full max-w-[440px] sm:max-w-[465px] lg:max-w-[440px] xl:max-w-[460px] rounded-[30px] p-7 sm:p-9 shadow-2xl flex flex-col justify-between space-y-6 transition-all duration-300 ${
          isDark
            ? 'bg-[#071026]/85 backdrop-blur-2xl border border-cyan-400/40 text-slate-100 shadow-cyan-950/90'
            : 'bg-white/90 backdrop-blur-2xl border border-white/90 text-slate-900 shadow-2xl shadow-slate-950/30'
        }`}
      >
        {/* Soft Ambient Inner Glow */}
        <div
          className={`absolute -top-16 -left-16 w-64 h-64 rounded-full blur-[70px] pointer-events-none ${
            isDark ? 'bg-cyan-500/15' : 'bg-cyan-400/20'
          }`}
        />
        <div
          className={`absolute -bottom-16 -right-16 w-64 h-64 rounded-full blur-[70px] pointer-events-none ${
            isDark ? 'bg-emerald-500/10' : 'bg-teal-400/15'
          }`}
        />

        {/* ── 1. BRAND HEADER & THEME TOGGLE ── */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-400/30">
                <Zap className="w-5 h-5 font-black" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black tracking-[0.16em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400">
                  NEXUS
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                    isDark
                      ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400/40'
                      : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  }`}
                >
                  v2.4
                </span>
              </div>
            </div>
            <p
              className={`text-[10px] uppercase tracking-[0.22em] font-bold pl-[52px] ${
                isDark ? 'text-cyan-400/90' : 'text-cyan-600'
              }`}
            >
              Migration Intelligence
            </p>
          </div>

          {/* ── THEME SWITCHER TOGGLE (Light/Dark Mode) ── */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-slate-900/80 border-slate-700 text-amber-300 hover:bg-slate-800 hover:border-amber-400/50'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-white hover:border-cyan-400/50'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-600" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
              {isDark ? 'Light' : 'Dark'}
            </span>
          </button>
        </div>

        {/* ── 2. WELCOME & FORM ── */}
        <div className="relative z-10 space-y-4">
          <div className="space-y-1">
            <h1
              className={`text-2xl sm:text-[26px] font-black tracking-tight leading-tight ${
                isDark ? 'text-white drop-shadow-sm' : 'text-slate-900'
              }`}
            >
              Welcome to NEXUS
            </h1>
            <p
              className={`text-[12px] leading-relaxed font-medium ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Discover. Optimize. Migrate. Transform your infrastructure with intelligence.
            </p>
          </div>

          {/* API Error Notification */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg shadow-rose-950/60">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-200 font-bold text-sm px-1 leading-none"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* Username Input */}
            <div className="space-y-1">
              <label
                className={`block text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Username
              </label>
              <div className="relative group">
                <UserIcon
                  className={`w-[15px] h-[15px] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    isDark
                      ? 'text-slate-400 group-focus-within:text-cyan-400'
                      : 'text-slate-400 group-focus-within:text-cyan-600'
                  }`}
                />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all shadow-inner focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-[#050C1F]/90 border border-slate-700/80 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/30'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/25 focus:bg-white'
                  }`}
                  placeholder="Enter username"
                />
              </div>
            </div>

            {/* Password Input & Generator */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label
                  className={`block text-[10px] font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className={`text-[10px] flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                      isDark
                        ? 'text-cyan-400 hover:text-cyan-300'
                        : 'text-cyan-600 hover:text-cyan-700'
                    }`}
                    title="Generate enterprise strong password"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Generate Strong</span>
                  </button>
                  <span className="text-slate-500">·</span>
                  <button
                    type="button"
                    onClick={() => setShowRecoveryHint(!showRecoveryHint)}
                    className={`text-[10px] font-medium transition-colors ${
                      isDark
                        ? 'text-cyan-400 hover:text-cyan-300'
                        : 'text-cyan-600 hover:text-cyan-700'
                    }`}
                  >
                    Forgot?
                  </button>
                </div>
              </div>

              {showRecoveryHint && (
                <div
                  className={`p-2 rounded-lg text-[10px] flex items-center gap-2 border ${
                    isDark
                      ? 'bg-cyan-950/70 border-cyan-400/30 text-cyan-300'
                      : 'bg-cyan-50 border-cyan-200 text-cyan-800'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 shrink-0 text-cyan-500" />
                  <span>Use quick access profiles below (admin / admin123).</span>
                </div>
              )}

              <div className="relative group">
                <Lock
                  className={`w-[15px] h-[15px] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    isDark
                      ? 'text-slate-400 group-focus-within:text-cyan-400'
                      : 'text-slate-400 group-focus-within:text-cyan-600'
                  }`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyActivity}
                  onKeyUp={handleKeyActivity}
                  className={`w-full rounded-xl pl-10 pr-10 py-2.5 text-sm transition-all shadow-inner focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-[#050C1F]/90 border border-slate-700/80 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/30'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/25 focus:bg-white'
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors ${
                    isDark
                      ? 'text-slate-400 hover:text-cyan-400'
                      : 'text-slate-400 hover:text-cyan-600'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Caps Lock Warning Pill */}
              {capsLockActive && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-medium animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Caps Lock is currently ON</span>
                </div>
              )}

              {/* ── STRONG PASSWORD METER FEATURE ── */}
              {password.length > 0 && (
                <div className="pt-1 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">Security Strength:</span>
                    <span className={`font-bold ${passwordStrength.textCol}`}>
                      {passwordStrength.label}
                    </span>
                  </div>

                  {/* 4-Segment Strength Bars */}
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.score >= step
                            ? passwordStrength.color
                            : isDark
                            ? 'bg-slate-800'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements checklist indicators */}
                  <div className="flex items-center gap-2 pt-0.5 text-[9px] text-slate-400">
                    <span
                      className={`flex items-center gap-0.5 ${
                        password.length >= 8 ? 'text-emerald-400' : ''
                      }`}
                    >
                      {password.length >= 8 ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                      8+ chars
                    </span>
                    <span
                      className={`flex items-center gap-0.5 ${
                        /[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-400' : ''
                      }`}
                    >
                      {/[A-Z]/.test(password) && /[a-z]/.test(password) ? (
                        <Check className="w-2.5 h-2.5" />
                      ) : (
                        <X className="w-2.5 h-2.5" />
                      )}
                      Aa
                    </span>
                    <span
                      className={`flex items-center gap-0.5 ${
                        /[0-9]/.test(password) ? 'text-emerald-400' : ''
                      }`}
                    >
                      {/[0-9]/.test(password) ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                      0-9
                    </span>
                    <span
                      className={`flex items-center gap-0.5 ${
                        /[^A-Za-z0-9]/.test(password) ? 'text-emerald-400' : ''
                      }`}
                    >
                      {/[^A-Za-z0-9]/.test(password) ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                      Special #$&
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900/80 text-cyan-400 focus:ring-cyan-400/30 cursor-pointer accent-cyan-400"
                />
                <span
                  className={`text-xs transition-colors ${
                    isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  Remember me
                </span>
              </label>

              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                TLS 1.3 Active
              </span>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:via-teal-300 hover:to-emerald-300 text-slate-950 font-black text-sm shadow-lg shadow-cyan-400/30 hover:shadow-xl hover:shadow-cyan-400/50 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Profiles */}
          <div
            className={`pt-3.5 border-t space-y-2 ${
              isDark ? 'border-slate-800/80' : 'border-slate-200'
            }`}
          >
            <p
              className={`text-[9px] font-bold uppercase tracking-widest text-center ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Quick Access Profiles
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  username === 'admin'
                    ? isDark
                      ? 'bg-cyan-950/70 text-cyan-300 border-cyan-400/60 shadow-md shadow-cyan-950/80'
                      : 'bg-cyan-50 text-cyan-800 border-cyan-400 shadow-sm'
                    : isDark
                    ? 'bg-[#050C1F]/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900'
                }`}
              >
                <ShieldCheck
                  className={`w-3.5 h-3.5 shrink-0 ${
                    username === 'admin' ? 'text-cyan-400' : isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                />
                <div className="text-left">
                  <div className="font-bold leading-tight text-[11px]">Admin</div>
                  <div className="text-[9px] opacity-70 font-mono">admin / admin123</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('viewer')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  username === 'viewer'
                    ? isDark
                      ? 'bg-teal-950/70 text-teal-300 border-teal-400/60 shadow-md shadow-teal-950/80'
                      : 'bg-teal-50 text-teal-800 border-teal-400 shadow-sm'
                    : isDark
                    ? 'bg-[#050C1F]/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900'
                }`}
              >
                <UserIcon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    username === 'viewer' ? 'text-teal-400' : isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                />
                <div className="text-left">
                  <div className="font-bold leading-tight text-[11px]">Viewer</div>
                  <div className="text-[9px] opacity-70 font-mono">viewer / viewer123</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. CARD FOOTER & SECURITY ACCREDITATION ── */}
        <div
          className={`pt-3 border-t flex flex-col gap-1.5 text-[10px] relative z-10 ${
            isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
              <span className="font-medium">41 Enterprise Workloads</span>
            </div>
            <span>&copy; {new Date().getFullYear()} NEXUS Cloud Intelligence</span>
          </div>

          <div
            className={`text-[9px] font-mono text-center pt-0.5 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            🔒 SOC-2 Type II Certified · 256-Bit TLS · Zero Trust Protocol
          </div>
        </div>
      </div>
    </div>
  );
};
