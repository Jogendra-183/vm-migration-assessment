import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface PathDefinition {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
  speed: number;
  color: string;
}

export const CinematicMigrationScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Parallax mouse tracker
  useEffect(() => {
    if (isReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMouseOffset({
        x: Math.max(-1, Math.min(1, normX)) * 12,
        y: Math.max(-1, Math.min(1, normY)) * 12,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isReducedMotion]);

  // Main 60FPS Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;

    // Handle high DPI
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth || 800;
      const height = canvas.clientHeight || 700;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Cubic Bezier interpolation: B(t)
    const getCubicBezierPoint = (
      p0: Point,
      p1: Point,
      p2: Point,
      p3: Point,
      t: number
    ): Point => {
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;

      return {
        x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
        y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
      };
    };

    // Draw 3D Isometric VM Cube
    const drawIsometricCube = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      alpha: number,
      glowColor: string,
      scale = 1
    ) => {
      if (alpha <= 0.01) return;
      context.save();
      context.globalAlpha = Math.max(0, Math.min(1, alpha));
      context.translate(x, y);
      context.scale(scale, scale);

      const w = size;
      const h = size * 0.58; // isometric squish
      const depth = size * 0.75;

      // Outer luminous glow
      const glowGrad = context.createRadialGradient(0, 0, 2, 0, 0, size * 2.2);
      glowGrad.addColorStop(0, glowColor);
      glowGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      context.fillStyle = glowGrad;
      context.beginPath();
      context.arc(0, 0, size * 2.2, 0, Math.PI * 2);
      context.fill();

      // Top Face
      context.beginPath();
      context.moveTo(0, -depth - h);
      context.lineTo(w, -depth);
      context.lineTo(0, -depth + h);
      context.lineTo(-w, -depth);
      context.closePath();
      const topGrad = context.createLinearGradient(-w, -depth - h, w, -depth + h);
      topGrad.addColorStop(0, '#67E8F9'); // Electric Cyan
      topGrad.addColorStop(1, '#22D3EE');
      context.fillStyle = topGrad;
      context.fill();
      context.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      context.lineWidth = 1.2;
      context.stroke();

      // Left Face
      context.beginPath();
      context.moveTo(-w, -depth);
      context.lineTo(0, -depth + h);
      context.lineTo(0, h);
      context.lineTo(-w, 0);
      context.closePath();
      const leftGrad = context.createLinearGradient(-w, -depth, 0, h);
      leftGrad.addColorStop(0, '#06B6D4');
      leftGrad.addColorStop(1, '#0E7490');
      context.fillStyle = leftGrad;
      context.fill();
      context.strokeStyle = 'rgba(34, 211, 238, 0.6)';
      context.lineWidth = 1;
      context.stroke();

      // Right Face
      context.beginPath();
      context.moveTo(0, -depth + h);
      context.lineTo(w, -depth);
      context.lineTo(w, 0);
      context.lineTo(0, h);
      context.closePath();
      const rightGrad = context.createLinearGradient(0, -depth + h, w, 0);
      rightGrad.addColorStop(0, '#0891B2');
      rightGrad.addColorStop(1, '#0F172A');
      context.fillStyle = rightGrad;
      context.fill();
      context.strokeStyle = 'rgba(20, 184, 166, 0.6)';
      context.lineWidth = 1;
      context.stroke();

      // Center Core Micro-Light
      context.beginPath();
      context.arc(0, -depth, 2, 0, Math.PI * 2);
      context.fillStyle = '#FFFFFF';
      context.fill();

      context.restore();
    };

    let startTime: number | null = null;
    let lastRenderTime = 0;

    // The render loop
    const render = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = (currentTime - startTime) * 0.001; // seconds

      if (isVisible && (!isReducedMotion || currentTime - lastRenderTime > 200)) {
        lastRenderTime = currentTime;
        const w = canvas.clientWidth || 800;
        const h = canvas.clientHeight || 700;

        ctx.clearRect(0, 0, w, h);

        // Responsive coordinates
        // Source Racks: bottom-left region
        const rackX = w * 0.22;
        const rackY = h * 0.72;

        // Destination Cloud: top-right region
        const cloudX = w * 0.76;
        const cloudY = h * 0.26;

        // 4 Multi-tier migration pathways
        const paths: PathDefinition[] = [
          // Path 0: Main High-Throughput Highway
          {
            p0: { x: rackX + 10, y: rackY - 90 },
            p1: { x: rackX + w * 0.22, y: rackY - 240 },
            p2: { x: cloudX - w * 0.26, y: cloudY + 90 },
            p3: { x: cloudX - 25, y: cloudY + 30 },
            speed: 0.075, // ~13.3s cycle
            color: 'rgba(6, 182, 212, 0.85)',
          },
          // Path 1: Database & Memory Tier (Sweeping Upper Arch)
          {
            p0: { x: rackX - 35, y: rackY - 120 },
            p1: { x: rackX + w * 0.12, y: rackY - 330 },
            p2: { x: cloudX - w * 0.16, y: cloudY - 70 },
            p3: { x: cloudX + 30, y: cloudY - 20 },
            speed: 0.058, // ~17.2s cycle
            color: 'rgba(20, 184, 166, 0.85)',
          },
          // Path 2: Low-Latency Direct Pipeline (Lower direct curve)
          {
            p0: { x: rackX + 50, y: rackY - 60 },
            p1: { x: rackX + w * 0.28, y: rackY - 140 },
            p2: { x: cloudX - w * 0.32, y: cloudY + 160 },
            p3: { x: cloudX - 55, y: cloudY + 70 },
            speed: 0.092, // ~10.8s cycle
            color: 'rgba(56, 189, 248, 0.85)',
          },
          // Path 3: Background Storage Synchronization (Gentle deep curve)
          {
            p0: { x: rackX - 70, y: rackY - 80 },
            p1: { x: rackX + w * 0.08, y: rackY - 260 },
            p2: { x: cloudX - w * 0.2, y: cloudY + 40 },
            p3: { x: cloudX + 15, y: cloudY + 60 },
            speed: 0.065, // ~15.3s cycle
            color: 'rgba(139, 92, 246, 0.75)',
          },
        ];

        // 1. Draw Migration Pathways with Glowing Dash Strokes
        paths.forEach((path, pathIdx) => {
          // Soft outer atmospheric glow line
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(path.p0.x, path.p0.y);
          ctx.bezierCurveTo(path.p1.x, path.p1.y, path.p2.x, path.p2.y, path.p3.x, path.p3.y);
          ctx.strokeStyle = path.color.replace('0.85', '0.12').replace('0.75', '0.1');
          ctx.lineWidth = 6;
          ctx.stroke();

          // Main sleek core path
          ctx.strokeStyle = path.color.replace('0.85', '0.4').replace('0.75', '0.35');
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Animated continuous dash flow
          ctx.strokeStyle = path.color;
          ctx.lineWidth = 2.2;
          ctx.setLineDash([8, 14]);
          ctx.lineDashOffset = -(elapsed * 45 * (pathIdx % 2 === 0 ? 1 : 1.15));
          ctx.stroke();
          ctx.restore();

          // 2. Continuous Signal Photons on this path (Multiple seamless particles)
          const photonCount = 7;
          for (let i = 0; i < photonCount; i++) {
            // Constant wrapping progress in [0, 1)
            const t = ((elapsed * path.speed * 2.2 + i / photonCount) % 1 + 1) % 1;
            const pt = getCubicBezierPoint(path.p0, path.p1, path.p2, path.p3, t);

            // Smooth alpha fade at endpoints: zero pop or abrupt jump
            let alpha = 1;
            if (t < 0.1) alpha = t / 0.1;
            else if (t > 0.9) alpha = (1 - t) / 0.1;

            ctx.save();
            ctx.globalAlpha = alpha * 0.85;
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = path.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // 3. VM CUBES: Multiple 3D cubes staggered along the path
          // On Path 0: 3 cubes
          // On Path 1: 2 cubes
          // On Path 2: 2 cubes
          const cubesOnPath = pathIdx === 0 ? 3 : 2;
          for (let c = 0; c < cubesOnPath; c++) {
            const offset = c / cubesOnPath;
            // Continuous loop parameter in [0, 1)
            const t = ((elapsed * path.speed + offset) % 1 + 1) % 1;
            const pt = getCubicBezierPoint(path.p0, path.p1, path.p2, path.p3, t);

            // Natural vertical floating wave
            const floatOffset = Math.sin(elapsed * 2.5 + c * 2 + pathIdx) * 4;

            // Smooth fade-in at source rack and smooth fade-out into cloud cluster
            let cubeAlpha = 1;
            let cubeScale = 1;

            if (t < 0.12) {
              // Emerging from rack blade
              cubeAlpha = t / 0.12;
              cubeScale = 0.6 + 0.4 * (t / 0.12);
            } else if (t > 0.88) {
              // Absorbing into cloud platform
              cubeAlpha = (1 - t) / 0.12;
              cubeScale = 1.0 - 0.3 * ((t - 0.88) / 0.12);

              // Arrival ripple ring at destination node
              const rippleProgress = (t - 0.88) / 0.12;
              ctx.save();
              ctx.beginPath();
              ctx.ellipse(
                path.p3.x,
                path.p3.y,
                14 * rippleProgress,
                7 * rippleProgress,
                0,
                0,
                Math.PI * 2
              );
              ctx.strokeStyle = `rgba(20, 184, 166, ${1 - rippleProgress})`;
              ctx.lineWidth = 1.5;
              ctx.stroke();
              ctx.restore();
            }

            // Draw VM Cube with particle trail
            // Draw small particle trail behind the cube
            if (cubeAlpha > 0.1) {
              const prevT = Math.max(0, t - 0.025);
              const prevPt = getCubicBezierPoint(path.p0, path.p1, path.p2, path.p3, prevT);
              ctx.save();
              ctx.globalAlpha = cubeAlpha * 0.4;
              ctx.beginPath();
              ctx.moveTo(prevPt.x, prevPt.y + floatOffset);
              ctx.lineTo(pt.x, pt.y + floatOffset);
              ctx.strokeStyle = '#22D3EE';
              ctx.lineWidth = 3;
              ctx.stroke();
              ctx.restore();
            }

            drawIsometricCube(
              ctx,
              pt.x,
              pt.y + floatOffset,
              12,
              cubeAlpha,
              'rgba(6, 182, 212, 0.4)',
              cubeScale
            );
          }
        });

        // 4. Subtle ambient floating dust particles for cinematic depth
        const ambientCount = 20;
        for (let i = 0; i < ambientCount; i++) {
          const px = ((i * 137.5 + elapsed * 12) % w + w) % w;
          const py = ((i * 83.1 + Math.sin(elapsed * 0.4 + i) * 35 + i * 29) % h + h) % h;
          const a = (Math.sin(elapsed * 1.5 + i) * 0.5 + 0.5) * 0.25;

          ctx.save();
          ctx.globalAlpha = a;
          ctx.fillStyle = i % 2 === 0 ? '#22D3EE' : '#14B8A6';
          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (!isReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[600px] overflow-hidden bg-slate-950 select-none"
      style={{
        transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      {/* 1. Deep Atmospheric Background & Luminous Gradients */}
      <div className="absolute inset-0 bg-[#060913] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* 2. Isometric Perspective Grid Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="isometricGrid"
            width="60"
            height="34.64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M30 0 L60 17.32 L30 34.64 L0 17.32 Z"
              fill="none"
              stroke="rgba(34, 211, 238, 0.25)"
              strokeWidth="0.8"
            />
            <path
              d="M30 0 L30 34.64"
              fill="none"
              stroke="rgba(34, 211, 238, 0.1)"
              strokeWidth="0.5"
            />
          </pattern>
          <linearGradient id="gridFade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#000" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#isometricGrid)" />
      </svg>

      {/* 3. HTML5 High-Performance Canvas for Flowing Bezier Highways & 3D Isometric VM Cubes */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
      />

      {/* 4. Physical Source Infrastructure: Graphite Server Racks (Bottom-Left) */}
      <div className="absolute bottom-[8%] left-[6%] z-20 pointer-events-none">
        <div className="relative group">
          {/* Subtle Ground Shadow & Occlusion */}
          <div className="absolute -bottom-8 -left-8 w-80 h-32 bg-cyan-950/60 rounded-full blur-2xl transform -rotate-12 pointer-events-none" />

          {/* Isometric Server Racks Cluster */}
          <div className="flex items-end gap-3.5 transform -rotate-2">
            {/* Primary Enterprise Blade Rack 1 */}
            <div className="relative w-44 rounded-xl bg-gradient-to-b from-slate-900 via-slate-950 to-[#0B0F19] border border-cyan-500/40 shadow-2xl p-3 backdrop-blur-md overflow-hidden">
              {/* Metallic Edge Chamfer Highlight */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
              <div className="absolute left-0 inset-y-0 w-[1px] bg-gradient-to-b from-cyan-500/50 via-transparent to-transparent" />

              {/* Infinite Vertical Cyan Laser Scanning Beam */}
              <div className="absolute inset-x-0 h-6 bg-gradient-to-b from-cyan-400/0 via-cyan-400/25 to-cyan-400/0 border-y border-cyan-400/60 pointer-events-none animate-scanner-beam" />

              {/* Rack Header & Technical ID */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[9px] font-mono font-bold tracking-wider text-cyan-300">
                    RACK-SRC-01
                  </span>
                </div>
                <span className="text-[8px] font-mono text-slate-500">42U HYPERVISOR</span>
              </div>

              {/* Server Blades with Asynchronous Micro-LEDs */}
              <div className="space-y-1.5">
                {[1, 2, 3, 4, 5, 6].map((blade) => (
                  <div
                    key={blade}
                    className="p-1.5 rounded bg-slate-950/90 border border-slate-800 flex items-center justify-between hover:border-cyan-500/30 transition-all"
                  >
                    {/* Drive Bay Slits */}
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-2.5 rounded-sm bg-slate-800" />
                      <div className="w-1.5 h-2.5 rounded-sm bg-slate-800" />
                      <div className="w-1.5 h-2.5 rounded-sm bg-slate-800" />
                      <div className="w-1.5 h-2.5 rounded-sm bg-slate-800" />
                      <span className="text-[8px] font-mono text-slate-400 ml-1">
                        BLADE-0{blade}
                      </span>
                    </div>

                    {/* Multi-frequency asynchronous status LEDs */}
                    <div className="flex items-center space-x-1">
                      <span
                        className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"
                        style={{ animationDuration: `${1.2 + blade * 0.3}s` }}
                      />
                      <span
                        className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"
                        style={{ animationDuration: `${0.9 + blade * 0.4}s` }}
                      />
                      <span
                        className="w-1 h-1 rounded-full bg-teal-300 animate-pulse"
                        style={{ animationDuration: `${1.5 + blade * 0.2}s` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Rack Base Ventilation Grille */}
              <div className="mt-2.5 pt-1.5 border-t border-slate-800/80 flex justify-between items-center text-[8px] font-mono text-slate-500">
                <span>INTAKE: 18°C</span>
                <span className="text-cyan-400 font-semibold">LOAD: 78%</span>
              </div>
            </div>

            {/* Secondary Storage Rack 2 (Offset in depth) */}
            <div className="relative w-36 rounded-xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-[#0B0F19] border border-slate-800/80 shadow-xl p-2.5 backdrop-blur-md hidden sm:block">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
                <span className="text-[8px] font-mono font-bold text-teal-400">SAN-STORAGE</span>
                <span className="text-[7px] font-mono text-slate-500">NVMe POOL</span>
              </div>
              <div className="space-y-1">
                {[1, 2, 3, 4].map((tier) => (
                  <div
                    key={tier}
                    className="p-1 rounded bg-slate-950 border border-slate-800/60 flex items-center justify-between"
                  >
                    <div className="h-1.5 w-12 bg-slate-800 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-teal-400/70"
                        style={{ width: `${55 + tier * 10}%` }}
                      />
                    </div>
                    <span
                      className="w-1 h-1 rounded-full bg-teal-400 animate-ping"
                      style={{ animationDuration: `${2 + tier * 0.5}s` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Source Label Floating Pill */}
          <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono shadow-lg backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>SOURCE: On-Premises Hypervisor Fleet (41 Nodes)</span>
          </div>
        </div>
      </div>

      {/* 5. Destination Cloud Infrastructure: Google Cloud Compute Cluster (Top-Right) */}
      <div className="absolute top-[8%] right-[6%] z-20 pointer-events-none">
        <div className="relative group flex flex-col items-end">
          {/* Subtle Ambient Cloud Aura */}
          <div className="absolute -top-10 -right-10 w-96 h-56 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Elevated Multi-Tier Geometric Cloud Platform */}
          <div className="relative w-80 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-[#0F1626] border border-teal-500/40 p-4 shadow-2xl backdrop-blur-xl space-y-3">
            {/* Luminous Top Edge */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-90" />

            {/* Cloud Cluster Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-black tracking-wider text-slate-100 flex items-center gap-1.5">
                    GOOGLE CLOUD COMPUTE ENGINE
                    <span className="text-[8px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                      TARGET
                    </span>
                  </div>
                  <div className="text-[8px] font-mono text-teal-400/80">Region: us-central1 (Iowa)</div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Target GCE Virtual Machine Instances Grid */}
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
              {/* Instance 1 */}
              <div className="p-2 rounded-lg bg-slate-950/80 border border-teal-500/30 flex flex-col justify-between space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">e2-standard-4</span>
                  <span className="text-[7px] px-1 rounded bg-emerald-500/20 text-emerald-300">ACTIVE</span>
                </div>
                <div className="text-[8px] text-slate-400">4 vCPU • 16 GB RAM</div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 animate-pulse w-3/4" />
                </div>
              </div>

              {/* Instance 2 */}
              <div className="p-2 rounded-lg bg-slate-950/80 border border-teal-500/30 flex flex-col justify-between space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">n2-standard-8</span>
                  <span className="text-[7px] px-1 rounded bg-emerald-500/20 text-emerald-300">READY</span>
                </div>
                <div className="text-[8px] text-slate-400">8 vCPU • 32 GB RAM</div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 animate-pulse w-1/2" />
                </div>
              </div>

              {/* Instance 3 */}
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">c2-standard-16</span>
                  <span className="text-[7px] px-1 rounded bg-cyan-500/20 text-cyan-300">OPTIMIZED</span>
                </div>
                <div className="text-[8px] text-slate-400">16 vCPU • 64 GB RAM</div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 animate-pulse w-4/5" />
                </div>
              </div>

              {/* Instance 4 */}
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">GCP Persistent Disk</span>
                  <span className="text-[7px] px-1 rounded bg-teal-500/20 text-teal-300">SYNCED</span>
                </div>
                <div className="text-[8px] text-slate-400">SSD pd-balanced • IOPS 3.5k</div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-full" />
                </div>
              </div>
            </div>

            {/* Cloud Capacity Status */}
            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[8px] font-mono text-slate-400">
              <span>SECURITY: TLS 1.3 IN-FLIGHT</span>
              <span className="text-emerald-400 font-semibold">99.99% SLA UPTIME</span>
            </div>
          </div>

          {/* Destination Badge Pill */}
          <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-teal-500/30 text-teal-300 text-[10px] font-mono shadow-lg backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>DESTINATION: Google Cloud Platform Compute Engine</span>
          </div>
        </div>
      </div>

      {/* 6. Live Telemetry HUD Strip (Center Top) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden lg:flex items-center space-x-4 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md text-[10px] font-mono text-slate-400 shadow-xl">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-300 font-semibold">PIPELINE: ACTIVE</span>
        </div>
        <span className="text-slate-600">|</span>
        <span>MIGRATING: 41 WORKLOADS</span>
        <span className="text-slate-600">|</span>
        <span>FLOW RATE: 10.4 GB/s</span>
        <span className="text-slate-600">|</span>
        <span className="text-emerald-400">PACKET LOSS: 0.00%</span>
      </div>
    </div>
  );
};
