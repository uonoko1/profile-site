/**
 * 粒子の描画。位置は GPGPU のテクスチャから読むため、
 * 頂点属性には「シミュレーションテクスチャ上の座標」だけを持たせる。
 */

export const particlesVertexShader = /* glsl */ `
precision highp float;

uniform sampler2D uPositions;
uniform float uSize;
uniform float uPixelRatio;
uniform float uTime;

attribute vec2 aSimUv;   // シミュレーションテクスチャ上の位置
attribute float aSeed;   // 粒子ごとの個体差

varying float vLife;
varying float vSeed;
varying float vDepth;

void main() {
  vec4 sim = texture2D(uPositions, aSimUv);
  vec3 pos = sim.xyz;
  vLife = sim.w;
  vSeed = aSeed;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vDepth = -mvPosition.z;

  // 生成直後だけ小さく立ち上げる。消滅側はフラグメントの alpha に任せる
  float grow = smoothstep(0.0, 0.15, vLife);
  float size = uSize * (0.6 + aSeed * 0.4) * grow;

  // 遠いほど小さく(遠近感)。1px を下回ると GPU により描画されないため下限を設ける
  gl_PointSize = max(size * uPixelRatio * (26.0 / max(vDepth, 0.1)), 1.5);
}
`;

export const particlesFragmentShader = /* glsl */ `
precision highp float;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;

varying float vLife;
varying float vSeed;
varying float vDepth;

void main() {
  // 円形に切り抜き、縁を柔らかくする
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;

  // 中心に鋭いコア、外側に緩いハロー。重なった箇所が加算で伸びる
  float core = smoothstep(0.5, 0.0, d);
  float halo = smoothstep(0.5, 0.28, d);
  float alpha = core * 0.55 + halo * 0.45;

  // 個体差 + 奥行きで色を振り、のっぺりさせない
  vec3 color = mix(uColorA, uColorB, clamp(vSeed * 0.75 + vDepth * 0.02, 0.0, 1.0));

  // 奥ほど暗く落として深度を伝える(カメラ距離 ~15 を想定)
  float depthFade = mix(0.28, 1.0, smoothstep(26.0, 5.0, vDepth));

  // 寿命の残りが少ない粒子を消し、再配置を目立たせない
  float fade = smoothstep(0.0, 0.25, vLife);

  gl_FragColor = vec4(color, alpha * fade * depthFade * uOpacity);
}
`;
