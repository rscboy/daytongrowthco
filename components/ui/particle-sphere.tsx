"use client";

import { useEffect, useRef } from "react";
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, PerspectiveCamera, Points, PointsMaterial, Scene, WebGLRenderer } from "three";

type ParticleSphereProps = {
  className?: string;
  particles?: number;
  interactive?: boolean;
  cursorRadius?: number;
  cursorStrength?: number;
  clickForce?: number;
  dragSpeed?: number;
};

/**
 * A contained, viewport-aware particle object. Pointer response is deliberately
 * local to the sphere, and touch uses the same lightweight drag model at a
 * smaller particle count so it stays responsive on phones.
 */
export function ParticleSphere({
  className = "",
  particles = 1400,
  interactive = true,
  cursorRadius = 0.62,
  cursorStrength = 0.36,
  clickForce = 0.52,
  dragSpeed = 0.009,
}: ParticleSphereProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    // The sphere stays dense enough to read as a 3D object, with a deliberately
    // smaller mobile cap so drag and scatter never compete with page scrolling.
    const particleCount = isCoarsePointer ? Math.min(particles, 720) : particles;
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
    const positions = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3);
    const burstOffsets = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const indigo = new Color("#8180d8");
    const blue = new Color("#d6e4ff");

    for (let index = 0; index < particleCount; index += 1) {
      const y = 1 - (index / (particleCount - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = goldenAngle * index;
      const offset = index * 3;
      positions[offset] = Math.cos(theta) * radius * 1.45;
      positions[offset + 1] = y * 1.45;
      positions[offset + 2] = Math.sin(theta) * radius * 1.45;
      basePositions[offset] = positions[offset];
      basePositions[offset + 1] = positions[offset + 1];
      basePositions[offset + 2] = positions[offset + 2];
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
    // The canvas never captures input; the host owns the contained interaction.
    renderer.domElement.style.pointerEvents = "none";
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

    const canInteract = interactive && !reduceMotion;
    let targetX = -0.22;
    let targetY = 0;
    let rotationX = -0.22;
    let rotationY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let pointerActive = false;
    let dragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let autoRotation = 0;

    const setPointerPosition = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2;
      pointerY = -((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!canInteract) return;
      setPointerPosition(event);
      pointerActive = true;
      if (!dragging) return;
      const deltaX = event.clientX - lastPointerX;
      const deltaY = event.clientY - lastPointerY;
      targetX = Math.max(-1.1, Math.min(0.7, targetX + deltaY * dragSpeed));
      targetY += deltaX * dragSpeed;
      velocityX = deltaY * dragSpeed;
      velocityY = deltaX * dragSpeed;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
    };
    const onPointerLeave = () => {
      if (dragging) return;
      pointerActive = false;
    };

    const burstAtPointer = () => {
      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        const baseX = basePositions[offset] / 1.45;
        const baseY = basePositions[offset + 1] / 1.45;
        const baseZ = basePositions[offset + 2];
        const dx = baseX - pointerX;
        const dy = baseY - pointerY;
        const distance = Math.hypot(dx, dy);
        if (baseZ < -0.04 || distance > cursorRadius * 1.25) continue;
        const proximity = Math.pow(1 - distance / (cursorRadius * 1.25), 2);
        const safeDistance = Math.max(distance, 0.08);
        const jitter = (Math.random() - 0.5) * clickForce * 0.16;
        burstOffsets[offset] = (dx / safeDistance) * clickForce * proximity + jitter;
        burstOffsets[offset + 1] = (dy / safeDistance) * clickForce * proximity + jitter;
        burstOffsets[offset + 2] = clickForce * proximity * 0.8;
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!canInteract) return;
      setPointerPosition(event);
      pointerActive = true;
      dragging = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      velocityX = 0;
      velocityY = 0;
      burstAtPointer();
      host.setPointerCapture?.(event.pointerId);
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      if (host.hasPointerCapture?.(event.pointerId)) host.releasePointerCapture(event.pointerId);
    };
    if (canInteract) {
      host.addEventListener("pointermove", onPointerMove, { passive: true });
      host.addEventListener("pointerleave", onPointerLeave, { passive: true });
      host.addEventListener("pointerdown", onPointerDown);
      host.addEventListener("pointerup", onPointerUp, { passive: true });
      host.addEventListener("pointercancel", onPointerUp, { passive: true });
    }

    let frame = 0;
    let inView = true;
    const render = (time: number) => {
      if (!inView) return;
      if (!dragging) {
        targetX = Math.max(-0.8, Math.min(0.35, targetX + velocityX));
        targetY += velocityY;
        velocityX *= 0.93;
        velocityY *= 0.93;
      }
      rotationX += (targetX - rotationX) * 0.12;
      rotationY += (targetY - rotationY) * 0.12;
      autoRotation += 0.00055;
      sphere.rotation.x = rotationX;
      sphere.rotation.y = rotationY + autoRotation;

      // Local particle displacement gives the cursor a tangible response
      // without the 10,000-particle CPU load of the original reference.
      const cosY = Math.cos(sphere.rotation.y);
      const sinY = Math.sin(sphere.rotation.y);
      const cosX = Math.cos(sphere.rotation.x);
      const sinX = Math.sin(sphere.rotation.x);
      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        const baseX = basePositions[offset];
        const baseY = basePositions[offset + 1];
        const baseZ = basePositions[offset + 2];
        let offsetX = 0;
        let offsetY = 0;
        let offsetZ = 0;
        // Repulsion is only calculated for the hemisphere facing the visitor.
        const rotatedX = cosY * baseX + sinY * baseZ;
        const rotatedZ = -sinY * baseX + cosY * baseZ;
        const rotatedY = cosX * baseY - sinX * rotatedZ;
        const frontZ = sinX * baseY + cosX * rotatedZ;
        if (pointerActive && frontZ > 0) {
          const dx = rotatedX / 1.45 - pointerX;
          const dy = rotatedY / 1.45 - pointerY;
          const distance = Math.hypot(dx, dy);
          if (distance < cursorRadius && distance > 0.001) {
            const force = Math.pow(1 - distance / cursorRadius, 2) * cursorStrength;
            offsetX = (dx / distance) * force;
            offsetY = (dy / distance) * force;
            offsetZ = force * 0.46;
          }
        }
        const burstX = burstOffsets[offset];
        const burstY = burstOffsets[offset + 1];
        const burstZ = burstOffsets[offset + 2];
        const targetParticleX = baseX + offsetX + burstX;
        const targetParticleY = baseY + offsetY + burstY;
        const targetParticleZ = baseZ + offsetZ + burstZ;
        positions[offset] += (targetParticleX - positions[offset]) * 0.16;
        positions[offset + 1] += (targetParticleY - positions[offset + 1]) * 0.16;
        positions[offset + 2] += (targetParticleZ - positions[offset + 2]) * 0.16;
        burstOffsets[offset] *= 0.89;
        burstOffsets[offset + 1] *= 0.89;
        burstOffsets[offset + 2] *= 0.89;
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !reduceMotion && !frame) frame = window.requestAnimationFrame(render);
        if (!inView) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: 0.08 },
    );
    visibilityObserver.observe(host);
    if (!reduceMotion) frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("pointercancel", onPointerUp);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [clickForce, cursorRadius, cursorStrength, dragSpeed, interactive, particles]);

  return <div className={`particle-sphere ${interactive ? "is-interactive" : ""} ${className}`.trim()} ref={hostRef} aria-hidden="true" />;
}
