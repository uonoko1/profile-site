import { useMemo } from "react";
import { Stage } from "./Stage";
import { ParticleField } from "./ParticleField";
import { sphereSeed, slabSeed, vortexSeed } from "./seeds";
import type { Tier } from "@/lib/quality";

type Props = { tier: Exclude<Tier, "static">; size: number; variant: string };

/** 案ごとの見た目の差分はここに集約する */
const VARIANTS = {
  atlas: {
    colorA: "#38bdf8",
    colorB: "#a78bfa",
    pointSize: 3.2,
    curlScale: 0.13,
    speed: 1.1,
    camera: [0, 0, 15] as [number, number, number],
    seed: () => vortexSeed(8.4, 1.8, 3),
  },
  // 採用案。artifact で実測して決めた値(輝点率 44.7% / 白飛び 2px)。
  strata: {
    colorA: "#e2e8f0",
    colorB: "#7dd3fc",
    pointSize: 2.9,
    curlScale: 0.09,
    speed: 0.72,
    camera: [0, 0, 12] as [number, number, number],
    seed: () => slabSeed(34, 3.2, 3.0),
  },
  ember: {
    colorA: "#fb923c",
    colorB: "#f43f5e",
    pointSize: 3.0,
    curlScale: 0.24,
    speed: 1.8,
    camera: [0, 0, 14] as [number, number, number],
    seed: () => sphereSeed(5.6, 3.4),
  },
} as const;

export function HeroScene({ tier, size, variant }: Props) {
  const v = VARIANTS[variant as keyof typeof VARIANTS] ?? VARIANTS.atlas;
  const seed = useMemo(() => v.seed(), [v]);

  return (
    <Stage tier={tier} cameraPosition={v.camera} className="!absolute inset-0">
      <ParticleField
        size={size}
        seed={seed}
        colorA={v.colorA}
        colorB={v.colorB}
        pointSize={v.pointSize}
        curlScale={v.curlScale}
        speed={v.speed}
        opacity={tier === "full" ? 0.55 : 0.45}
      />
    </Stage>
  );
}
