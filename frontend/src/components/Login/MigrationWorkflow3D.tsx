import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// ─── COLOR PALETTE (Futuristic Deep Midnight Cyberpunk & Google Cloud) ────────
const PALETTE = {
  // Midnight Space & Cyberpunk Gradients
  spaceBg: '#050A18',
  platformBase: '#080E24',
  platformDeck: '#0F1A3A',
  platformRim: '#1E2D5A',
  circuitGrid: '#1E294B',
  circuitGlow: '#00F0FF',

  // Spectrum Accents
  cyan: '#00F0FF',
  neonBlue: '#3B82F6',
  deepBlue: '#1D4ED8',
  violet: '#8B5CF6',
  magenta: '#D946EF',
  emerald: '#10B981',
  neonGreen: '#00FF9D',
  amber: '#F59E0B',
  orange: '#F97316',
  crimson: '#EF4444',
  gold: '#FBBF24',

  // Google Cloud Signature Brand Colors
  gcpBlue: '#4285F4',
  gcpRed: '#EA4335',
  gcpYellow: '#FBBC05',
  gcpGreen: '#34A853',
};

// ─── 6 MASTER STAGES ───────────────────────────────────────────────────────────
// Physical Servers → Discovery → Data Cleaning → Security Scanning → AI Optimization → Google Cloud Migration
export interface StageMeta {
  id: string;
  index: number;
  name: string;
  subtitle: string;
  color: string;
  pos: [number, number, number];
}

export const MIGRATION_STAGES: StageMeta[] = [
  { id: 'source', index: 0, name: 'PHYSICAL SERVERS', subtitle: 'On-Prem Server Blades & Telemetry', color: PALETTE.cyan, pos: [-6.8, 0.7, -3.2] },
  { id: 'discovery', index: 1, name: 'DISCOVERY SCAN', subtitle: 'Workload & Network Topology Ingestion', color: PALETTE.neonBlue, pos: [-2.4, 0.5, -3.0] },
  { id: 'cleaning', index: 2, name: 'DATA CLEANING', subtitle: 'Debris Filtration & Config Sanitization', color: PALETTE.emerald, pos: [2.2, 0.3, -2.6] },
  { id: 'security', index: 3, name: 'SECURITY SCANNING', subtitle: 'Laser Grid Vulnerability & Policy Check', color: PALETTE.magenta, pos: [6.4, 0.0, -1.2] },
  { id: 'optimization', index: 4, name: 'AI OPTIMIZATION', subtitle: 'Right-Sizing & Instance Compaction', color: PALETTE.amber, pos: [4.4, -0.3, 2.0] },
  { id: 'pipeline', index: 5, name: 'MIGRATION CONDUIT', subtitle: 'High-Throughput Quantum Conduit', color: PALETTE.violet, pos: [-0.6, -0.5, 2.4] },
  { id: 'gcp', index: 6, name: 'GOOGLE CLOUD', subtitle: 'Compute Engine Destination Matrix', color: PALETTE.gcpGreen, pos: [-6.4, -0.7, 2.6] },
];

// ─── SMOOTH 3D SPLINE PATHWAY ─────────────────────────────────────────────────
function createMigrationSpline(): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [
    // 0. Physical Server Racks: brick emerges from server blade bay
    new THREE.Vector3(-6.8, 1.25, -3.2),
    new THREE.Vector3(-5.4, 1.2, -3.2),
    // Pathway to Discovery
    new THREE.Vector3(-4.0, 1.1, -3.1),
    // 1. Through Discovery scanner rings
    new THREE.Vector3(-2.4, 1.0, -3.0),
    // Pathway to Cleaning
    new THREE.Vector3(-0.2, 0.9, -2.8),
    // 2. Through Cleaning transparent chamber
    new THREE.Vector3(2.2, 0.8, -2.6),
    // Pathway to Security scanning
    new THREE.Vector3(4.5, 0.7, -2.0),
    // 3. Security laser grid platform
    new THREE.Vector3(6.4, 0.55, -1.2),
    // Sweeping high-speed banked U-Turn from top row to bottom row
    new THREE.Vector3(7.4, 0.75, 0.4),
    new THREE.Vector3(6.6, 0.65, 1.6),
    // 4. AI Optimization compression chamber
    new THREE.Vector3(4.4, 0.25, 2.0),
    // Pathway to Migration Conduit
    new THREE.Vector3(1.9, 0.1, 2.2),
    // 5. High-Throughput Migration Conduit
    new THREE.Vector3(-0.6, -0.05, 2.4),
    // High-speed acceleration curve to GCP
    new THREE.Vector3(-3.5, -0.15, 2.5),
    // 6. Enters Google Cloud Destination
    new THREE.Vector3(-6.4, -0.25, 2.6),
  ];

  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.25);
}

