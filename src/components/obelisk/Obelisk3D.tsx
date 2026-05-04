import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";
import { useStability } from "./StabilityContext";

function ObeliskMesh({ score }: { score: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const rainbowLightRef = useRef<THREE.PointLight>(null);

  // Stability 0–100 → 0.3–1 intensity curve (steeper above 90)
  const intensity = useMemo(() => {
    const norm = Math.max(0, Math.min(100, score)) / 100;
    return 0.3 + Math.pow(norm, 2.2) * 0.7;
  }, [score]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Very slow continuous rotation — meditative, never jarring
      groupRef.current.rotation.y = t * 0.06;
      groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.02;
    }
    if (innerCoreRef.current) {
      const mat = innerCoreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.55 + Math.sin(t * 0.9) * 0.15) * intensity;
    }
    if (rainbowLightRef.current) {
      rainbowLightRef.current.position.x = Math.sin(t * 0.6) * 3;
      rainbowLightRef.current.position.z = Math.cos(t * 0.6) * 3;
      rainbowLightRef.current.position.y = Math.sin(t * 0.4) * 2 + 1;
      rainbowLightRef.current.color.setHSL((t * 0.15) % 1, 1, 0.6);
    }
  });

  // Tapered obelisk geometry (a thin monolith with a pyramid tip)
  const shaftGeo = useMemo(() => new THREE.CylinderGeometry(0.55, 0.7, 4.2, 4, 1, false), []);
  const tipGeo = useMemo(() => new THREE.ConeGeometry(0.55, 0.7, 4), []);

  return (
    <group ref={groupRef}>
      {/* Orbiting rainbow light */}
      <pointLight ref={rainbowLightRef} intensity={4} distance={12} />

      {/* Base plinth */}
      <mesh position={[0, -2.35, 0]}>
        <boxGeometry args={[1.8, 0.12, 1.8]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Main shaft — smoked glass */}
      <mesh geometry={shaftGeo} position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <meshPhysicalMaterial
          color="#1a1a1a"
          transmission={0.55}
          thickness={1.2}
          roughness={0.08}
          metalness={0.1}
          ior={1.6}
          clearcoat={1}
          clearcoatRoughness={0.1}
          attenuationColor="#BFFFA1"
          attenuationDistance={3}
          envMapIntensity={1.2}
          iridescence={1}
          iridescenceIOR={1.5}
          iridescenceThicknessRange={[100, 400]}
        />
      </mesh>

      {/* Pyramid tip */}
      <mesh geometry={tipGeo} position={[0, 2.45, 0]} rotation={[0, Math.PI / 4, 0]}>
        <meshPhysicalMaterial
          color="#1a1a1a"
          transmission={0.5}
          thickness={0.8}
          roughness={0.06}
          metalness={0.2}
          ior={1.6}
          clearcoat={1}
          envMapIntensity={1.4}
          iridescence={1}
          iridescenceIOR={1.5}
          iridescenceThicknessRange={[100, 400]}
        />
      </mesh>

      {/* Inner neon core (visible through glass), brightens with stability */}
      <mesh ref={innerCoreRef} position={[0, -0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 2, 8]} />
        <meshBasicMaterial color="#BFFFA1" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export function Obelisk3D() {
  const { score } = useStability();
  // Floor light intensity scales with stability for the base "halo"
  const norm = Math.max(0, Math.min(100, score)) / 100;
  const floorIntensity = 1.2 + Math.pow(norm, 2) * 1.6;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0.2, 7], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.25} />
          <directionalLight position={[4, 6, 5]} intensity={1.4} color="#ffffff" />
          <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#BFFFA1" />
          <pointLight position={[0, -2, 2]} intensity={floorIntensity} color="#BFFFA1" distance={6} />
          <Environment preset="studio" />
          <ObeliskMesh score={score} />
        </Suspense>
      </Canvas>
    </div>
  );
}

