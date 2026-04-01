"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const AnimatedShape = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 128, 128]} scale={1.8}>
        <MeshDistortMaterial
          color="#00f0ff"
          attach="material"
          distort={0.5}
          speed={1.5}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>
    </Float>
  );
};

export const ThreeVisualizer = () => {
  return (
    <div className="w-full h-full relative bg-zinc-950 overflow-hidden flex items-center justify-center">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-zinc-950 to-blue-900/20 pointer-events-none" />
      
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} className="w-full h-full z-10">
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#00f0ff" />
        <AnimatedShape />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};
