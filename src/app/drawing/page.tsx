"use client";
import BlendImage from "@/components/BlendImage";
import SketchToImage from "@/components/SketchToImage";
import { useState } from "react";

export default function Page() {
  const [image, setImage] = useState<string>("");
  const [prompt, setPrompt] = useState<string>(
    "An alien planet landscape photograph that fits the name of the planet showing massively different biome, terrain, environment, and climate conditions."
  );

  const onCreate = (img: string) => {
    setImage(img);
  };

  return (
    <main className="flex min-h-screen flex-col items-end justify-between p-24">
      <div className="z-10 max-w-lg w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col w-full">
          <input
            className="p-2 mb-2 rounded-lg"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <SketchToImage prompt={prompt} onCreate={onCreate} />
          <BlendImage src={image} fullscreen />
        </div>
      </div>
    </main>
  );
}