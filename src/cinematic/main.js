import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sceneLayers } from './assets.js';
import { createCinematicScene } from './scene.js';
import { createScrollTimeline } from './timeline.js';

const initCinematicScroll = async () => {
  const section = document.querySelector('[data-cinematic-section]');
  const canvas = document.querySelector('[data-cinematic-canvas]');
  if (!section || !canvas) return;

  document.documentElement.classList.add('has-cinematic-scene');

  const scene = createCinematicScene({
    canvas,
    layers: sceneLayers
  });

  createScrollTimeline({
    section,
    camera: scene.camera,
    group: scene.group,
    layerMeshes: scene.layerMeshes,
    haze: scene.haze,
    onRefresh: scene.resize
  });

  const resizeObserver = new ResizeObserver(() => {
    scene.resize();
    ScrollTrigger.refresh();
  });
  resizeObserver.observe(section);

  if (new URLSearchParams(window.location.search).has('sceneGui')) {
    const { default: GUI } = await import('lil-gui');
    const gui = new GUI({ title: 'Cinematic scene' });
    gui.add(scene.camera.position, 'z', -6, 22, 0.1).name('camera z');
    gui.add(scene.camera.position, 'x', -4, 4, 0.01).name('camera x');
    gui.add(scene.camera.position, 'y', -3, 3, 0.01).name('camera y');
  }

  window.addEventListener('beforeunload', () => {
    resizeObserver.disconnect();
    scene.destroy();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCinematicScroll, { once: true });
} else {
  initCinematicScroll();
}
