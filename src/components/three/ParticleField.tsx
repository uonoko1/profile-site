import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGpgpu } from "./useGpgpu";
import { buildAttributes } from "./seeds";
import {
  particlesVertexShader,
  particlesFragmentShader,
} from "./shaders/particles";

export type ParticleFieldProps = {
  size: number;
  seed: (size: number) => Float32Array;
  colorA?: string;
  colorB?: string;
  pointSize?: number;
  opacity?: number;
  curlScale?: number;
  speed?: number;
  pointerStrength?: number;
  /** ポインタを追従させる平面の z 座標 */
  pointerPlaneZ?: number;
};

export function ParticleField({
  size,
  seed,
  colorA = "#7dd3fc",
  colorB = "#c084fc",
  pointSize = 2.4,
  opacity = 1,
  curlScale,
  speed,
  pointerStrength,
  pointerPlaneZ = 0,
}: ParticleFieldProps) {
  const { material: simMaterial, outputRef } = useGpgpu({
    size,
    seed,
    curlScale,
    speed,
    pointerStrength,
  });

  const geometry = useMemo(() => buildAttributes(size), [size]);
  const dpr = useThree((s) => s.viewport.dpr);

  const uniforms = useMemo(
    () => ({
      uPositions: { value: null as THREE.Texture | null },
      uSize: { value: pointSize },
      uPixelRatio: { value: dpr },
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uOpacity: { value: opacity },
    }),
    // 色やサイズは下の useEffect で反映するため、依存には入れない
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uSize.value = pointSize;
    uniforms.uOpacity.value = opacity;
    uniforms.uColorA.value.set(colorA);
    uniforms.uColorB.value.set(colorB);
  }, [uniforms, pointSize, opacity, colorA, colorB]);

  useEffect(() => {
    uniforms.uPixelRatio.value = dpr;
  }, [uniforms, dpr]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const pointer = useRef(new THREE.Vector3(1e3, 1e3, 1e3));
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), -pointerPlaneZ),
    [pointerPlaneZ],
  );
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // useGpgpu が優先度 -1 を使うため R3F の自動レンダリングは無効になる。
  // シミュレーション後のこのフレームでメインシーンを明示的に描画する。
  useFrame((state) => {
    uniforms.uPositions.value = outputRef.current;
    uniforms.uTime.value = state.clock.elapsedTime;

    // ポインタをワールド空間へ投影して反発の中心にする
    raycaster.setFromCamera(state.pointer, state.camera);
    const hit = raycaster.ray.intersectPlane(plane, pointer.current);
    if (hit) {
      (simMaterial.uniforms.uPointer.value as THREE.Vector3).lerp(
        pointer.current,
        0.12,
      );
    }

    state.gl.render(state.scene, state.camera);
  }, 1);

  // R3F の JSX 経由だとカスタム属性が確実に反映されないことがあるため、
  // THREE.Points を直接組み立てて primitive として差し込む。
  const points = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: particlesVertexShader,
      fragmentShader: particlesFragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const p = new THREE.Points(geometry, mat);
    p.frustumCulled = false;
    return p;
  }, [geometry, uniforms]);

  useEffect(
    () => () => {
      (points.material as THREE.Material).dispose();
    },
    [points],
  );

  return <primitive object={points} />;
}
