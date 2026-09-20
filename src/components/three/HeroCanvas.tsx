import { lazy, Suspense, useEffect, useState } from "react";
import { detectTier, SIM_SIZE, type Tier } from "@/lib/quality";

/** three.js を初期バンドルから外す。LCP は下の DOM テキストが担う */
const Scene = lazy(() =>
  import("./HeroScene").then((m) => ({ default: m.HeroScene })),
);

export function HeroCanvas({ variant }: { variant: string }) {
  const [tier, setTier] = useState<Tier | null>(null);

  useEffect(() => {
    setTier(detectTier());

    // 実行中に reduced-motion へ切り替えられた場合も追従する
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setTier(detectTier());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // 判定前と static は WebGL を立ち上げない
  if (tier === null || tier === "static") return null;

  return (
    <Suspense fallback={null}>
      <Scene tier={tier} size={SIM_SIZE[tier]} variant={variant} />
    </Suspense>
  );
}
