import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import type { Tier } from "@/lib/quality";

type StageProps = {
  tier: Exclude<Tier, "static">;
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
  fov?: number;
  className?: string;
  /** 画面外・タブ非表示のときは描画を止める */
  paused?: boolean;
};

/**
 * Canvas の共通ラッパ。
 * - フレームレートが落ちたら dpr を自動的に下げる
 * - タブが隠れている間は回さない
 * - canvas 自体は装飾なのでスクリーンリーダーからは隠す
 */
export function Stage({
  tier,
  children,
  cameraPosition = [0, 0, 14],
  fov = 45,
  className,
  paused = false,
}: StageProps) {
  const [dpr, setDpr] = useState(tier === "full" ? 1.5 : 1);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <Canvas
      className={className}
      aria-hidden="true"
      dpr={dpr}
      frameloop={paused || hidden ? "never" : "always"}
      camera={{ position: cameraPosition, fov }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(tier === "full" ? 2 : 1.25, d + 0.25))}
      />
      <AdaptiveDpr pixelated />
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
