import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { simVertexShader, simFragmentShader } from "./shaders/simulation";

export type GpgpuOptions = {
  /** シミュレーションテクスチャの一辺。粒子数は size * size */
  size: number;
  /** 初期位置を生成する。戻り値は長さ size*size*4 の Float32Array */
  seed: (size: number) => Float32Array;
  curlScale?: number;
  speed?: number;
  pointerStrength?: number;
};

/**
 * 2枚の RenderTarget を交互に読み書きして粒子位置を更新する。
 * 返り値の texture を描画側の uniform に渡す。
 */
export function useGpgpu({
  size,
  seed,
  curlScale = 0.18,
  speed = 1.4,
  pointerStrength = 1.6,
}: GpgpuOptions) {
  const gl = useThree((s) => s.gl);

  // シミュレーション専用のシーンとカメラ(フルスクリーン1枚のクアッド)
  const { scene, camera, material, targets, originTexture } = useMemo(() => {
    const data = seed(size);

    const originTexture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    originTexture.needsUpdate = true;

    const makeTarget = () =>
      new THREE.WebGLRenderTarget(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthBuffer: false,
        stencilBuffer: false,
        generateMipmaps: false,
      });

    const targets = [makeTarget(), makeTarget()] as const;

    const material = new THREE.ShaderMaterial({
      vertexShader: simVertexShader,
      fragmentShader: simFragmentShader,
      uniforms: {
        uPositions: { value: originTexture },
        uOrigins: { value: originTexture },
        uTime: { value: 0 },
        uDelta: { value: 0 },
        uResolution: { value: size },
        uPointer: { value: new THREE.Vector3(1e3, 1e3, 1e3) },
        uPointerStrength: { value: pointerStrength },
        uCurlScale: { value: curlScale },
        uSpeed: { value: speed },
      },
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    return { scene, camera, material, targets, originTexture };
  }, [size, seed, curlScale, speed, pointerStrength]);

  const indexRef = useRef(0);
  const initialisedRef = useRef(false);
  const outputRef = useRef<THREE.Texture>(originTexture);

  // シーン/ターゲットが作り直されたら初期化やり直し
  useEffect(() => {
    initialisedRef.current = false;
    outputRef.current = originTexture;
  }, [originTexture]);

  // アンマウント時に GPU リソースを解放する
  useEffect(() => {
    return () => {
      targets[0].dispose();
      targets[1].dispose();
      originTexture.dispose();
      material.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
    };
  }, [targets, originTexture, material, scene]);

  // 負の優先度でメインシーンの描画より前に実行する。
  // R3F は優先度付き useFrame があるとレンダリングを自動で行わなくなるため、
  // 描画自体は ParticleField 側の render ループで明示的に行う。
  useFrame((state, delta) => {
    // 初回は両方の target に原点を焼き込み、どちらを read しても
    // 未初期化テクスチャを参照しないようにする
    if (!initialisedRef.current) {
      material.uniforms.uPositions.value = originTexture;
      const prev = gl.getRenderTarget();
      for (const t of targets) {
        gl.setRenderTarget(t);
        gl.render(scene, camera);
      }
      gl.setRenderTarget(prev);
      initialisedRef.current = true;
      outputRef.current = targets[1].texture;
      indexRef.current = 1;
      return;
    }

    const read = targets[indexRef.current];
    const write = targets[1 - indexRef.current];

    material.uniforms.uTime.value = state.clock.elapsedTime;
    // 大きなフレーム落ちで挙動が破綻しないよう上限を設ける
    material.uniforms.uDelta.value = Math.min(delta, 1 / 30);
    material.uniforms.uPositions.value = read.texture;

    const prevTarget = gl.getRenderTarget();
    gl.setRenderTarget(write);
    gl.render(scene, camera);
    gl.setRenderTarget(prevTarget);

    outputRef.current = write.texture;
    indexRef.current = 1 - indexRef.current;
  }, -1);

  return { material, outputRef, targets, originTexture };
}
