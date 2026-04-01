"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, TorusKnot } from "@react-three/drei";
import * as THREE from "three";

const AnimatedTorus = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.25;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
      <TorusKnot ref={meshRef} args={[1.5, 0.4, 100, 16]} scale={1.2}>
        <meshStandardMaterial
          color="#10b981"
          roughness={0.1}
          metalness={0.8}
          wireframe={true}
          emissive="#00f0ff"
          emissiveIntensity={0.2}
        />
      </TorusKnot>
    </Float>
  );
};

export const PlatformVisualizer = () => {
  return (
    <div className="w-full h-full relative bg-zinc-950 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }} 
        className="w-full h-full z-10"
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#00f0ff" />
        <AnimatedTorus />
      </Canvas>
    </div>
  );
};
