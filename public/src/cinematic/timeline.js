import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const clamp01 = value => Math.max(0, Math.min(1, value));
const smoothWindow = (progress, start, end) => {
  const t = clamp01((progress - start) / Math.max(end - start, 0.001));
  return t * t * (3 - 2 * t);
};

export const createScrollTimeline = ({ section, camera, group, layerMeshes, haze, onRefresh }) => {
  const stage = section.querySelector('[data-cinematic-stage]');
  const timeline = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: stage,
      pinSpacing: false,
      anticipatePin: 1,
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh,
      onUpdate: self => {
        const progress = self.progress;
        layerMeshes.forEach(mesh => {
          const data = mesh.userData;
          const fadeIn = smoothWindow(progress, data.timing.fadeIn, data.timing.fadeIn + 0.16);
          const fadeOut = 1 - smoothWindow(progress, data.timing.fadeOut, Math.min(data.timing.fadeOut + 0.16, 1));
          const depthPush = 1 + progress * data.parallax * 0.72;

          mesh.material.opacity = data.opacity * fadeIn * fadeOut;
          mesh.scale.set(
            data.baseScale.x * depthPush,
            data.baseScale.y * depthPush,
            1
          );
          mesh.position.z = data.basePosition.z + progress * (3.8 + data.parallax * 3);
        });

        haze.material.opacity = 0.12 * (1 - smoothWindow(progress, 0.66, 0.96));
      }
    }
  });

  timeline
    .fromTo(camera.position, { z: 12, x: 0, y: 0.15 }, { z: 7.8, x: -0.8, y: 0.4, duration: 0.24 }, 0)
    .to(camera.position, { z: 3.8, x: 0.9, y: -0.15, duration: 0.3 }, 0.22)
    .to(camera.position, { z: 0.9, x: -0.38, y: 0.2, duration: 0.28 }, 0.52)
    .to(camera.position, { z: -3.2, x: 0.25, y: 0.05, duration: 0.22 }, 0.78)
    .fromTo(camera.rotation, { z: -0.012, y: 0.02 }, { z: 0.018, y: -0.035, duration: 0.5 }, 0)
    .to(camera.rotation, { z: -0.01, y: 0.025, duration: 0.5 }, 0.5)
    .fromTo(group.rotation, { y: -0.08, x: 0.02 }, { y: 0.1, x: -0.015, duration: 0.62 }, 0)
    .to(group.rotation, { y: -0.04, x: 0.01, duration: 0.38 }, 0.62);

  return timeline;
};
