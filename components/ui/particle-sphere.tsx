"use client";

import { useEffect, useRef } from "react";
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, PerspectiveCamera, Points, PointsMaterial, Scene, WebGLRenderer } from "three";

type ParticleSphereProps = { className?: string; particles?: number };

/** A quiet, non-interactive particle object for rare "systems intelligence" moments. */
export function ParticleSphere({ className = "", particles = 1400 }: ParticleSphereProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 5;
    const geometry = new BufferGeometry();
    const positions = new Float32Array(particles * 3);
    const colors = new Float32Array(particles * 3);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const indigo = new Color("#8180d8");
    const blue = new Color("#d6e4ff");

    for (let index = 0; index < particles; index += 1) {
      const y = 1 - (index / (particles - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = goldenAngle * index;
      const offset = index * 3;
      positions[offset] = Math.cos(theta) * radius * 1.45;
      positions[offset + 1] = y * 1.45;
      positions[offset + 2] = Math.sin(theta) * radius * 1.45;
      const color = indigo.clone().lerp(blue, (y + 1) * 0.5);
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
    }

    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    const material = new PointsMaterial({
      size: 0.032,
      transparent: true,
      opacity: 0.72,
      vertexColors: true,
      depthWrite: false,
      blending: AdditiveBlending,
      sizeAttenuation: true,
    });
    const sphere = new Points(geometry, material);
    sphere.rotation.x = -0.22;
    scene.add(sphere);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      const safeWidth = Math.max(width, 1);
      const safeHeight = Math.max(height, 1);
      renderer.setSize(safeWidth, safeHeight, false);
      camera.aspect = safeWidth / safeHeight;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    let frame = 0;
    let inView = true;
    const render = (time: number) => {
      if (!inView) return;
      sphere.rotation.y = time * 0.00004;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !reduceMotion && finePointer && !frame) frame = window.requestAnimationFrame(render);
        if (!inView) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: 0.08 },
    );
    visibilityObserver.observe(host);
    if (!reduceMotion && finePointer) frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [particles]);

  return <div className={`particle-sphere ${className}`.trim()} ref={hostRef} aria-hidden="true" />;
}
