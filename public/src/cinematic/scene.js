import * as THREE from 'three';

const makeRoundRectPath = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

const createPlaceholderTexture = layer => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, layer.colorA);
  gradient.addColorStop(1, layer.colorB);

  makeRoundRectPath(ctx, 42, 42, canvas.width - 84, canvas.height - 84, 54);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  for (let x = 96; x < canvas.width - 96; x += 92) {
    ctx.beginPath();
    ctx.moveTo(x, 96);
    ctx.lineTo(x, canvas.height - 96);
    ctx.stroke();
  }
  for (let y = 112; y < canvas.height - 96; y += 74) {
    ctx.beginPath();
    ctx.moveTo(96, y);
    ctx.lineTo(canvas.width - 96, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = layer.id.includes('site') || layer.id.includes('lead') ? '#0f172a' : '#ffffff';
  ctx.font = '700 54px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText(layer.label, 118, 180);
  ctx.font = '500 28px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.globalAlpha = 0.72;
  ctx.fillText('Replace this placeholder in src/cinematic/assets.js', 118, 232);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
};

const loadLayerTexture = (layer, textureLoader) => {
  if (!layer.imageUrl) return createPlaceholderTexture(layer);

  const texture = textureLoader.load(layer.imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};

export const createCinematicScene = ({ canvas, layers }) => {
  const section = canvas.closest('[data-cinematic-section]');
  const stage = canvas.closest('[data-cinematic-stage]');
  const textureLoader = new THREE.TextureLoader();
  const sizes = { width: 1, height: 1 };
  const mouse = new THREE.Vector2(0, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07111f, 0.038);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  camera.position.set(0, 0.15, 12);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: window.devicePixelRatio <= 1.5,
    powerPreference: 'high-performance'
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.45);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.6);
  directionalLight.position.set(4, 6, 8);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(1024, 1024);
  scene.add(directionalLight);

  const rimLight = new THREE.DirectionalLight(0x7c6dfa, 1.15);
  rimLight.position.set(-5, 2, 3);
  scene.add(rimLight);

  const group = new THREE.Group();
  scene.add(group);

  const planeGeometry = new THREE.PlaneGeometry(1, 1, 48, 32);
  const layerMeshes = layers.map(layer => {
    const texture = loadLayerTexture(layer, textureLoader);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: layer.opacity,
      roughness: 0.72,
      metalness: 0.04,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(planeGeometry, material);
    mesh.position.set(layer.x, layer.y, layer.z);
    mesh.rotation.set(0, layer.rotation, layer.rotation * 0.45);
    mesh.scale.set(layer.width * layer.scale, layer.height * layer.scale, 1);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      ...layer,
      basePosition: new THREE.Vector3(layer.x, layer.y, layer.z),
      baseScale: mesh.scale.clone(),
      floatOffset: Math.random() * Math.PI * 2
    };
    group.add(mesh);
    return mesh;
  });

  const hazeMaterial = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.1,
    depthWrite: false
  });
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), hazeMaterial);
  haze.position.set(0, 0, -9);
  scene.add(haze);

  const resize = () => {
    const rect = stage?.getBoundingClientRect() || canvas.getBoundingClientRect();
    sizes.width = Math.max(1, Math.floor(rect.width));
    sizes.height = Math.max(1, Math.floor(rect.height));

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setSize(sizes.width, sizes.height, false);
  };

  const onPointerMove = event => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    mouse.y = -(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const render = time => {
    const elapsed = time * 0.001;

    group.rotation.y += ((mouse.x * 0.045) - group.rotation.y) * 0.045;
    group.rotation.x += ((mouse.y * 0.025) - group.rotation.x) * 0.045;
    haze.material.opacity = 0.085 + Math.sin(elapsed * 0.55) * 0.018;

    layerMeshes.forEach(mesh => {
      const data = mesh.userData;
      mesh.position.y = data.basePosition.y + Math.sin(elapsed * 0.5 + data.floatOffset) * 0.045;
      mesh.position.x = data.basePosition.x + mouse.x * data.parallax * 0.18;
      mesh.rotation.z = data.rotation * 0.45 + Math.sin(elapsed * 0.35 + data.floatOffset) * 0.01;
    });

    renderer.render(scene, camera);
  };

  renderer.setAnimationLoop(render);
  resize();

  window.addEventListener('resize', resize, { passive: true });
  section?.addEventListener('pointermove', onPointerMove, { passive: true });

  const destroy = () => {
    renderer.setAnimationLoop(null);
    window.removeEventListener('resize', resize);
    section?.removeEventListener('pointermove', onPointerMove);
    planeGeometry.dispose();
    haze.geometry.dispose();
    haze.material.dispose();
    layerMeshes.forEach(mesh => {
      mesh.material.map?.dispose();
      mesh.material.dispose();
    });
    renderer.dispose();
  };

  return {
    scene,
    camera,
    renderer,
    group,
    layerMeshes,
    haze,
    resize,
    destroy
  };
};
