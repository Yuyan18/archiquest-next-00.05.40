"use client";
import React, { useState, useRef } from "react";

interface SelectionArea {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

export default function SelectImageRegion({
  img,
  onSelect,
}: {
  img: string;
  onSelect: (imgUrl: string) => void;
}) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionArea, setSelectionArea] = useState<SelectionArea>({
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startSelection = (event: React.MouseEvent) => {
    event.preventDefault();
    const rect = imgRef.current!.getBoundingClientRect();
    setSelectionArea({
      startX: event.clientX - rect.left,
      startY: event.clientY - rect.top,
      width: 0,
      height: 0,
    });
    setIsSelecting(true);
  };

  const updateSelection = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!isSelecting) return;
    const rect = imgRef.current!.getBoundingClientRect();
    setSelectionArea((prev) => ({
      ...prev,
      width: event.clientX - rect.left - prev.startX,
      height: event.clientY - rect.top - prev.startY,
    }));
  };

  const endSelection = () => {
    if (canvasRef.current && imgRef.current) {
      const ctx = canvasRef.current.getContext("2d")!;
      canvasRef.current.width = Math.abs(selectionArea.width);
      canvasRef.current.height = Math.abs(selectionArea.height);
      ctx.drawImage(
        imgRef.current,
        selectionArea.startX,
        selectionArea.startY,
        selectionArea.width,
        selectionArea.height,
        0,
        0,
        Math.abs(selectionArea.width),
        Math.abs(selectionArea.height)
      );
      //call the callback function and provide the image
      onSelect(canvasRef.current.toDataURL("image/png"));
    }
    setIsSelecting(false);
  };

  return (
    <div className="relative flex flex-col gap-4">
      <img
        ref={imgRef}
        src={img}
        crossOrigin="anonymous" // This line is important
        onMouseDown={startSelection}
        onMouseMove={updateSelection}
        onMouseUp={endSelection}
        style={{ cursor: isSelecting ? "crosshair" : "default" }}
      />
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
      {isSelecting && (
        <div
          className="absolute border-2 border-white border-dashed pointer-events-none"
          style={{
            left:
              selectionArea.width > 0
                ? selectionArea.startX + "px"
                : selectionArea.startX + selectionArea.width + "px",
            top:
              selectionArea.height > 0
                ? selectionArea.startY + "px"
                : selectionArea.startY + selectionArea.height + "px",
            width: Math.abs(selectionArea.width) + "px",
            height: Math.abs(selectionArea.height) + "px",
          }}
        ></div>
      )}
    </div>
  );
}
