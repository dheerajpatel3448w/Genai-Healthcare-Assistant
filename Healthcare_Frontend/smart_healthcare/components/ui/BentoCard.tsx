"use client";

import React, { useState, useRef } from "react";
import Tilt from "react-parallax-tilt";

export const BentoCard = ({ 
  children, 
  className = "", 
  imageSrc 
}: { 
  children: React.ReactNode; 
  className?: string;
  imageSrc?: string;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <Tilt
      perspective={1000}
      glareEnable={true}
      glareMaxOpacity={0.15}
      glareColor="#00f0ff"
      glarePosition="all"
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      scale={1.01}
      transitionSpeed={1500}
      className={`relative h-full w-full rounded-3xl bg-zinc-950/80 backdrop-blur-2xl border border-white/5 overflow-hidden group shadow-2xl ${className}`}
    >
      <div 
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setOpacity(1)}
        onMouseLeave={() => setOpacity(0)}
        className="absolute inset-0 z-0 h-full w-full"
      >
        <div
          className="absolute inset-0 z-0 transition-opacity duration-500 pointer-events-none"
          style={{
            opacity,
            background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(16, 185, 129, 0.15), transparent 40%)`,
          }}
        />
        {/* Border Flashlight */}
        <div
          className="absolute inset-0 z-0 transition-opacity duration-300 rounded-3xl pointer-events-none"
          style={{
            opacity,
            background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(6, 182, 212, 0.4), transparent 40%)`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        {imageSrc && (
          <div className="w-full h-48 lg:h-64 overflow-hidden border-b border-white/5 relative bg-zinc-900 flex-shrink-0">
             <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
             <img src={imageSrc} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out opacity-80 group-hover:opacity-100" />
          </div>
        )}
        <div className="flex-1 p-8 lg:p-10 flex flex-col justify-end">
          {children}
        </div>
      </div>
    </Tilt>
  );
};
