import React, { useEffect, useRef, useState } from 'react';
import nexusMigrationScene from '../../assets/images/nexus-migration-scene.jpg';

// ─── STAGE METADATA ────────────────────────────────────────────────────────────
export interface StageInfo {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  x: number; // percentage of viewport width
  y: number; // percentage of viewport height
  color: string;
  status: string[];
}

export const STAGES: StageInfo[] = [
  {
    id: 'discovery',
    num: '01',
    title: 'DISCOVERY',
    subtitle: 'Physical Servers & Workload Telemetry',
    x: 18,
    y: 84,
    color: '#00F0FF',
    status: ['41 Workloads Ingested', 'Network Graph Mapped', 'OS Telemetry Ready'],
  },
  {
    id: 'cleaning',
    num: '02',
    title: 'DATA CLEANING',
    subtitle: 'Debris & Config Sanitization',
    x: 42,
    y: 64,
    color: '#F59E0B',
    status: ['Orphan Volumes Removed', 'Configs Normalized', 'Debris Purged'],
  },
  {
    id: 'optimization',
    num: '03',
    title: 'AI QUANTUM CORE',
    subtitle: 'Right-Sizing & Instance Compaction',
    x: 61.5,
    y: 56.5,
    color: '#00FF9D',
    status: ['vCPU Right-Sized', 'Memory Compacted', 'Cost -74%'],
  },
  {
    id: 'security',
    num: '04',
    title: 'SECURITY SCAN',
    subtitle: 'Threat Detection & Validation',
    x: 72,
    y: 54,
    color: '#D946EF',
    status: ['Firewall Policies Verified', 'Zero-Trust Check Passed', 'Secure Hash OK'],
  },
  {
    id: 'migration',
    num: '05',
    title: 'GOOGLE CLOUD',
    subtitle: 'Compute Engine Destination Matrix',
    x: 82.5,
    y: 34,
    color: '#4285F4',
    status: ['Provisioning Instances', 'Deploying Workloads', 'Routing Active', 'Completed'],
  },
];

// ─── HIGH-PRECISION CONVEYOR WAYPOINTS (Matching latest artwork) ───────────────
// Path 1: Primary Highway from bottom-left through central core up into Google Cloud
const PRIMARY_PATH = [
  { x: 6, y: 88 },
  { x: 14, y: 82 },
  { x: 23, y: 76 },
  { x: 33, y: 71 },
  { x: 44, y: 65 },
  { x: 53, y: 60 },
  { x: 61.5, y: 56.5 }, // Central Quantum Processing Cube
  { x: 68, y: 54 },
  { x: 73, y: 50 },
  { x: 77, y: 44 }, // Ascending Rainbow Conduits
  { x: 80, y: 38 },
  { x: 82.5, y: 34 }, // Google Cloud Luminous Neon Sculpture
];

// Path 2: Upper Elevated Bridge winding into Central Core
const SECONDARY_PATH = [
  { x: 28, y: 45 },
  { x: 35, y: 46 },
  { x: 43, y: 48 },
  { x: 51, y: 52 },
  { x: 61.5, y: 56.5 }, // Merges into Central Cube
  { x: 69, y: 61 },
  { x: 76, y: 67 },
  { x: 84, y: 72 },
  { x: 92, y: 76 },
];