// ─── CYBERNETIC PLATFORM BASE ─────────────────────────────────────────────────
function CyberPlatform({
  width = 3.2,
  depth = 2.4,
  height = 0.5,
  accentColor = PALETTE.cyan,
  stageNum = '01',
  name = '',
}: {
  width?: number;
  depth?: number;
  height?: number;
  accentColor?: string;
  stageNum?: string;
  name?: string;
}) {
  return (
    <group>
      {/* Ground Contact Glow Inset */}
      <mesh position={[0, -height * 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 1.35, depth * 1.35]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.14}
          depthWrite={false}
        />
      </mesh>

      {/* Heavy Midnight Armor Chassis Base */}
      <RoundedBox
        args={[width + 0.15, height * 0.45, depth + 0.15]}
        radius={0.08}
        smoothness={4}
        position={[0, -height * 0.25, 0]}
      >
        <meshStandardMaterial
          color={PALETTE.platformBase}
          roughness={0.3}
          metalness={0.8}
        />
      </RoundedBox>

      {/* Cybernetic Deck with Inset Glow */}
      <RoundedBox
        args={[width, height * 0.65, depth]}
        radius={0.06}
        smoothness={4}
        position={[0, height * 0.15, 0]}
      >
        <meshStandardMaterial
          color={PALETTE.platformDeck}
          roughness={0.2}
          metalness={0.7}
        />
      </RoundedBox>

      {/* Neon Edge Trim Lining */}
      <mesh position={[0, height * 0.49, depth * 0.44]}>
        <boxGeometry args={[width * 0.8, 0.02, 0.05]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={3.0}
        />
      </mesh>

      {/* Rear Edge Accent Line */}
      <mesh position={[0, height * 0.49, -depth * 0.44]}>
        <boxGeometry args={[width * 0.8, 0.02, 0.05]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1.8}
        />
      </mesh>

      {/* Corner Hex Cyber Anchors */}
      {[
        [-width * 0.42, depth * 0.4],
        [width * 0.42, depth * 0.4],
        [-width * 0.42, -depth * 0.4],
        [width * 0.42, -depth * 0.4],
      ].map(([cx, cz], ci) => (
        <mesh key={ci} position={[cx, height * 0.5, cz]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 6]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={2.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── STAGE 1: PHYSICAL SERVER RACKS & DISCOVERY ───────────────────────────────
function StageServerRacks() {
  const laserScannerRef = useRef<THREE.Mesh>(null);
  const fanRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (laserScannerRef.current) {
      laserScannerRef.current.position.y = 0.5 + Math.sin(t * 2.2) * 0.5;
    }
    if (fanRef.current) {
      fanRef.current.rotation.z = t * 6.0;
    }
  });

  return (
    <group position={[0, 0.25, 0]}>
      {/* 3 Towering Enterprise 42U Server Cabinets */}
      {[-0.9, 0, 0.9].map((rx, rIdx) => (
        <group key={rIdx} position={[rx, 0.75, -0.2]}>
          {/* Main Chassis Cabinet */}
          <RoundedBox args={[0.7, 1.5, 0.8]} radius={0.04} smoothness={3}>
            <meshStandardMaterial
              color="#040816"
              metalness={0.9}
              roughness={0.2}
            />
          </RoundedBox>

          {/* Glowing Metallic Vertical Rails */}
          {[-0.34, 0.34].map((lx, lIdx) => (
            <mesh key={lIdx} position={[lx, 0, 0.41]}>
              <boxGeometry args={[0.03, 1.45, 0.04]} />
              <meshStandardMaterial
                color="#00F0FF"
                emissive="#00F0FF"
                emissiveIntensity={1.8}
              />
            </mesh>
          ))}

          {/* 7 Hot-Swap Server Blade Modules per Rack */}
          {[0.55, 0.37, 0.19, 0.01, -0.17, -0.35, -0.53].map((by, bIdx) => (
            <group key={bIdx} position={[0, by, 0.42]}>
              {/* Blade Faceplate */}
              <mesh>
                <boxGeometry args={[0.62, 0.14, 0.02]} />
                <meshStandardMaterial color="#0A122C" metalness={0.8} roughness={0.3} />
              </mesh>
              {/* High-Density LED Indicator Array */}
              {[-0.24, -0.16, -0.08, 0, 0.08, 0.16, 0.24].map((lx, ledIdx) => {
                const ledColor =
                  (rIdx + bIdx + ledIdx) % 4 === 0
                    ? '#00F0FF'
                    : (rIdx + bIdx + ledIdx) % 4 === 1
                    ? '#00FF9D'
                    : (rIdx + bIdx + ledIdx) % 4 === 2
                    ? '#3B82F6'
                    : '#F59E0B';
                return (
                  <mesh key={ledIdx} position={[lx, 0, 0.012]}>
                    <boxGeometry args={[0.04, 0.04, 0.005]} />
                    <meshStandardMaterial
                      color={ledColor}
                      emissive={ledColor}
                      emissiveIntensity={2.8}
                    />
                  </mesh>
                );
              })}
            </group>
          ))}
        </group>
      ))}

      {/* Discovery Scanning Vertical Laser Plane Curtain */}
      <mesh ref={laserScannerRef} position={[0, 0.7, 0.24]}>
        <boxGeometry args={[2.7, 0.025, 0.04]} />
        <meshStandardMaterial
          color="#00F0FF"
          emissive="#00F0FF"
          emissiveIntensity={4.0}
        />
      </mesh>

      {/* Volumetric Holographic Discovery Scan Fan */}
      <mesh position={[0, 0.75, 0.23]}>
        <planeGeometry args={[2.7, 1.4]} />
        <meshBasicMaterial
          color="#00F0FF"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outgoing Workload Egress Runway */}
      <group position={[0.7, 0.02, 0.55]}>
        <mesh rotation={[0.22, 0, 0]}>
          <boxGeometry args={[0.8, 0.05, 1.0]} />
          <meshStandardMaterial color="#0A1128" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Dual Neon Track Rails */}
        {[-0.28, 0.28].map((tx, ti) => (
          <mesh key={ti} position={[tx, 0.04, 0]} rotation={[0.22, 0, 0]}>
            <boxGeometry args={[0.04, 0.03, 1.0]} />
            <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={3.0} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ─── STAGE 2: DISCOVERY & EXTRACTION CHAMBER ──────────────────────────────────
function StageDiscovery() {
  const torusRef1 = useRef<THREE.Mesh>(null);
  const torusRef2 = useRef<THREE.Mesh>(null);
  const ringRef3 = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (torusRef1.current) torusRef1.current.rotation.z = t * 2.0;
    if (torusRef2.current) torusRef2.current.rotation.z = -t * 2.5;
    if (ringRef3.current) ringRef3.current.rotation.y = t * 1.8;
    if (beamRef.current) beamRef.current.position.y = 0.5 + Math.sin(t * 3.5) * 0.25;
  });

  return (
    <group position={[0, 0.25, 0]}>
      {/* Heavy Cybernetic Arch Frame */}
      <group position={[0, 0.65, 0]}>
        {[-0.8, 0.8].map((px, pi) => (
          <mesh key={pi} position={[px, -0.1, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.9, 16]} />
            <meshStandardMaterial color="#0A122C" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        {/* Overhead Scanning Core */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.7, 0.12, 0.35]} />
          <meshStandardMaterial color="#050C20" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Rotating High-Speed Discovery Laser Rings */}
      <mesh ref={torusRef1} position={[0, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.55, 0.03, 12, 36]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={3.0} />
      </mesh>
      <mesh ref={torusRef2} position={[0, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.45, 0.02, 12, 32]} />
        <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={3.5} />
      </mesh>
      <mesh ref={ringRef3} position={[0, 0.6, 0]}>
        <torusGeometry args={[0.65, 0.015, 8, 36]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={2.5} />
      </mesh>

      {/* High-Intensity Laser Extraction Beam */}
      <mesh ref={beamRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[1.0, 0.02, 0.02]} />
        <meshStandardMaterial color="#60A5FA" emissive="#60A5FA" emissiveIntensity={4.5} />
      </mesh>

      {/* Floating Holographic Telemetry Packets */}
      {[0, 1, 2, 3, 4].map((i) => {
        const ang = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(ang) * 0.7, 0.6 + Math.sin(ang) * 0.25, Math.sin(ang) * 0.7]}>
            <octahedronGeometry args={[0.06]} />
            <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={3.0} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── STAGE 3: DATA CLEANING CHAMBER ───────────────────────────────────────────
function StageCleaning() {
  const scanCurtainRef = useRef<THREE.Mesh>(null);
  const particlesGroup = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (scanCurtainRef.current) {
      scanCurtainRef.current.position.x = Math.sin(t * 2.5) * 0.55;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 1.5;
    }
    if (particlesGroup.current) {
      particlesGroup.current.children.forEach((child, i) => {
        const pt = (t * 1.6 + i * 0.15) % 1;
        child.position.y = 0.35 + pt * 0.6;
        child.position.x = Math.sin(t * 2.5 + i) * 0.35;
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        mat.opacity = (1 - pt) * 0.9;
      });
    }
  });

  return (
    <group position={[0, 0.25, 0]}>
      {/* High-Tech Transparent Acrylic Decontamination Chamber */}
      <group position={[0, 0.55, 0]}>
        {/* Cylindrical Glass Tunnel Chamber */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.55, 0.55, 1.6, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#A7F3D0"
            transparent
            opacity={0.35}
            roughness={0.05}
            transmission={0.85}
            thickness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Dual High-Energy Teal Decontamination Laser Gates */}
        {[-0.7, 0.7].map((gx, gi) => (
          <group key={gi} position={[gx, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.57, 0.04, 12, 36]} />
              <meshStandardMaterial color="#0A1A2E" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.55, 0.02, 8, 36]} />
              <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={3.5} />
            </mesh>
          </group>
        ))}

        {/* Moving Teal Sanitizing Laser Curtain */}
        <mesh ref={scanCurtainRef} position={[0, 0, 0]}>
          <planeGeometry args={[0.03, 1.05]} />
          <meshStandardMaterial
            color="#00FF9D"
            emissive="#00FF9D"
            emissiveIntensity={4.0}
            transparent
            opacity={0.95}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Unwanted Particles Separating and Dissolving into thin air */}
        <group ref={particlesGroup}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <mesh key={i} position={[0, 0.3, 0]}>
              <tetrahedronGeometry args={[0.04]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#EF4444' : '#F59E0B'}
                emissive={i % 2 === 0 ? '#EF4444' : '#F59E0B'}
                emissiveIntensity={2.5}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

// ─── STAGE 4: SECURITY SCANNING & VULNERABILITY MESH ──────────────────────────
function StageSecurityScanning() {
  const gridLaserRef = useRef<THREE.Group>(null);
  const haloRingRef = useRef<THREE.Mesh>(null);
  const orbiterRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (haloRingRef.current) haloRingRef.current.rotation.x = t * 1.4;
    if (orbiterRef.current) orbiterRef.current.rotation.y = t * 1.8;
    if (gridLaserRef.current) {
      gridLaserRef.current.position.y = 0.55 + Math.sin(t * 3.0) * 0.25;
    }
  });

  return (
    <group position={[0, 0.25, 0]}>
      {/* Central Security Inspection Platform */}
      <group position={[0, 0.55, 0]}>
        {/* Holographic Security Halo Ring */}
        <mesh ref={haloRingRef} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.65, 0.025, 12, 40]} />
          <meshStandardMaterial color="#D946EF" emissive="#D946EF" emissiveIntensity={3.0} />
        </mesh>

        {/* Cross-Laser Security Scanning Grid */}
        <group ref={gridLaserRef}>
          {[-0.25, 0, 0.25].map((z, zi) => (
            <mesh key={zi} position={[0, 0, z]}>
              <boxGeometry args={[0.9, 0.015, 0.015]} />
              <meshStandardMaterial color="#EC4899" emissive="#EC4899" emissiveIntensity={3.5} />
            </mesh>
          ))}
          {[-0.25, 0, 0.25].map((x, xi) => (
            <mesh key={xi} position={[x, 0, 0]}>
              <boxGeometry args={[0.015, 0.015, 0.9]} />
              <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={3.5} />
            </mesh>
          ))}
        </group>

        {/* Orbiting Sentinel Security Probes with laser beams to center */}
        <group ref={orbiterRef}>
          {[0, 1, 2, 3].map((i) => {
            const angle = (i / 4) * Math.PI * 2;
            const sx = Math.cos(angle) * 0.85;
            const sz = Math.sin(angle) * 0.85;
            return (
              <group key={i} position={[sx, 0, sz]}>
                <mesh>
                  <sphereGeometry args={[0.07, 16, 16]} />
                  <meshStandardMaterial color="#A855F7" emissive="#A855F7" emissiveIntensity={3.0} />
                </mesh>
                <mesh position={[-sx / 2, 0, -sz / 2]} rotation={[0, -angle, 0]}>
                  <boxGeometry args={[0.85, 0.008, 0.008]} />
                  <meshStandardMaterial
                    color="#D946EF"
                    emissive="#D946EF"
                    emissiveIntensity={2.0}
                    transparent
                    opacity={0.7}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      </group>

      {/* Cybernetic Security Pass Lock Inset */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.1, 24]} />
        <meshStandardMaterial color="#0A1128" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.02, 24]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={3.0} />
      </mesh>
    </group>
  );
}

// ─── STAGE 5: AI OPTIMIZATION & RIGHT-SIZING ──────────────────────────────────
function StageAIOptimization() {
  const compressor1 = useRef<THREE.Mesh>(null);
  const compressor2 = useRef<THREE.Mesh>(null);
  const matrixPulseRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const compression = Math.sin(t * 3.0) * 0.14;
    if (compressor1.current) compressor1.current.position.z = -0.38 + compression;
    if (compressor2.current) compressor2.current.position.z = 0.38 - compression;
    if (matrixPulseRef.current) {
      const mat = matrixPulseRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 2.0 + Math.sin(t * 4.0) * 1.5;
    }
  });

  return (
    <group position={[0, 0.25, 0]}>
      {/* High-Tech AI Right-Sizing Compression Gantry */}
      <group position={[0, 0.55, 0]}>
        {/* Legacy Inflow Portal (Oversized, Bulky On-Prem Frame) */}
        <group position={[-0.65, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.12, 0.85, 0.85]} />
            <meshStandardMaterial color="#0A122C" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.06, 0, 0]}>
            <boxGeometry args={[0.02, 0.8, 0.8]} />
            <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={2.5} />
          </mesh>
        </group>

        {/* Dynamic Hydraulic AI Optimization Compaction Jaws */}
        <mesh ref={compressor1} position={[0, 0, -0.38]}>
          <boxGeometry args={[0.55, 0.45, 0.14]} />
          <meshStandardMaterial color="#060C1E" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh ref={compressor2} position={[0, 0, 0.38]}>
          <boxGeometry args={[0.55, 0.45, 0.14]} />
          <meshStandardMaterial color="#060C1E" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Compact Optimized Outflow Portal (Sleek Emerald Micro-Instance Frame) */}
        <group position={[0.65, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.12, 0.6, 0.6]} />
            <meshStandardMaterial color="#0A122C" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-0.06, 0, 0]}>
            <boxGeometry args={[0.02, 0.55, 0.55]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={3.5} />
          </mesh>
        </group>

        {/* AI Spec Readout Holographic Matrix Block */}
        <mesh ref={matrixPulseRef} position={[0, 0.46, 0]}>
          <boxGeometry args={[0.7, 0.09, 0.03]} />
          <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={2.5} />
        </mesh>
      </group>
    </group>
  );
}

// ─── STAGE 6: HIGH-THROUGHPUT QUANTUM CONDUIT ─────────────────────────────────
function StageConduit() {
  const streamRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (streamRef.current) {
      streamRef.current.children.forEach((child, i) => {
        const pt = (t * 2.2 + i * 0.18) % 1;
        child.position.x = -0.75 + pt * 1.5;
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        mat.opacity = pt < 0.2 ? pt * 5 : pt > 0.8 ? (1 - pt) * 5 : 1;
      });
    }
  });

  return (
    <group position={[0, 0.25, 0]}>
      {/* High-Throughput Quantum Conduit Tube */}
      <group position={[0, 0.45, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 1.9, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#C7D2FE"
            transparent
            opacity={0.3}
            roughness={0.05}
            transmission={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Dual Superconducting Mag-Lev Rails */}
        {[-0.18, 0.18].map((rz, ri) => (
          <mesh key={ri} position={[0, -0.18, rz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 1.9, 16]} />
            <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={3.5} />
          </mesh>
        ))}

        {/* High-Speed Photon Energy Packets */}
        <group ref={streamRef}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={4.0} />
            </mesh>
          ))}
        </group>

        {/* Exterior Magnetic Ring Accelerators */}
        {[-0.65, 0, 0.65].map((rx, ri) => (
          <mesh key={ri} position={[rx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.38, 0.035, 12, 32]} />
            <meshStandardMaterial color="#0A1128" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ─── STAGE 7: GOOGLE CLOUD DESTINATION ────────────────────────────────────────
function StageGoogleCloud() {
  const gcpRingRef = useRef<THREE.Group>(null);
  const cloudBeamsRef = useRef<THREE.Group>(null);
  const rippleWaveRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (gcpRingRef.current) gcpRingRef.current.rotation.y = t * 0.6;
    if (cloudBeamsRef.current) {
      cloudBeamsRef.current.children.forEach((child, i) => {
        child.position.y = 0.45 + Math.sin(t * 2.5 + i * 0.9) * 0.04;
      });
    }
    if (rippleWaveRef.current) {
      const scale = 1.0 + (t % 1.8) * 0.9;
      rippleWaveRef.current.scale.set(scale, scale, scale);
      const mat = rippleWaveRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - (t % 1.8) / 1.8) * 0.8;
    }
  });

  return (
    <group position={[0, 0.25, 0]}>
      {/* Monumental Google Cloud Platform */}
      {/* Tier 1 Cloud Pedestal Base */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.7, 1.8, 0.24, 36]} />
        <meshStandardMaterial color="#050C20" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Tier 2 Floating Cloud Deck */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[1.45, 1.5, 0.18, 36]} />
        <meshStandardMaterial color="#0A1535" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Google Cloud Signature 4-Color Neon Perimeter Ring */}
      <group position={[0, 0.38, 0]}>
        {[
          { color: PALETTE.gcpBlue, start: 0, len: Math.PI * 0.46 },
          { color: PALETTE.gcpRed, start: Math.PI * 0.5, len: Math.PI * 0.46 },
          { color: PALETTE.gcpYellow, start: Math.PI * 1.0, len: Math.PI * 0.46 },
          { color: PALETTE.gcpGreen, start: Math.PI * 1.5, len: Math.PI * 0.46 },
        ].map((arc, ai) => (
          <mesh key={ai} rotation={[-Math.PI / 2, 0, arc.start]}>
            <ringGeometry args={[1.38, 1.46, 32, 1, 0, arc.len]} />
            <meshStandardMaterial
              color={arc.color}
              emissive={arc.color}
              emissiveIntensity={3.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Grid of 6 Active Google Cloud Compute Engine VM Clusters */}
      <group ref={cloudBeamsRef}>
        {[
          { x: -0.65, z: -0.4 },
          { x: 0.0, z: -0.55 },
          { x: 0.65, z: -0.4 },
          { x: -0.55, z: 0.4 },
          { x: 0.0, z: 0.5 },
          { x: 0.55, z: 0.4 },
        ].map((vm, i) => (
          <group key={i} position={[vm.x, 0.45, vm.z]}>
            {/* VM Node Cube */}
            <RoundedBox args={[0.32, 0.24, 0.3]} radius={0.03} smoothness={3}>
              <meshStandardMaterial color="#040816" metalness={0.9} roughness={0.1} />
            </RoundedBox>
            {/* Active Status Face Light */}
            <mesh position={[0, 0, 0.155]}>
              <boxGeometry args={[0.24, 0.05, 0.01]} />
              <meshStandardMaterial
                color={PALETTE.gcpGreen}
                emissive={PALETTE.gcpGreen}
                emissiveIntensity={3.5}
              />
            </mesh>
            {/* Top Jewel Indicator */}
            <mesh position={[0, 0.13, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
              <meshStandardMaterial
                color={PALETTE.gcpBlue}
                emissive={PALETTE.gcpBlue}
                emissiveIntensity={3.0}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Center Arrival Docking Port with Confirmation Ripple Wave */}
      <group position={[0, 0.39, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.32, 36]} />
          <meshStandardMaterial
            color="#34A853"
            emissive="#34A853"
            emissiveIntensity={4.0}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh ref={rippleWaveRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.32, 0.4, 36]} />
          <meshBasicMaterial
            color="#00FF9D"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Floating Central Holographic Beacon */}
      <mesh position={[0, 0.85, 0]}>
        <octahedronGeometry args={[0.15]} />
        <meshStandardMaterial
          color="#34A853"
          emissive="#34A853"
          emissiveIntensity={3.5}
        />
      </mesh>
    </group>
  );
}

// ─── SUPERCONDUCTING CONDUIT RAILS ────────────────────────────────────────────
function SuperconductingRails({ path }: { path: THREE.CatmullRomCurve3 }) {
  return (
    <group>
      {/* Heavy Mag-Lev Outer Steel Tube */}
      <mesh>
        <tubeGeometry args={[path, 300, 0.04, 16, false]} />
        <meshStandardMaterial color="#0A122C" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Superconducting Neon Cyan Core */}
      <mesh>
        <tubeGeometry args={[path, 300, 0.018, 12, false]} />
        <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={3.5} />
      </mesh>

      {/* Radiant Ion Corona Glow */}
      <mesh>
        <tubeGeometry args={[path, 200, 0.08, 12, false]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ─── COLORFUL MIGRATING WORKLOAD BRICK ─────────────────────────────────────────
interface BrickProps {
  path: THREE.CatmullRomCurve3;
  initialOffset: number;
  speed: number;
  id: number;
}

function MigratingWorkloadBrick({ path, initialOffset, speed, id }: BrickProps) {
  const meshRef = useRef<THREE.Group>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const trailMeshRef = useRef<THREE.Mesh>(null);

  // Vibrant palette cycling through cyan, blue, violet, magenta, emerald, orange, red, yellow
  const colors = useMemo(
    () => [
      PALETTE.cyan,
      PALETTE.neonBlue,
      PALETTE.violet,
      PALETTE.magenta,
      PALETTE.emerald,
      PALETTE.orange,
      PALETTE.crimson,
      PALETTE.gold,
      PALETTE.neonGreen,
      PALETTE.cyan,
      PALETTE.magenta,
      PALETTE.emerald,
    ],
    []
  );

  const brickColor = colors[id % colors.length];

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Normalized progress [0, 1) — seamless loop
    const progress = ((t * speed + initialOffset) % 1 + 1) % 1;

    // Position along spline
    const pos = path.getPointAt(progress);
    meshRef.current.position.copy(pos);

    // Tangent for realistic banking along curve
    const tangent = path.getTangentAt(progress);
    meshRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);

    // Smooth entry from server rack and smooth docking into Google Cloud
    let opacity = 1.0;
    if (progress < 0.04) {
      opacity = progress / 0.04;
    } else if (progress > 0.96) {
      opacity = (1 - progress) / 0.04;
    }

    // ── DYNAMIC RIGHT-SIZING TRANSFORMATION ──
    // Stage 0-3: legacy bulky (scale 1.35x, dark graphite body + vibrant accent)
    // Stage 4 (AI Optimization): dynamically compacts from 1.35 down to 0.88x
    // Stage 5-6: sleek compact micro-instance (0.88x) with emerald highlight
    let currentScale = 1.35;
    let emissiveGlow = brickColor;

    if (progress < 0.5) {
      currentScale = 1.35;
      emissiveGlow = brickColor;
    } else if (progress >= 0.5 && progress < 0.72) {
      const compT = (progress - 0.5) / 0.22;
      currentScale = 1.35 - compT * 0.47; // compresses down to 0.88
      emissiveGlow = PALETTE.emerald;
    } else {
      currentScale = 0.88;
      emissiveGlow = PALETTE.gcpGreen;
    }

    meshRef.current.scale.set(currentScale, currentScale, currentScale);

    // Apply materials and visibility
    meshRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (m) {
          m.opacity = opacity;
          m.transparent = true;
        }
      }
    });

    // Dynamic light tracking
    if (pointLightRef.current) {
      pointLightRef.current.position.copy(pos);
      pointLightRef.current.intensity = opacity * 2.0;
      pointLightRef.current.color.set(emissiveGlow);
    }

    // Ion trail behind brick
    if (trailMeshRef.current) {
      const trailProg = Math.max(0, progress - 0.02);
      const trailPos = path.getPointAt(trailProg);
      trailMeshRef.current.position.copy(trailPos);
      const trailMat = trailMeshRef.current.material as THREE.MeshBasicMaterial;
      trailMat.opacity = opacity * 0.5;
      trailMat.color.set(emissiveGlow);
    }
  });

  return (
    <>
      {/* Ion Plasma Trail */}
      <mesh ref={trailMeshRef}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color={brickColor} transparent opacity={0.4} depthWrite={false} />
      </mesh>

      {/* Main High-Detail 3D Workload Brick */}
      <group ref={meshRef}>
        {/* Solid Chamfered Server Brick Body */}
        <RoundedBox args={[0.46, 0.26, 0.38]} radius={0.04} smoothness={3}>
          <meshStandardMaterial color="#0A122C" metalness={0.8} roughness={0.2} />
        </RoundedBox>

        {/* Top Crisp Contrast Cover Plate */}
        <mesh position={[0, 0.135, 0]}>
          <boxGeometry args={[0.4, 0.015, 0.32]} />
          <meshStandardMaterial color="#1E294B" metalness={0.4} roughness={0.3} />
        </mesh>

        {/* Front High-Luminance Neon Status Bar */}
        <mesh position={[0.235, 0, 0]}>
          <boxGeometry args={[0.01, 0.14, 0.28]} />
          <meshStandardMaterial
            color={brickColor}
            emissive={brickColor}
            emissiveIntensity={3.5}
          />
        </mesh>

        {/* Dual CPU Core Heatspreader Insets */}
        {[-0.08, 0.08].map((ox, oi) => (
          <mesh key={oi} position={[ox, 0.14, 0]}>
            <boxGeometry args={[0.09, 0.01, 0.2]} />
            <meshStandardMaterial
              color={brickColor}
              emissive={brickColor}
              emissiveIntensity={2.0}
            />
          </mesh>
        ))}

        {/* Floating Holographic Telemetry Pill above brick */}
        <mesh position={[0, 0.24, 0]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial
            color={brickColor}
            emissive={brickColor}
            emissiveIntensity={4.0}
          />
        </mesh>
      </group>

      {/* Dynamic Lighting Follower */}
      <pointLight ref={pointLightRef} distance={2.5} decay={2} intensity={1.5} />
    </>
  );
}

