"use client";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useState } from "react";
export default function Panorama({ img }: { img: string }) {
  const [fov, setFov] = useState<number>(100);

  const handleWheel = (deltaY: number) => {
    setFov((prevFov) => {
      let newFov = prevFov + deltaY * 0.05;
      newFov = Math.max(10, Math.min(newFov, 150)); // Clamp fov value between 10 and 150
      return newFov;
    });
  };
  return (
    <Canvas onWheel={(e) => handleWheel(e.deltaY)}>
      <Environment files={img} background />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        makeDefault
      />
      <PerspectiveCamera makeDefault position={[45, 45, 10]} fov={fov} />
    </Canvas>
  );
}
