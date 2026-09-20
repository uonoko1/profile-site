/**
 * 描画品質のティア。
 * static  : 一枚絵。prefers-reduced-motion / WebGL 不可 / 極端に非力な端末
 * reduced : 粒子数とポストプロセスを落として動かす
 * full    : フル
 */
export type Tier = "static" | "reduced" | "full";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function hasWebGL2(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * 端末の素性から初期ティアを決める。
 * 実際のフレームレートによる降格は PerformanceMonitor 側で行う。
 */
export function detectTier(): Tier {
  if (prefersReducedMotion()) return "static";
  if (!hasWebGL2()) return "static";

  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  if (cores <= 4 || mem <= 4) return "reduced";
  if (coarse && cores <= 6) return "reduced";
  return "full";
}

/** ティアごとの GPGPU シミュレーションテクスチャの一辺 */
export const SIM_SIZE: Record<Exclude<Tier, "static">, number> = {
  reduced: 128, // 16,384 粒子
  full: 256, //  65,536 粒子
};