// ─── AMBIENT DATA PARTICLES & NEON CIRCUIT GRID ───────────────────────────────
function AmbientCyberField() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors, count } = useMemo(() => {
    const cnt = 180;
    const pos = new Float32Array(cnt * 3);
    const col = new Float32Array(cnt * 3);
    const colorChoices = [
      new THREE.Color('#00F0FF'),
      new THREE.Color('#3B82F6'),
      new THREE.Color('#8B5CF6'),
      new THREE.Color('#D946EF'),
      new THREE.Color('#10B981'),
      new THREE.Color('#F59E0B'),
    ];

    for (let i = 0; i < cnt; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = Math.random() * 7 - 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18;

      const c = colorChoices[i % colorChoices.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col, count: cnt };
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.getAttribute('position');
      const t = clock.getElapsedTime();
      for (let i = 0; i < count; i++) {
        posAttr.setY(i, posAttr.getY(i) + Math.sin(t * 0.4 + i) * 0.002);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.065}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// ─── STAGE COMPONENT SWITCHER ──────────────────────────────────────────────────
function StageRenderer({ stage }: { stage: StageMeta }) {
  return (
    <group position={stage.pos}>
      <CyberPlatform
        width={stage.index === 0 ? 3.5 : stage.index === 6 ? 3.8 : 2.9}
        depth={stage.index === 0 ? 2.6 : stage.index === 6 ? 3.0 : 2.4}
        height={0.5}
        accentColor={stage.color}
        stageNum={`0${stage.index + 1}`}
        name={stage.name}
      />

      {stage.index === 0 && <StageServerRacks />}
      {stage.index === 1 && <StageDiscovery />}
      {stage.index === 2 && <StageCleaning />}
      {stage.index === 3 && <StageSecurityScanning />}
      {stage.index === 4 && <StageAIOptimization />}
      {stage.index === 5 && <StageConduit />}
      {stage.index === 6 && <StageGoogleCloud />}
    </group>
  );
}

// ─── COMPLETE SCENE ASSEMBLY ──────────────────────────────────────────────────
function SceneContent() {
  const path = useMemo(() => createMigrationSpline(), []);

  // 12 Colorful Workload Bricks continuously cycling through all stages
  const bricks = useMemo(() => {
    const arr = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        initialOffset: i / count,
        speed: 0.025, // perfectly smooth continuous migration speed
      });
    }
    return arr;
  }, []);

  return (
    <>
      {/* Cinematic Cyberpunk Lighting Setup */}
      <ambientLight intensity={0.4} color="#1E1B4B" />

      {/* Main Key Cyan Light from Top-Right */}
      <directionalLight
        position={[12, 16, 12]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#38BDF8"
      />

      {/* Magenta & Violet Rim Lights for Cinematic Depth */}
      <directionalLight position={[-10, 12, -8]} intensity={1.2} color="#C084FC" />
      <directionalLight position={[0, -6, 0]} intensity={0.3} color="#00F0FF" />

      {/* Station Specific Atmospheric Lights */}
      <pointLight position={[-6.8, 2.5, -3.2]} intensity={2.0} distance={5} color="#00F0FF" />
      <pointLight position={[2.2, 2.0, -2.6]} intensity={1.8} distance={5} color="#10B981" />
      <pointLight position={[6.4, 2.0, -1.2]} intensity={2.2} distance={5} color="#D946EF" />
      <pointLight position={[-6.4, 2.5, 2.6]} intensity={2.5} distance={6} color="#34A853" />

      {/* Background Deep Midnight Space Color */}
      <color attach="background" args={[PALETTE.spaceBg]} />

      {/* Fog for Atmospheric Volumetric Depth */}
      <fog attach="fog" args={[PALETTE.spaceBg, 14, 38]} />

      {/* Dark Reflective Ground Grid with Glowing Circuit Traces */}
      <group position={[0, -1.2, 0]}>
        <gridHelper
          args={[40, 50, '#00F0FF', '#1E294B']}
          position={[0, 0.01, 0]}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[65, 65]} />
          <meshStandardMaterial color="#040816" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* Floating Glowing Particle Dust */}
      <AmbientCyberField />

      {/* Superconducting Rails */}
      <SuperconductingRails path={path} />

      {/* 7 Monumental Stages */}
      {MIGRATION_STAGES.map((stage) => (
        <StageRenderer key={stage.id} stage={stage} />
      ))}

      {/* 12 Continuously Migrating Bricks */}
      {bricks.map((b) => (
        <MigratingWorkloadBrick
          key={b.id}
          path={path}
          initialOffset={b.initialOffset}
          speed={b.speed}
          id={b.id}
        />
      ))}
    </>
  );
}

