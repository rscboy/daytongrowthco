'use client';
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import * as T from 'three';
import { box, makeCar, label, disposeScene } from './vehicles';
import { cars, hazards, moments, type Profile, type Run, type Settings } from './game-model';
import { RoadAudio } from './audio';
export type SceneProps = {
    mode: string;
    profile: Profile;
    settings: Settings;
    run: MutableRefObject<Run>;
    keys: MutableRefObject<Set<string>>;
    audio: MutableRefObject<RoadAudio | null>;
    onTick: () => void;
    onMoment: (index: number) => void;
    onFinish: () => void;
    onReady: () => void;
};
export default function RoadScene(props: SceneProps) {
    const host = useRef<HTMLDivElement>(null);
    const live = useRef(props);
    const [error, setError] = useState('');
    useEffect(() => { live.current = props; });
    useEffect(() => {
        if (!host.current)
            return;
        const root = host.current;
        let renderer: T.WebGLRenderer;
        try {
            renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        }
        catch {
            setError('This game needs WebGL 2. Try a current version of Chrome, Edge, Firefox, or Safari with hardware acceleration enabled.');
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, props.settings.quality === 'low' ? 1 : 1.6));
        renderer.shadowMap.enabled = props.settings.quality !== 'low';
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        root.appendChild(renderer.domElement);
        renderer.domElement.setAttribute('aria-label', 'Three-dimensional Dayton highway driving scene');
        const scene = new T.Scene();
        scene.background = new T.Color('#8b9fae');
        scene.fog = new T.Fog('#9fa6ae', 90, 440);
        const camera = new T.PerspectiveCamera(53, 1, .1, 1100);
        const ambient = new T.HemisphereLight('#c8def5', '#514a38', 2.1);
        scene.add(ambient);
        const sun = new T.DirectionalLight('#ffd6a1', 3.8);
        sun.position.set(-65, 85, -180);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.bias = -.0004;
        sun.shadow.normalBias = .06;
        sun.shadow.camera.left = -35;
        sun.shadow.camera.right = 35;
        sun.shadow.camera.top = 60;
        sun.shadow.camera.bottom = -60;
        scene.add(sun);
        sun.target.position.set(0, 0, -30);
        scene.add(sun.target);
        const ground = box(scene, 1600, .2, 1600, '#525e48', 0, -.3, -200);
        ground.receiveShadow = true;
        const road = box(scene, 27, .10, 1300, '#323a40', -5.5, -.03, -430);
        const asphalt = road.material as T.MeshStandardMaterial;
        asphalt.roughness = .83;
        box(scene, .5, .8, 1300, '#898c85', -6, .35, -430);
        box(scene, .18, .06, 1300, '#d3b878', -5.45, .04, -430);
        box(scene, .12, .03, 1300, '#e6e2d3', 6.2, .04, -430);
        box(scene, .12, .03, 1300, '#e6e2d3', -17.3, .04, -430);
        // A continuous auxiliary ramp peels away from the through lanes.
        const ramp = new T.Group();
        scene.add(ramp);
        for (let i = 0; i < 70; i++) {
            const z = 25 - i * 6;
            const offset = 4.2 + Math.max(0, (-z - 25)) * .14;
            const slab = box(ramp, 4.5, .09, 6.2, '#3c4448', offset, .01, z);
            slab.rotation.y = -.14;
            box(ramp, .12, .025, 5.9, '#ebe6d7', offset + 2, .08, z).rotation.y = -.14;
        }
        ramp.visible = false;
        const stripes: T.Mesh[] = [];
        for (let i = 0; i < 90; i++)
            for (const x of [-13.5, -9.6, -1.8, 2.2])
                stripes.push(box(scene, .12, .025, 4.8, '#e5e3da', x, .045, 30 - i * 11));
        const scenery = new T.Group();
        scene.add(scenery);
        for (let i = 0; i < 95; i++) {
            const side = i % 2 ? 1 : -1;
            const x = side * (24 + (i * 13) % 72);
            const z = 40 - i * 6.2;
            const trunk = box(scenery, .65, 3, .65, '#544c3e', x, 1.5, z);
            trunk.castShadow = false;
            const tree = new T.Mesh(new T.ConeGeometry(2.5 + (i % 3), 7 + (i % 5), 7), new T.MeshStandardMaterial({ color: i % 3 ? '#384f42' : '#637053', roughness: 1 }));
            tree.position.set(x, 6, z);
            scenery.add(tree);
            if (i % 6 === 0) {
                const h = 6 + (i % 5) * 5;
                box(scenery, 10, h, 13, '#777d79', side * (48 + i % 27), h / 2, z);
                for (let j = 0; j < 4; j++)
                    box(scenery, .03, 1, 7, '#d5b982', side * (48 + i % 27) - side * 5.03, 2 + j * 2, z);
            }
        }
        // Downtown massing and two overpasses give the horizon depth.
        for (let i = 0; i < 18; i++) {
            const h = 10 + (i * 17) % 51;
            box(scene, 7 + i % 4, h, 9, '#6d7c84', -65 - i * 7, h / 2, -280 - (i % 4) * 21);
        }
        for (const z of [-180, -460]) {
            box(scene, 170, .9, 12, '#888f8f', 0, 7, z);
            for (const x of [-23, 20, 48])
                box(scene, 1.4, 7, 3, '#777c79', x, 3, z);
            box(scene, 170, .6, .25, '#b0b3af', 0, 7.8, z + 5);
        }
        const lamps = new T.Group();
        scene.add(lamps);
        for (let i = 0; i < 17; i++) {
            const z = 20 - i * 32;
            box(lamps, .16, 9, .16, '#788080', 7.5, 4.5, z);
            box(lamps, 3, .14, .18, '#8a9090', 6.1, 9, z);
            const m = box(lamps, .8, .07, .45, '#fff1c4', 4.8, 8.9, z);
            (m.material as T.MeshStandardMaterial).emissive.set('#f5d390');
        }
        function sign(text: string, w: number, h: number) { const mesh = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: label(text, '#175843', '#f5f5e5', 1024, 300) })); return mesh; }
        const gantry = new T.Group();
        scene.add(gantry);
        box(gantry, .28, 9, .28, '#a1aaa8', -5, 4.5, 0);
        box(gantry, .28, 9, .28, '#a1aaa8', 9, 4.5, 0);
        box(gantry, 14, .28, .28, '#a1aaa8', 2, 8.8, 0);
        const signLeft = sign('I-75 NORTH • Toledo  ↑', 7, 2.25);
        signLeft.position.set(-1, 7.35, .1);
        gantry.add(signLeft);
        const signRight = sign('US 35 EAST • Xenia  ↗', 6.2, 2.25);
        signRight.position.set(6, 7.35, .1);
        gantry.add(signRight);
        gantry.position.z = -100;
        const billboard = new T.Group();
        box(billboard, .4, 8, .4, '#8d9793', 0, 4, 0);
        const board = sign(`${props.profile.name} • Great service. Real feedback.`, 15, 3.8);
        board.position.y = 8;
        billboard.add(board);
        billboard.position.set(21, 0, -70);
        scene.add(billboard);
        const highway = new T.Group();
        for (const item of [...scene.children])
            if (item instanceof T.Mesh || item instanceof T.Group)
                highway.add(item);
        scene.add(highway);
        const skyCanvas = document.createElement('canvas');
        skyCanvas.width = 8;
        skyCanvas.height = 512;
        const skyCtx = skyCanvas.getContext('2d')!;
        const skyGradient = skyCtx.createLinearGradient(0, 0, 0, 512);
        skyGradient.addColorStop(0, '#344d69');
        skyGradient.addColorStop(.48, '#8d9dab');
        skyGradient.addColorStop(.72, '#d9b191');
        skyGradient.addColorStop(1, '#e3c5a6');
        skyCtx.fillStyle = skyGradient;
        skyCtx.fillRect(0, 0, 8, 512);
        const skyTexture = new T.CanvasTexture(skyCanvas);
        skyTexture.colorSpace = T.SRGBColorSpace;
        const car = makeCar(props.settings.car, props.profile.name);
        scene.add(car);
        car.position.set(0, 0, 2);
        const garage = new T.Group();
        scene.add(garage);
        const floor = new T.Mesh(new T.CylinderGeometry(5.6, 5.8, .22, 80), new T.MeshStandardMaterial({ color: '#4b5559', metalness: .5, roughness: .35 }));
        floor.position.y = -.04;
        garage.add(floor);
        const ring = new T.Mesh(new T.TorusGeometry(5.45, .025, 8, 100), new T.MeshBasicMaterial({ color: '#d9e77b' }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = .09;
        garage.add(ring);
        const headlights = new T.SpotLight('#fff0c8', 0, 100, .40, .65, 1);
        headlights.position.set(0, 1.1, 0);
        headlights.target.position.set(0, 0, -50);
        scene.add(headlights, headlights.target);
        const traffic: T.Group[] = [];
        for (let i = 0; i < 14; i++) {
            const a = makeCar(i % 6, '', ['#797d7e', '#d8d1be', '#59757b', '#983f36'][i % 4]);
            a.position.set([-3.8, .2, 4.2][i % 3], 0, -35 - i * 27);
            a.userData.speed = 13 + i % 5 * 2.3;
            a.userData.lane = i % 3;
            a.userData.cooldown = 0;
            scene.add(a);
            traffic.push(a);
        }
        const convoy: T.Group[] = [];
        for (let i = 0; i < 12; i++) {
            const a = makeCar((i + 2) % 6, 'CUSTOMER');
            a.scale.setScalar(.95);
            a.position.set(i % 2 ? -3.7 : 4.2, 0, 15 + Math.floor(i / 2) * 8);
            scene.add(a);
            convoy.push(a);
        }
        const obstacle = new T.Group();
        scene.add(obstacle);
        let hazardIndex = -1;
        let obstacleLane = 0;
        let obstacleHit = false;
        function buildHazard(index: number) { while (obstacle.children.length) {
            const child = obstacle.children[0];
            disposeScene(child);
            obstacle.remove(child);
        } const type = index % 8; if (type === 0 || type === 7) {
            const stalled = makeCar(type === 0 ? 2 : 3);
            obstacle.add(stalled);
        } if (type === 1) {
            const tire = new T.Mesh(new T.TorusGeometry(.56, .22, 12, 20), new T.MeshStandardMaterial({ color: '#191c1d' }));
            tire.position.y = .9;
            obstacle.add(tire);
        } if (type === 2) {
            const m = box(obstacle, 2.2, .35, 1.65, '#d6c9ac', 0, .4, 0);
            m.rotation.z = .12;
            for (let i = 0; i < 6; i++)
                box(obstacle, 2.21, .02, .015, '#b6aa96', 0, .59, -.65 + i * .25);
        } if (type === 3) {
            const barrel = new T.Mesh(new T.CylinderGeometry(.45, .58, 1.1, 12), new T.MeshStandardMaterial({ color: '#e47d32' }));
            barrel.position.y = .6;
            obstacle.add(barrel);
            box(obstacle, 1, .18, .8, '#ebe0ca', 0, .65, 0);
        } if (type === 4) {
            box(obstacle, .9, .08, .8, '#567a72', 0, .65, 0);
            box(obstacle, .9, .8, .08, '#567a72', 0, 1, -.35);
            for (const x of [-.4, .4])
                box(obstacle, .05, .7, .05, '#ccd1cd', x, .3, .3);
        } if (type === 5) {
            box(obstacle, 1.8, .3, 3, '#6d797a', 0, .5, 0);
            box(obstacle, 2, 1.8, 2.8, '#ae8961', 0, 1.4, 0);
            for (const x of [-1, 1])
                box(obstacle, .2, .6, .6, '#171b1d', x, .35, .6);
        } if (type === 6) {
            box(obstacle, .9, .65, .6, '#396d94', 0, .35, 0);
            box(obstacle, .95, .07, .6, '#ece7d6', .4, .9, .1);
            for (let i = 0; i < 6; i++)
                box(obstacle, .15, .18, .15, i % 2 ? '#d5a156' : '#dedbd1', Math.sin(i) * 1.5, .14, Math.cos(i));
        } obstacleLane = [4.2, -3.8, .2, 4.2, -3.8, 4.2, .2, -3.8][type]; obstacle.position.set(obstacleLane, 0, -155); obstacleHit = false; }
        const particlesGeo = new T.BufferGeometry();
        const particlePositions = new Float32Array(600 * 3);
        for (let i = 0; i < 600; i++) {
            particlePositions[i * 3] = (Math.random() - .5) * 80;
            particlePositions[i * 3 + 1] = Math.random() * 30;
            particlePositions[i * 3 + 2] = 20 - Math.random() * 150;
        }
        particlesGeo.setAttribute('position', new T.BufferAttribute(particlePositions, 3));
        const particles = new T.Points(particlesGeo, new T.PointsMaterial({ color: '#e8edf1', size: .08, transparent: true, opacity: .6 }));
        scene.add(particles);
        let frame = 0, last = 0, tick = 0, decor = 0, x = 0, steering = 0, hitCooldown = 0, shownMoment = -1, branch = 0, branchShift = 0, flash = 0, slowFrames = 0;
        let signState = '';
        let signalTime = 0;
        let qualityState = '';
        const resize = () => { const w = root.clientWidth, h = root.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(root);
        resize();
        const contextLost = (event: Event) => { event.preventDefault(); setError('Graphics were interrupted. Reload the page to restart your run.'); };
        renderer.domElement.addEventListener('webglcontextlost', contextLost);
        props.onReady();
        function animate(now: number) {
            frame = requestAnimationFrame(animate);
            const dt = Math.min(.045, (now - last) / 1000 || .016);
            last = now;
            const p = live.current, r = p.run.current, s = p.settings;
            const playing = p.mode === 'driving';
            if (p.mode === 'driving' || p.mode === 'landing' || p.mode === 'garage')
                decor += dt;
            const showroom = p.mode === 'garage';
            const menu = p.mode === 'landing' || p.mode === 'setup';
            garage.visible = showroom;
            highway.visible = !showroom;
            ground.visible = !showroom;
            road.visible = !showroom;
            scenery.visible = !showroom;
            lamps.visible = !showroom;
            gantry.visible = !showroom;
            billboard.visible = !showroom;
            const v = cars[s.car];
            if (qualityState !== s.quality) {
                renderer.setPixelRatio(s.quality === 'low' ? 1 : Math.min(window.devicePixelRatio, 1.6));
                renderer.shadowMap.enabled = s.quality !== 'low';
                qualityState = s.quality;
            }
            const isNight = s.weather === 'night', isRain = s.weather === 'rain', isSnow = s.weather === 'snow';
            scene.background = new T.Color(showroom ? '#192429' : isNight ? '#101d2e' : s.weather === 'day' ? '#b2cbdc' : isSnow ? '#aebcc1' : '#8799a9');
            const fog = scene.fog as T.Fog;
            fog.color.set(showroom ? '#192429' : isNight ? '#101d2e' : s.weather === 'sunset' ? '#c7b6a4' : '#aebcc1');
            if (!showroom && s.weather === 'sunset')
                scene.background = skyTexture;
            fog.near = showroom ? 100 : isRain ? 50 : 70 + r.momentum * .7;
            fog.far = showroom ? 600 : isNight ? 260 : 180 + r.momentum * 3;
            sun.intensity = showroom ? 3 : isNight ? .3 : 3.4;
            ambient.intensity = isNight ? .8 : 2;
            asphalt.roughness = isRain ? .24 : .85;
            particles.visible = !showroom && (isRain || isSnow);
            (particles.material as T.PointsMaterial).size = isSnow ? .16 : .055;
            if (particles.visible && playing) {
                for (let i = 0; i < 600; i++) {
                    particlePositions[i * 3 + 1] -= dt * (isSnow ? 2 : 22);
                    particlePositions[i * 3 + 2] += dt * r.speed * .18;
                    if (particlePositions[i * 3 + 1] < 0)
                        particlePositions[i * 3 + 1] = 30;
                    if (particlePositions[i * 3 + 2] > 22)
                        particlePositions[i * 3 + 2] = -130;
                }
                particlesGeo.attributes.position.needsUpdate = true;
            }
            const keys = p.keys.current;
            let accel = keys.has('ArrowUp') || keys.has('w'), brake = keys.has('ArrowDown') || keys.has('s');
            let turn = (keys.has('ArrowRight') || keys.has('d') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('a') ? 1 : 0);
            const pad = navigator.getGamepads?.()?.find(g => g?.connected);
            if (pad && playing) {
                turn += Math.abs(pad.axes[0]) > .13 ? pad.axes[0] : 0;
                accel = accel || pad.buttons[7]?.value > .1;
                brake = brake || pad.buttons[6]?.value > .1;
            }
            if (playing) {
                r.time += dt;
                const traction = isRain || isSnow ? v.grip / 12 : 1;
                const acceleration = accel ? v.power * .30 : -3.8;
                r.speed = T.MathUtils.clamp(r.speed + (acceleration - (brake ? 35 : 0)) * dt, 0, v.power * 2.5 + (r.momentum > 80 ? 8 : 0));
                steering = T.MathUtils.damp(steering, turn * v.steer * traction, 6, dt);
                x = T.MathUtils.clamp(x + steering * dt * (.6 + r.speed / 50), -4.9, 5.6);
                r.distance += r.speed * .000277778 * dt;
                r.driving += dt * r.speed * .6;
                r.momentum = Math.max(0, r.momentum - dt * (r.system === true ? .12 : r.system === false ? .85 : .4));
                if (r.time - r.lastReview > 24)
                    r.trust = Math.max(0, r.trust - dt * (r.system === true ? .08 : .24));
                hitCooldown = Math.max(0, hitCooldown - dt);
                flash = Math.max(0, flash - dt);
                if (r.time > 6 && r.speed < 5 && r.time < 10)
                    r.message = 'Hold W or ↑ to accelerate. Touch drivers: hold GO.';
                const nextMoment = moments.findIndex((m, i) => i > shownMoment && r.time >= m.at);
                if (nextMoment >= 0) {
                    shownMoment = nextMoment;
                    p.audio.current?.beep(660, s);
                    p.onMoment(nextMoment);
                }
                if (r.time >= 150) {
                    r.finished = true;
                    p.onFinish();
                }
                const hIndex = Math.min(7, Math.floor((r.time - 7) / 17));
                if (hIndex >= 0 && hIndex > hazardIndex) {
                    hazardIndex = hIndex;
                    buildHazard(hIndex);
                    r.hazard = hazards[hIndex];
                    r.message = `Heads up: ${hazards[hIndex]}. Leave room and steer around it.`;
                }
                if (hazardIndex >= 0) {
                    obstacle.position.z += Math.max(12, r.speed / 3.6) * dt;
                    const type = hazardIndex % 8;
                    if (type === 1) {
                        obstacle.position.x = obstacleLane + Math.sin(r.time * 1.3) * 2;
                        obstacle.rotation.z += dt * 4;
                        obstacle.position.y = Math.abs(Math.sin(r.time * 4)) * .4;
                    }
                    if (type === 5)
                        obstacle.rotation.y = Math.sin(r.time * 2) * .17;
                    if (type === 7)
                        obstacle.position.x = obstacleLane + Math.max(0, obstacle.position.z + 35) * .08;
                    if (Math.abs(obstacle.position.z - 2) < 3 && Math.abs(obstacle.position.x - x) < 1.65 && !obstacleHit) {
                        obstacleHit = true;
                        collide();
                    }
                    if (obstacle.position.z > 12)
                        r.hazard = '';
                }
                // Choices are made by physically positioning the vehicle as the ramp arrives.
                const branchTimes = [41, 93, 119];
                if (branch < branchTimes.length) {
                    const end = branchTimes[branch];
                    ramp.visible = r.time > end - 10 && r.time < end;
                    if (r.time > end - 8 && r.time < end)
                        r.next = branch === 0 ? '← I-75 N / US 35 E →' : branch === 1 ? (r.route.startsWith('US') ? '← US 35 E / I-675 N →' : '← I-75 N / I-70 E →') : '← Manual process / Review system →';
                    if (r.time >= end) {
                        const right = x > 1.5;
                        if (branch === 0) {
                            r.route = right ? 'US 35 EAST' : 'I-75 NORTH';
                            r.destination = right ? 'Xenia · Chillicothe' : 'Toledo';
                            r.message = right ? 'Ramp taken: US 35 east toward Xenia.' : 'Continuing I-75 north toward Toledo.';
                        }
                        else if (branch === 1) {
                            if (right) {
                                r.route = r.route.startsWith('US') ? 'I-675 NORTH' : 'I-70 EAST';
                                r.destination = r.route.startsWith('I-675') ? 'I-70 · Springfield' : 'Columbus';
                            }
                            r.message = `Continuing on ${r.route}. Your route, your run.`;
                            const lost = r.trust < 72 ? 2 : 1;
                            r.convoy = Math.max(0, r.convoy - lost);
                            r.message += ` ${lost} customer vehicle${lost > 1 ? 's chose' : ' chose'} Another Local Company: 4.8 stars, 214 reviews, weekly activity and visible responses. Illustrative customer choice.`;
                        }
                        else {
                            r.system = right;
                            r.message = right ? 'Review system: consistent requests, one polite follow-up, and professional responses. Momentum holds.' : 'Manual process: forgotten requests create gaps. Notice the fading momentum.';
                            r.momentum = Math.min(100, r.momentum + (right ? 20 : -20));
                            r.convoy = Math.max(0, Math.min(12, r.convoy + (right ? 2 : -2)));
                        }
                        if (right) {
                            branchShift = 1;
                            r.driving += 250;
                            r.routeChoices++;
                        }
                        r.next = branch === 0 ? (right ? 'I-675 NORTH • Eastern bypass' : 'I-70 EAST • Columbus') : branch === 1 ? 'Reputation crossroads' : 'Finish • Your review roadmap';
                        branch++;
                    }
                }
                if (keys.has('q') || keys.has('e')) {
                    signalTime += dt;
                    if (signalTime > .6) {
                        p.audio.current?.beep(480, s, .045);
                        signalTime = 0;
                    }
                }
            }
            function collide() { if (hitCooldown > 0)
                return; hitCooldown = s.difficulty === 'relaxed' ? 3 : 1.5; r.collisions++; r.speed *= .45; r.driving = Math.max(0, r.driving - 200); r.message = 'A little bodywork, a little perspective. −200 driving points. Keep going.'; flash = .7; p.audio.current?.beep(75, s, .25); }
            const movement = (playing ? r.speed / 3.6 : menu ? 19 : 0) * dt;
            stripes.forEach(a => { a.visible = !showroom; a.position.z += movement; if (a.position.z > 40)
                a.position.z -= 990; });
            scenery.position.z = (scenery.position.z + movement) % 100;
            lamps.position.z = (lamps.position.z + movement) % 32;
            billboard.position.z += movement;
            if (billboard.position.z > 50)
                billboard.position.z = -400;
            const signs = branch === 0 ? ['I-75 NORTH • Toledo  ↑', 'US 35 EAST • Xenia  ↗'] : branch === 1 ? (r.route.startsWith('US') ? ['US 35 EAST • Xenia  ↑', 'I-675 NORTH • I-70  ↗'] : ['I-75 NORTH • Toledo  ↑', 'I-70 EAST • Columbus  ↗']) : ['Keep doing it manually  ↑', 'Build a review system  ↗'];
            if (signState !== signs.join('|')) {
                [signLeft, signRight].forEach((m, i) => { m.material.map?.dispose(); m.material.map = label(signs[i], '#175843', '#f5f5e5', 1024, 300); m.material.needsUpdate = true; });
                signState = signs.join('|');
            }
            gantry.position.z = playing && branch < 3 ? -Math.max(4, ([41, 93, 119][branch] - r.time) * 8) : -110 + (decor * 18 % 150);
            ramp.visible = ramp.visible && !showroom;
            traffic.forEach((a, i) => { a.visible = !showroom; if (!a.visible)
                return; if (playing || menu) {
                a.position.z += movement - a.userData.speed * dt;
                if (a.position.z > 40) {
                    a.position.z = -300 - i * 14;
                    a.userData.cooldown = 0;
                }
                if (a.position.z < -530)
                    a.position.z = -60 - i * 22;
                const target = [-3.8, .2, 4.2][a.userData.lane];
                a.position.x = T.MathUtils.damp(a.position.x, target, 1.2, dt);
                if (i % 4 === 0 && Math.sin(decor * .1 + i) > .999)
                    a.userData.lane = (a.userData.lane + 1) % 3;
                if (playing && Math.abs(a.position.z - 2) < 3.5 && Math.abs(a.position.x - x) < 1.7)
                    collide();
                if (playing && a.position.z > 6 && a.position.z < 8 && !a.userData.cooldown && Math.abs(a.position.x - x) < 2.4) {
                    a.userData.cooldown = 1;
                    r.driving += 75;
                }
            } a.userData.wheels.forEach((w: T.Group) => w.rotation.x -= dt * 5); a.userData.brakes.forEach((m: T.Mesh) => { (m.material as T.MeshStandardMaterial).emissive.set('#6e1217'); }); });
            convoy.forEach((a, i) => { a.visible = playing || p.mode === 'paused' || p.mode === 'moment'; a.visible = a.visible && i < r.convoy; a.position.x = (i % 2 ? -3.7 : 4.2) + Math.sin(decor + i) * .1; a.userData.wheels.forEach((w: T.Group) => w.rotation.x -= movement * 2); });
            obstacle.visible = !showroom && hazardIndex >= 0 && obstacle.position.z < 35;
            branchShift = Math.max(0, branchShift - dt * .24);
            car.position.set(showroom ? 0 : x, showroom ? 0 : (!s.reducedMotion ? Math.sin(decor * 9) * .014 * r.speed / 80 : 0), showroom ? 0 : 2);
            car.rotation.y = showroom ? (s.reducedMotion ? -.55 : decor * .18) : steering * .045 - branchShift * .13;
            car.rotation.z = showroom ? 0 : (!s.reducedMotion ? -steering * .025 : 0);
            car.userData.wheels.forEach((w: T.Group, i: number) => { if (playing)
                w.rotation.x -= movement * 2; if (i % 2 === 0)
                w.rotation.y = steering * .12; });
            car.userData.brakes.forEach((m: T.Mesh) => (m.material as T.MeshStandardMaterial).emissive.set(brake ? '#ff2030' : '#4d0b0c'));
            car.userData.signals.forEach((m: T.Mesh, i: number) => (m.material as T.MeshStandardMaterial).emissive.set((keys.has(i ? 'e' : 'q') && Math.sin(decor * 10) > 0) ? '#ffa525' : '#000000'));
            const lights = isNight || keys.has('l');
            headlights.intensity = lights ? (keys.has('b') ? 55 : 26) : 0;
            headlights.position.x = x;
            headlights.target.position.x = x;
            car.visible = showroom || menu || s.camera === 0;
            if (showroom) {
                camera.position.set(7.7, 3.8, 8.4);
                camera.lookAt(window.innerWidth > 650 ? 2 : .0, .8, window.innerWidth > 650 ? -1 : 0);
            }
            else if (menu) {
                camera.position.set(13, 6.8, 16);
                camera.lookAt(-1, 1, -35);
            }
            else if (keys.has('r')) {
                camera.position.set(x, 3, 0);
                camera.lookAt(x, 1, 40);
            }
            else if (s.camera === 0) {
                camera.position.set(x * .43 + branchShift * 2, 4.4, 11.5);
                camera.lookAt(x * .5, .7, -25);
            }
            else {
                camera.position.set(x, s.camera === 1 ? 1.35 : 1.55, s.camera === 1 ? -1.5 : .4);
                camera.lookAt(x, 1.3, -80);
            }
            if (flash > 0 && !s.reducedMotion)
                camera.position.y += Math.sin(flash * 45) * .07;
            p.audio.current?.update(r.speed, v.pitch, s, playing, r.momentum);
            renderer.render(scene, camera);
            tick += dt;
            if (tick > .12) {
                tick = 0;
                p.onTick();
            }
            if (s.quality === 'auto' && dt > .032)
                slowFrames++;
            if (slowFrames > 100) {
                renderer.setPixelRatio(1);
                renderer.shadowMap.enabled = false;
                slowFrames = 0;
            }
        }
        frame = requestAnimationFrame(animate);
        return () => { cancelAnimationFrame(frame); resizeObserver.disconnect(); renderer.domElement.removeEventListener('webglcontextlost', contextLost); disposeScene(scene); skyTexture.dispose(); renderer.dispose(); renderer.domElement.remove(); };
        // Scene identity changes only when selecting a vehicle or applying a profile.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.settings.car, props.profile.name]);
    return <div className="ff-scene" ref={host}>{error && <div className="ff-graphics-error" role="alert"><h2>Graphics unavailable</h2><p>{error}</p><button onClick={() => window.location.reload()}>Reload game</button></div>}</div>;
}
