import * as THREE from "three";

/** 長さ size*size*4 の Float32Array を作る共通処理 */
function alloc(size: number) {
  return new Float32Array(size * size * 4);
}

/**
 * 渦を巻く円盤状に配置する。
 * 半径方向に密度差をつけ、中心へ向かうほど濃くすることで
 * 流れ場が「構造」として読めるようにする。
 */
export function vortexSeed(radius = 8, thickness = 1.6, arms = 3) {
  return (size: number) => {
    const data = alloc(size);
    for (let i = 0; i < size * size; i++) {
      // sqrt で中心付近を濃くする
      const t = Math.sqrt(Math.random());
      const r = t * radius;
      // 腕に沿って角度をずらし、渦状にする
      const arm = Math.floor(Math.random() * arms);
      const swirl = r * 0.55;
      const theta =
        (arm / arms) * Math.PI * 2 + swirl + (Math.random() - 0.5) * 0.9;

      const i4 = i * 4;
      data[i4 + 0] = Math.cos(theta) * r;
      data[i4 + 1] = Math.sin(theta) * r * 0.62; // 少し潰して奥行きを出す
      data[i4 + 2] = (Math.random() - 0.5) * thickness * (1.0 - t * 0.5);
      data[i4 + 3] = Math.random();
    }
    return data;
  };
}

/** 球殻状にばらまく。汎用の初期配置 */
export function sphereSeed(radius = 6, thickness = 2.2) {
  return (size: number) => {
    const data = alloc(size);
    for (let i = 0; i < size * size; i++) {
      const r = radius + (Math.random() - 0.5) * thickness;
      // 球面上の一様分布
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);

      const i4 = i * 4;
      data[i4 + 0] = r * Math.sin(phi) * Math.cos(theta);
      data[i4 + 1] = r * Math.sin(phi) * Math.sin(theta);
      data[i4 + 2] = r * Math.cos(phi);
      data[i4 + 3] = Math.random(); // 寿命をばらけさせ、一斉に再生成されるのを防ぐ
    }
    return data;
  };
}

/** 平たい帯状。横に流れる構図向き */
export function slabSeed(width = 16, height = 7, depth = 5) {
  return (size: number) => {
    const data = alloc(size);
    for (let i = 0; i < size * size; i++) {
      const i4 = i * 4;
      data[i4 + 0] = (Math.random() - 0.5) * width;
      data[i4 + 1] = (Math.random() - 0.5) * height;
      data[i4 + 2] = (Math.random() - 0.5) * depth;
      data[i4 + 3] = Math.random();
    }
    return data;
  };
}

/**
 * 画像の輝度をサンプリングして初期位置を作る。
 * 文字やロゴを粒子で結像させる用途。
 */
export function textureSeed(
  image: HTMLImageElement,
  opts: { width?: number; threshold?: number; depth?: number } = {},
) {
  const { width = 14, threshold = 0.5, depth = 0.8 } = opts;

  return (size: number) => {
    const data = alloc(size);
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return sphereSeed()(size);

    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const aspect = canvas.height / canvas.width;
    const height = width * aspect;

    // 輝度が閾値を超えるピクセルを候補として集める
    const candidates: [number, number][] = [];
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const p = (y * canvas.width + x) * 4;
        const lum =
          (pixels[p] * 0.299 + pixels[p + 1] * 0.587 + pixels[p + 2] * 0.114) / 255;
        const alpha = pixels[p + 3] / 255;
        if (lum * alpha > threshold) candidates.push([x, y]);
      }
    }

    if (candidates.length === 0) return sphereSeed()(size);

    for (let i = 0; i < size * size; i++) {
      const [x, y] = candidates[(Math.random() * candidates.length) | 0];
      const i4 = i * 4;
      data[i4 + 0] = (x / canvas.width - 0.5) * width;
      data[i4 + 1] = -(y / canvas.height - 0.5) * height;
      data[i4 + 2] = (Math.random() - 0.5) * depth;
      data[i4 + 3] = Math.random();
    }
    return data;
  };
}

/** 粒子ごとの属性(シミュレーションテクスチャ座標と個体差) */
export function buildAttributes(size: number) {
  const count = size * size;
  const simUv = new Float32Array(count * 2);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const x = (i % size) / size + 0.5 / size;
    const y = Math.floor(i / size) / size + 0.5 / size;
    simUv[i * 2 + 0] = x;
    simUv[i * 2 + 1] = y;
    seeds[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  // 位置はシェーダーでテクスチャから引くので、ここではダミーを置く
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(count * 3), 3),
  );
  geometry.setAttribute("aSimUv", new THREE.BufferAttribute(simUv, 2));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  // 粒子はシェーダー側で動くため、自動カリングを無効にする
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e3);

  return geometry;
}
