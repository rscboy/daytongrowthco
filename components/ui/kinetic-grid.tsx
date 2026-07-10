"use client";

import { useEffect, useRef } from "react";

type KineticGridProps = {
  className?: string;
  spacing?: number;
  radius?: number;
  strength?: number;
  dotColor?: string;
  lineColor?: string;
};

type Dot = { homeX: number; homeY: number; x: number; y: number; vx: number; vy: number };

/**
 * A deliberately quiet, pointer-only canvas texture. It draws once at rest
 * and only runs animation frames while the grid is reacting to a cursor.
 */
export function KineticGrid({
  className = "",
  spacing = 48,
  radius = 160,
  strength = 2,
  dotColor = "#dde9fc",
  lineColor = "#18174d",
}: KineticGridProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!host || !canvas || !context) return;
    const interactionTarget = host.parentElement ?? host;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let width = 1;
    let height = 1;
    let dots: Dot[] = [];
    let mouse = { x: -9999, y: -9999, active: false };
    let frame = 0;
    let animating = false;

    const build = (nextWidth?: number, nextHeight?: number) => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.floor(nextWidth ?? rect.width));
      height = Math.max(1, Math.floor(nextHeight ?? rect.height));
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * devicePixelRatio);
      canvas.height = Math.floor(height * devicePixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      dots = [];
      for (let x = 0; x <= width + spacing; x += spacing) {
        for (let y = 0; y <= height + spacing; y += spacing) {
          dots.push({ homeX: x, homeY: y, x, y, vx: 0, vy: 0 });
        }
      }
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const rows = Math.floor(height / spacing) + 2;

      for (let index = 0; index < dots.length; index += 1) {
        const dot = dots[index];
        const proximity = mouse.active
          ? Math.max(0, 1 - Math.hypot(mouse.x - dot.x, mouse.y - dot.y) / radius)
          : 0;
        const right = dots[index + rows];
        const down = dots[index + 1];
        context.strokeStyle = lineColor;
        context.lineWidth = 0.45 + proximity * 0.55;
        context.globalAlpha = 0.035 + proximity * 0.13;
        if (right) {
          context.beginPath();
          context.moveTo(dot.x, dot.y);
          context.lineTo(right.x, right.y);
          context.stroke();
        }
        if (down && index % rows !== rows - 1) {
          context.beginPath();
          context.moveTo(dot.x, dot.y);
          context.lineTo(down.x, down.y);
          context.stroke();
        }
        context.fillStyle = dotColor;
        context.globalAlpha = 0.13 + proximity * 0.25;
        context.beginPath();
        context.arc(dot.x, dot.y, 0.75 + proximity * 0.55, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    const tick = () => {
      let moving = false;
      for (const dot of dots) {
        let accelerationX = (dot.homeX - dot.x) * 0.075;
        let accelerationY = (dot.homeY - dot.y) * 0.075;
        if (mouse.active) {
          const distanceX = mouse.x - dot.x;
          const distanceY = mouse.y - dot.y;
          const distance = Math.hypot(distanceX, distanceY);
          if (distance > 0.001 && distance < radius) {
            const pull = (1 - distance / radius) * (strength / 10) * 3;
            accelerationX += (distanceX / distance) * pull;
            accelerationY += (distanceY / distance) * pull;
          }
        }
        dot.vx = (dot.vx + accelerationX) * 0.8;
        dot.vy = (dot.vy + accelerationY) * 0.8;
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (Math.abs(dot.vx) + Math.abs(dot.vy) > 0.015) moving = true;
      }
      draw();
      if (mouse.active || moving) {
        frame = window.requestAnimationFrame(tick);
      } else {
        animating = false;
      }
    };

    const startAnimation = () => {
      if (animating) return;
      animating = true;
      frame = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
      startAnimation();
    };
    const onPointerLeave = () => {
      mouse.active = false;
      startAnimation();
    };

    build();
    draw();
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      build(rect?.width, rect?.height);
      draw();
    });
    observer.observe(host);

    if (!reducedMotion && finePointer) {
      interactionTarget.addEventListener("pointermove", onPointerMove, { passive: true });
      interactionTarget.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      interactionTarget.removeEventListener("pointermove", onPointerMove);
      interactionTarget.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [dotColor, lineColor, radius, spacing, strength]);

  return (
    <div className={`kinetic-grid ${className}`.trim()} ref={hostRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