function interpolateSpline(points: { x: number; y: number }[], t: number) {
  const n = points.length - 1;
  const clampedT = Math.max(0, Math.min(0.9999, t));
  const segment = clampedT * n;
  const index = Math.floor(segment);
  const localT = segment - index;

  const p0 = points[Math.max(0, index - 1)];
  const p1 = points[index];
  const p2 = points[Math.min(n, index + 1)];
  const p3 = points[Math.min(n, index + 2)];

  const t2 = localT * localT;
  const t3 = t2 * localT;

  const x =
    0.5 *
    (2 * p1.x +
      (-p0.x + p2.x) * localT +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

  const y =
    0.5 *
    (2 * p1.y +
      (-p0.y + p2.y) * localT +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

  return { x, y };
}

export const CinematicInfinityMigration: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStageIdx, setActiveStageIdx] = useState(2); // AI Quantum Core
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Auto-cycle through stages for telemetry HUD ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStageIdx((prev) => (prev + 1) % STAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Subtle interactive mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ─── CONTINUOUS INFINITE 60 FPS CANVAS RENDERING ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // ── VIBRANT COLOR PALETTES FOR VM BLOCKS ──
    const BLOCK_PALETTES = [
      { fill: '#F59E0B', top: '#FEF08A', glow: 'rgba(245, 158, 11, 0.9)' }, // Amber Gold
      { fill: '#00F0FF', top: '#A5F3FC', glow: 'rgba(0, 240, 255, 0.9)' }, // Electric Cyan
      { fill: '#10B981', top: '#A7F3D0', glow: 'rgba(16, 185, 129, 0.9)' }, // Emerald
      { fill: '#3B82F6', top: '#BFDBFE', glow: 'rgba(59, 130, 246, 0.9)' }, // Sapphire
      { fill: '#D946EF', top: '#F5D0FE', glow: 'rgba(217, 70, 239, 0.9)' }, // Neon Magenta
      { fill: '#F97316', top: '#FED7AA', glow: 'rgba(249, 115, 22, 0.9)' }, // Solar Orange
      { fill: '#8B5CF6', top: '#EDE9FE', glow: 'rgba(139, 92, 246, 0.9)' }, // Ultra Violet
      { fill: '#00FF9D', top: '#D1FAE5', glow: 'rgba(0, 255, 157, 0.9)' }, // Cyber Green
    ];

    // Stream 1 blocks (Primary to Cloud)
    const STREAM1_COUNT = 24;
    const stream1Blocks = Array.from({ length: STREAM1_COUNT }, (_, i) => ({
      id: i,
      offset: i / STREAM1_COUNT,
      speed: 0.024,
      size: 16 + (i % 3) * 2,
      palette: BLOCK_PALETTES[i % BLOCK_PALETTES.length],
    }));

    // Stream 2 blocks (Secondary Bridge)
    const STREAM2_COUNT = 16;
    const stream2Blocks = Array.from({ length: STREAM2_COUNT }, (_, i) => ({
      id: i + 100,
      offset: i / STREAM2_COUNT,
      speed: 0.022,
      size: 14 + (i % 3) * 2,
      palette: BLOCK_PALETTES[(i + 3) % BLOCK_PALETTES.length],
    }));

    // Floating Ambient Dust Particles & Energy Embers
    const DUST_COUNT = 70;
    const dustParticles = Array.from({ length: DUST_COUNT }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.03,
      vy: -0.02 - Math.random() * 0.04,
      size: 1 + Math.random() * 2.2,
      opacity: 0.2 + Math.random() * 0.6,
      color: i % 3 === 0 ? '#00F0FF' : i % 3 === 1 ? '#FBBF24' : '#00FF9D',
    }));

    const startTime = performance.now();

    // ── RENDER FRAME ──
    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Helper to draw a moving 3D isometric cube
      const drawBlock = (
        progress: number,
        points: { x: number; y: number }[],
        size: number,
        palette: typeof BLOCK_PALETTES[0],
        isCloudBound: boolean
      ) => {
        const pt = interpolateSpline(points, progress);
        const px = (pt.x / 100) * width;
        const py = (pt.y / 100) * height;

        // Smooth fade at endpoints
        let alpha = 1.0;
        if (progress < 0.06) alpha = progress / 0.06;
        else if (progress > 0.94) alpha = (1 - progress) / 0.06;

        // Dynamic scale during right-sizing (between x: 50% and 70%)
        let scale = 1.0;
        if (isCloudBound && progress >= 0.55 && progress <= 0.8) {
          const compT = (progress - 0.55) / 0.25;
          scale = 1.2 - compT * 0.4; // compacts down from 1.2 to 0.8
        } else if (isCloudBound && progress > 0.8) {
          scale = 0.82; // optimized compact cloud instance
        } else {
          scale = 1.15;
        }

        const s = size * scale;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Glowing Ion Trail
        const trailPt = interpolateSpline(points, Math.max(0, progress - 0.025));
        const tx = (trailPt.x / 100) * width;
        const ty = (trailPt.y / 100) * height;

        const grad = ctx.createLinearGradient(tx, ty, px, py);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, palette.glow);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s * 0.45;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Contact Drop Shadow
        ctx.beginPath();
        ctx.ellipse(px, py + s * 0.75, s * 0.8, s * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();

        // Left front face
        ctx.fillStyle = palette.fill;
        ctx.beginPath();
        ctx.moveTo(px - s * 0.55, py);
        ctx.lineTo(px, py + s * 0.32);
        ctx.lineTo(px, py + s * 0.85);
        ctx.lineTo(px - s * 0.55, py + s * 0.53);
        ctx.closePath();
        ctx.fill();

        // Right side face (darker for 3D realism)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.fill();

        ctx.fillStyle = palette.fill;
        ctx.beginPath();
        ctx.moveTo(px, py + s * 0.32);
        ctx.lineTo(px + s * 0.55, py);
        ctx.lineTo(px + s * 0.55, py + s * 0.53);
        ctx.lineTo(px, py + s * 0.85);
        ctx.closePath();
        ctx.fill();

        // Top glossy face
        ctx.fillStyle = palette.top;
        ctx.beginPath();
        ctx.moveTo(px, py - s * 0.32);
        ctx.lineTo(px + s * 0.55, py);
        ctx.lineTo(px, py + s * 0.32);
        ctx.lineTo(px - s * 0.55, py);
        ctx.closePath();
        ctx.fill();

        // Glowing Core Outline
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = palette.top;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Top Holographic Spec Beacon
        ctx.beginPath();
        ctx.arc(px, py, s * 0.14, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.restore();
      };

      // ── DRAW STREAM 2 (SECONDARY BRIDGE) ──
      stream2Blocks.forEach((b) => {
        const prog = ((elapsed * b.speed + b.offset) % 1 + 1) % 1;
        drawBlock(prog, SECONDARY_PATH, b.size, b.palette, false);
      });

      // ── DRAW STREAM 1 (PRIMARY HIGHWAY TO GOOGLE CLOUD) ──
      // Sort by y for depth
      const sortedStream1 = [...stream1Blocks].sort((a, b) => {
        const pA = ((elapsed * a.speed + a.offset) % 1 + 1) % 1;
        const pB = ((elapsed * b.speed + b.offset) % 1 + 1) % 1;
        return interpolateSpline(PRIMARY_PATH, pA).y - interpolateSpline(PRIMARY_PATH, pB).y;
      });

      sortedStream1.forEach((b) => {
        const prog = ((elapsed * b.speed + b.offset) % 1 + 1) % 1;
        drawBlock(prog, PRIMARY_PATH, b.size, b.palette, true);
      });

      // ── CENTRAL QUANTUM CUBE ENERGY PULSES (x: 61.5%, y: 56.5%) ──
      const cubeX = (61.5 / 100) * width;
      const cubeY = (56.5 / 100) * height;

      ctx.save();
      for (let i = 0; i < 2; i++) {
        const pulse = (elapsed * 1.5 + i * 0.5) % 1;
        ctx.beginPath();
        ctx.arc(cubeX, cubeY, 15 + pulse * 45, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(0, 1 - pulse) * 0.6})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 14;
        ctx.stroke();
      }
      ctx.restore();

      // ── GOOGLE CLOUD RAINBOW ENERGY CONDUIT PULSES (x: 82.5%, y: 34%) ──
      const cloudX = (82.5 / 100) * width;
      const cloudY = (34 / 100) * height;

      ctx.save();
      const rainbow = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
      for (let i = 0; i < 4; i++) {
        const cProg = (elapsed * 1.8 + i * 0.25) % 1;
        const cx = cloudX - 35 + i * 22;
        const cy = cloudY + 45 - cProg * 65;
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = rainbow[i];
        ctx.shadowColor = rainbow[i];
        ctx.shadowBlur = 12;
        ctx.fill();
      }

      // Top Cloud Aura Bloom
      const cloudGlow = (Math.sin(elapsed * 2) + 1) / 2;
      ctx.beginPath();
      ctx.arc(cloudX, cloudY - 20, 60, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(66, 133, 244, ${0.05 + cloudGlow * 0.05})`;
      ctx.filter = 'blur(16px)';
      ctx.fill();
      ctx.restore();

      // ── AMBIENT CYBER MOTES & PARTICLES ──
      ctx.save();
      dustParticles.forEach((p) => {
        p.x = (p.x + p.vx + 100) % 100;
        p.y = (p.y + p.vy + 100) % 100;
        const px = (p.x / 100) * width;
        const py = (p.y / 100) * height;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
      });
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const activeStage = STAGES[activeStageIdx];

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none bg-[#050A18]">
      {/* ── 1. ULTRA HIGH-DEFINITION PANORAMIC BASE VISUAL WORLD ── */}
      <img
        src={nexusMigrationScene}
        alt="NEXUS Migration Infrastructure"
        loading="eager"
        decoding="sync"
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out select-none pointer-events-none"
        style={{
          transform: `scale(1.025) translate(${mousePos.x * -7}px, ${mousePos.y * -5}px)`,
          backgroundColor: '#050A18',
        }}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src.indexOf('backgrounds') === -1 && target.src.indexOf('/nexus-migration-scene.jpg') === -1) {
            target.src = '/backgrounds/nexus-migration-scene.jpg';
          } else if (target.src.indexOf('/nexus-migration-scene.jpg') === -1) {
            target.src = '/nexus-migration-scene.jpg';
          }
        }}
      />

      {/* ── 2. SUBTLE COLOR GRADE & HORIZONTAL VIGNETTE ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050A18]/65 via-transparent to-[#050A18]/30 pointer-events-none" />

      {/* ── 3. REAL-TIME 60 FPS CONTINUOUS MOTION CANVAS ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
      />

      {/* ── 4. INTERACTIVE STAGE BEACONS & TOOLTIPS ── */}
      <div className="absolute inset-0 z-20 pointer-events-auto">
        {STAGES.map((s, idx) => {
          const isActive = idx === activeStageIdx;
          return (
            <div
              key={s.id}
              onClick={() => setActiveStageIdx(idx)}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group`}
            >
              {/* Outer pulsing ring */}
              <div
                className={`relative flex items-center justify-center transition-transform duration-300 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
              >
                <span
                  className="animate-ping absolute inline-flex h-8 w-8 rounded-full opacity-40"
                  style={{ backgroundColor: s.color }}
                />
                <span
                  className="relative inline-flex rounded-full h-4 w-4 border-2 border-white/95 shadow-lg"
                  style={{
                    backgroundColor: s.color,
                    boxShadow: `0 0 18px ${s.color}`,
                  }}
                />
              </div>

              {/* Hover Tooltip Card */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 bottom-7 w-48 px-3 py-2 rounded-xl bg-[#081026]/90 backdrop-blur-xl border border-cyan-400/30 shadow-2xl transition-all duration-300 pointer-events-none ${
                  isActive
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-2 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    {s.num}
                  </span>
                  <span className="text-[11px] font-bold text-white tracking-wide">
                    {s.title}
                  </span>
                </div>
                <p className="text-[9px] text-slate-300 leading-tight mb-1.5">
                  {s.subtitle}
                </p>
                <div className="space-y-0.5">
                  {s.status.map((item, i) => (
                    <div key={i} className="flex items-center gap-1 text-[8px] text-cyan-400 font-mono">
                      <span className="w-1 h-1 rounded-full bg-cyan-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 5. TOP-RIGHT LIVE STATUS PILL ── */}
      <div className="absolute top-6 right-8 z-30 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#081026]/80 backdrop-blur-xl border border-cyan-400/30 shadow-xl shadow-cyan-950/60 text-xs font-semibold text-slate-200 pointer-events-auto">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-sm shadow-emerald-400"></span>
        </span>
        <span className="tracking-wider uppercase text-[11px] text-slate-300 font-mono">
          CONTINUOUS MIGRATION PIPELINE
        </span>
        <span className="text-slate-600">|</span>
        <span className="font-mono text-cyan-400 font-bold text-[11px]">
          41 ACTIVE WORKLOADS
        </span>
      </div>

      {/* ── 6. BOTTOM-CENTER INTERACTIVE STAGE STEPPER ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 px-6 py-3 rounded-full bg-[#081026]/85 backdrop-blur-xl border border-cyan-400/30 shadow-2xl shadow-cyan-950/80 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: activeStage.color, boxShadow: `0 0 10px ${activeStage.color}` }}
          />
          <span className="text-xs font-black tracking-wider text-white">
            STAGE {activeStage.num}: {activeStage.title}
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            — {activeStage.subtitle}
          </span>
        </div>

        {/* Clickable Stage Stepper Indicators */}
        <div className="flex items-center gap-1.5 ml-2">
          {STAGES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveStageIdx(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeStageIdx
                  ? 'w-7 bg-cyan-400 shadow-sm shadow-cyan-400'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Stage ${s.num}: ${s.title}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
