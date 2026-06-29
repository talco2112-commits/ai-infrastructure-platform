"use client";

import { useState } from "react";

const VIDEOS = [
  "/13178585_3840_2160_60fps.mp4",
  "/13179108_3840_2160_60fps.mp4",
];

export function VideoBackground({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  return (
    <video
      key={index}
      autoPlay
      muted
      playsInline
      className={className}
      src={VIDEOS[index]}
      onEnded={() => setIndex(i => (i + 1) % VIDEOS.length)}
    />
  );
}
