/**
 * GPGPU シミュレーション。
 * 位置を RGBA float テクスチャに持ち、2枚の RenderTarget を交互に読み書きする
 * (ping-pong)。1フレームあたりフルスクリーン fragment パス1回で全粒子が進む。
 */

export const simVertexShader = /* glsl */ `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

export const simFragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uPositions;   // 現在位置 (xyz) + 寿命 (w)
uniform sampler2D uOrigins;     // 初期位置。寿命が尽きたらここへ戻す
uniform float uTime;
uniform float uDelta;
uniform float uResolution;      // シミュレーションテクスチャの一辺
uniform vec3  uPointer;         // ワールド空間のポインタ位置
uniform float uPointerStrength;
uniform float uCurlScale;
uniform float uSpeed;

// --- Simplex noise (Ashima Arts / webgl-noise, MIT) ---------------------
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
// -----------------------------------------------------------------------

// カール(回転)ノイズ。発散ゼロのベクトル場なので粒子が一点に溜まらず、
// 流体的な渦を描き続ける。
// スカラーノイズ3枚をオフセットして疑似ベクトル場 F を作り、その回転 rot(F) を
// 中心差分で求める。
vec3 snoiseVec3(vec3 p) {
  return vec3(
    snoise(p),
    snoise(p + vec3(123.4, 56.7, 89.1)),
    snoise(p + vec3(-45.6, 78.9, -12.3))
  );
}

vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  // rot(F) = (dFz/dy - dFy/dz, dFx/dz - dFz/dx, dFy/dx - dFx/dy)
  vec3 p_dy = snoiseVec3(p + dy) - snoiseVec3(p - dy);
  vec3 p_dz = snoiseVec3(p + dz) - snoiseVec3(p - dz);
  vec3 p_dx = snoiseVec3(p + dx) - snoiseVec3(p - dx);

  vec3 c = vec3(
    p_dy.z - p_dz.y,
    p_dz.x - p_dx.z,
    p_dx.y - p_dy.x
  ) / (2.0 * e);

  return normalize(c + 1e-6);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  vec4 current = texture2D(uPositions, uv);
  vec3 pos = current.xyz;
  float life = current.w;

  vec3 origin = texture2D(uOrigins, uv).xyz;

  // 流れ場
  vec3 flow = curlNoise(pos * uCurlScale + vec3(0.0, 0.0, uTime * 0.05));

  // ポインタからの反発
  vec3 toPointer = pos - uPointer;
  float dist = length(toPointer);
  vec3 repel = normalize(toPointer + 1e-5) * uPointerStrength / (1.0 + dist * dist * 8.0);

  // 原点へ戻ろうとする弱い力。粒子が無限に飛散しないための拘束
  vec3 pull = (origin - pos) * 0.08;

  pos += (flow * uSpeed + repel + pull) * uDelta;

  // 寿命を減らし、尽きたら原点付近へ再配置する
  life -= uDelta * 0.12;
  if (life <= 0.0) {
    pos = origin;
    life = 1.0;
  }

  gl_FragColor = vec4(pos, life);
}
`;
