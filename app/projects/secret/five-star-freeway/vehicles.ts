import * as T from 'three';
import { cars } from './game-model';
export function box(parent: T.Object3D, w: number, h: number, d: number, color: T.ColorRepresentation, x = 0, y = 0, z = 0, metalness = 0) { const m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshStandardMaterial({ color, roughness: metalness ? .27 : .8, metalness })); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
export function label(text: string, background = '#ece8d6', color = '#152324', width = 1024, height = 256) { const c = document.createElement('canvas'); c.width = width; c.height = height; const ctx = c.getContext('2d')!; ctx.fillStyle = background; ctx.fillRect(0, 0, width, height); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `600 ${Math.min(height * .48, width / Math.max(8, text.length) * 1.55)}px Arial`; ctx.fillText(text, width / 2, height / 2, width * .92); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; }
function panel(parent: T.Object3D, points: number[][], color: string, width: number) { const s = new T.Shape(); points.forEach(([z, y], i) => i ? s.lineTo(z, y) : s.moveTo(z, y)); s.closePath(); const geo = new T.ExtrudeGeometry(s, { depth: width, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .045, bevelThickness: .045 }); geo.rotateY(-Math.PI / 2); geo.translate(width / 2, 0, 0); const m = new T.Mesh(geo, new T.MeshStandardMaterial({ color, metalness: .65, roughness: .28 })); m.castShadow = true; parent.add(m); return m; }
export function makeCar(index: number, business = '', colorOverride?: string) {
    const v = cars[index];
    const g = new T.Group();
    const w = v.width, l = v.length, h = v.height;
    const suv = ['suv', 'large', 'crossover'].includes(v.type);
    const color = colorOverride || v.color;
    const front = -l / 2, rear = l / 2;
    const belt = suv ? 1.04 : .83;
    panel(g, [[front, .54], [front + .13, belt - .08], [-l * .24, belt + .03], [l * .36, belt + .04], [rear, belt - .05], [rear, .48]], color, w - .09);
    panel(g, [[-l * .25, belt], [-l * .13, h - .06], [suv ? l * .33 : l * .17, h - .06], [suv ? l * .39 : l * .31, belt]], color, w - .25);
    // Glazing follows the different rooflines; body pillars remain visible.
    for (const side of [-1, 1]) {
        const window = new T.Shape();
        const a = -l * .23, b = -l * .12, c = suv ? l * .32 : l * .17, d = suv ? l * .37 : l * .29;
        window.moveTo(a, belt + .07);
        window.lineTo(b, h - .13);
        window.lineTo(c, h - .13);
        window.lineTo(d, belt + .07);
        window.closePath();
        const geo = new T.ShapeGeometry(window);
        geo.rotateY(-Math.PI / 2);
        const glass = new T.Mesh(geo, new T.MeshStandardMaterial({ color: '#182c38', metalness: .65, roughness: .17, side: T.DoubleSide }));
        glass.position.x = side * (w / 2 - .06);
        g.add(glass);
        box(g, .06, h - belt, .075, color, side * (w / 2 - .035), (h + belt) / 2, .08);
        if (suv)
            box(g, .06, h - belt, .075, color, side * (w / 2 - .035), (h + belt) / 2, l * .23);
        box(g, .055, .045, l * .9, '#242a2e', side * w / 2, .64, 0);
        box(g, .06, .035, .18, '#c0c7c9', side * (w / 2 + .01), belt - .1, .27);
        box(g, .24, .15, .25, color, side * (w / 2 + .08), belt + .1, -l * .18);
        const decal = new T.Mesh(new T.PlaneGeometry(.72, .14), new T.MeshBasicMaterial({ map: label(business || 'DAYTONGROWTHCO', color, '#e8e7df'), side: T.DoubleSide }));
        decal.rotation.y = side * Math.PI / 2;
        decal.position.set(side * (w / 2 + .045), belt - .21, .14);
        g.add(decal);
    }
    const windshield = box(g, w - .37, .035, (h - belt) * 1.25, '#203b48', 0, (h + belt) / 2, -l * .18, .7);
    windshield.rotation.x = -.98;
    const backglass = box(g, w - .36, .03, suv ? .62 : .64, '#182e39', 0, (h + belt) / 2, suv ? l * .36 : l * .25, .65);
    backglass.rotation.x = suv ? 1.17 : .92;
    box(g, w - .08, .16, .13, '#252b2e', 0, .48, front - .035);
    box(g, w - .08, .13, .12, '#252b2e', 0, .48, rear + .035);
    const grilleH = v.type === 'large' ? .42 : .20;
    box(g, w * .47, grilleH, .035, '#131b20', 0, belt - .18, front - .07);
    for (let n = 0; n < (v.type === 'large' ? 5 : 3); n++)
        box(g, w * .44, .018, .045, '#a4aeb1', 0, belt - .18 - grilleH / 2 + .04 + n * grilleH / (v.type === 'large' ? 5 : 3), front - .095, .7);
    const lamps: T.Mesh[] = [];
    const brakes: T.Mesh[] = [];
    const signals: T.Mesh[] = [];
    for (const side of [-1, 1]) {
        const light = box(g, v.type === 'sport' ? .5 : .43, v.type === 'large' ? .32 : .15, .04, '#fff4d9', side * w * .35, belt - .12, front - .07);
        (light.material as T.MeshStandardMaterial).emissive.set('#fff1bf');
        lamps.push(light);
        const brake = box(g, v.type === 'large' ? .2 : .44, v.type === 'large' ? .48 : .16, .055, '#b81720', side * w * .36, belt - .1, rear + .04);
        brakes.push(brake);
        const signal = box(g, .12, .12, .065, '#cf8535', side * w * .44, belt - .13, rear + .06);
        signals.push(signal);
    }
    const plate = new T.Mesh(new T.PlaneGeometry(.75, .18), new T.MeshBasicMaterial({ map: label(business || 'FIVE STAR') }));
    plate.position.set(0, .64, rear + .081);
    g.add(plate);
    const wheels: T.Group[] = [];
    for (const x of [-1, 1])
        for (const z of [-l * .30, l * .30]) {
            const wheel = new T.Group();
            wheel.position.set(x * w / 2, .39, z);
            const tire = new T.Mesh(new T.CylinderGeometry(.37, .37, .24, 24), new T.MeshStandardMaterial({ color: '#121619', roughness: .95 }));
            tire.rotation.z = Math.PI / 2;
            wheel.add(tire);
            const rim = new T.Mesh(new T.CylinderGeometry(.25, .25, .252, 16), new T.MeshStandardMaterial({ color: '#919da4', metalness: .85, roughness: .25 }));
            rim.rotation.z = Math.PI / 2;
            wheel.add(rim);
            for (let j = 0; j < 5; j++) {
                const spoke = box(wheel, .265, .045, .43, '#d5dadd', 0, 0, 0, .8);
                spoke.rotation.x = j * Math.PI / 5;
            }
            g.add(wheel);
            wheels.push(wheel);
        }
    if (suv)
        for (const side of [-1, 1])
            box(g, .055, .045, l * .48, '#424a4d', side * w * .34, h + .035, l * .06, .65);
    g.userData = { wheels, lamps, brakes, signals };
    return g;
}
export function disposeScene(scene: T.Object3D) { const textures = new Set<T.Texture>(); const materials = new Set<T.Material>(); scene.traverse(o => { if (o instanceof T.Mesh || o instanceof T.Points) {
    o.geometry.dispose();
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        materials.add(m);
        for (const value of Object.values(m))
            if (value instanceof T.Texture)
                textures.add(value);
    }
} }); textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose()); }