// ─── CAMERA RIG ───────────────────────────────────────────────────────────────
function IsometricCameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(13.2, 11.8, 13.2);
    camera.lookAt(-0.3, -0.1, 0.0);
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(({ mouse }) => {
    // Subtle cinematic parallax
    camera.position.x = 13.2 + mouse.x * 0.45;
    camera.position.y = 11.8 + mouse.y * 0.35;
    camera.lookAt(-0.3, -0.1, 0.0);
  });

  return null;
}

// ─── MAIN EXPORTED COMPONENT ──────────────────────────────────────────────────
export const MigrationWorkflow3D: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % MIGRATION_STAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const activeStage = MIGRATION_STAGES[activeStageIndex];

  return (
    <div className="w-full h-full relative select-none overflow-hidden bg-[#050A18]">
      {/* ─── LIVE 3D CANVAS VIEWPORT ────────────────────────────────────────── */}
      <Canvas
        camera={{
          position: [13.2, 11.8, 13.2],
          fov: 33,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
      >
        <IsometricCameraRig />
        <SceneContent />
      </Canvas>

      {/* ─── HUD TELEMETRY OVERLAY (Cyberpunk Dark Mode) ────────────────────── */}
      {/* Top Floating Glass Status Pill */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3 px-4 py-2 rounded-full bg-[#0A122C]/80 backdrop-blur-md border border-cyan-500/30 shadow-lg shadow-cyan-950/60 text-xs font-semibold text-slate-200">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        <span className="tracking-wide">CONTINUOUS MIGRATION PIPELINE</span>
        <span className="text-slate-600">|</span>
        <span className="font-mono text-cyan-400 font-bold">41 ACTIVE WORKLOADS</span>
      </div>

      {/* Bottom Floating Interactive Stage Stepper Indicator */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-[#0A122C]/80 backdrop-blur-md border border-cyan-500/30 shadow-xl shadow-cyan-950/80">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: activeStage.color, boxShadow: `0 0 8px ${activeStage.color}` }}
          />
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-black tracking-wider text-white">
              STAGE 0{activeStage.index + 1}: {activeStage.name}
            </span>
            <span className="text-[11px] text-slate-400 hidden md:inline">
              — {activeStage.subtitle}
            </span>
          </div>
        </div>

        {/* Mini Stage Dots */}
        <div className="flex items-center gap-1.5">
          {MIGRATION_STAGES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveStageIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeStageIndex
                  ? 'w-6 bg-cyan-400 shadow-sm shadow-cyan-400'
                  : 'w-1.5 bg-slate-700 hover:bg-slate-500'
              }`}
              title={s.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
