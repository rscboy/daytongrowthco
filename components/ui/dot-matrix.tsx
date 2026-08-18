"use client";

import { useEffect, useRef } from "react";

type DotMatrixProps = {
  className?: string;
  cellSize?: number;
  speed?: number;
  frequency?: number;
  dotColor?: string;
};

/**
 * A deliberately light canvas version of the dot-matrix treatment. The field
 * uses layered sine noise rather than a WebGL dependency, pauses outside the
 * viewport, and holds a quiet static frame for reduced-motion visitors.
 */
export function DotMatrix({
  className = "",
  cellSize = 24,
  speed = 0.34,
  frequency = 0.78,
  dotColor = "188, 210, 255",
}: DotMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const host = canvas?.parentElement;
    if (!canvas || !context || !host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 1;
    let height = 1;
    let inView = true;
    let pageVisible = !document.hidden;
    let frame = 0;
    let lastFrame = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const phase = time * 0.001 * speed;
      for (let x = cellSize * 0.5; x < width + cellSize; x += cellSize) {
        for (let y = cellSize * 0.5; y < height + cellSize; y += cellSize) {
          const field =
            Math.sin(x * 0.014 * frequency + phase) * 0.48 +
            Math.sin(y * 0.017 * frequency - phase * 0.86) * 0.3 +
            Math.sin((x + y) * 0.009 * frequency + phase * 0.62) * 0.22;
          const density = Math.max(0, Math.min(1, (field + 1) * 0.5));
          const radius = 0.55 + density * 1.1;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fillStyle = `rgba(${dotColor}, ${0.055 + density * 0.25})`;
          context.fill();
        }
      }
    };

    const paint = (time: number) => {
      if (!inView || !pageVisible || reduceMotion) {
        frame = 0;
        return;
      }
      if (time - lastFrame >= 1000 / 30) {
        lastFrame = time;
        draw(time);
      }
      frame = window.requestAnimationFrame(paint);
    };

    const observer = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    observer.observe(host);
    const viewObserver = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      if (inView && !reduceMotion && pageVisible && !frame) frame = window.requestAnimationFrame(paint);
    }, { rootMargin: "160px" });
    viewObserver.observe(host);
    const onVisibilityChange = () => {
      pageVisible = !document.hidden;
      if (pageVisible && inView && !reduceMotion && !frame) frame = window.requestAnimationFrame(paint);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    resize();
    draw(0);
    if (!reduceMotion) frame = window.requestAnimationFrame(paint);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [cellSize, dotColor, frequency, speed]);

  return <div className={`dot-matrix ${className}`.trim()} aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
