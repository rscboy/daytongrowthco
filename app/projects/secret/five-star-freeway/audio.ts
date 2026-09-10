import type { Settings } from './game-model';
export class RoadAudio {
    ctx: AudioContext | null = null;
    engine?: OscillatorNode;
    engineGain?: GainNode;
    windGain?: GainNode;
    musicGain?: GainNode;
    nodes: AudioScheduledSourceNode[] = [];
    start() { if (this.ctx) {
        void this.ctx.resume();
        return;
    } try {
        const ctx = new AudioContext();
        this.ctx = ctx;
        const engine = ctx.createOscillator();
        engine.type = 'sawtooth';
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 240;
        const gain = ctx.createGain();
        gain.gain.value = 0;
        engine.connect(filter).connect(gain).connect(ctx.destination);
        engine.start();
        this.engine = engine;
        this.engineGain = gain;
        this.nodes.push(engine);
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++)
            data[i] = (Math.random() * 2 - 1) * .2;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const ng = ctx.createGain();
        ng.gain.value = 0;
        noise.connect(ng).connect(ctx.destination);
        noise.start();
        this.windGain = ng;
        this.nodes.push(noise);
        const mg = ctx.createGain();
        mg.gain.value = 0;
        mg.connect(ctx.destination);
        this.musicGain = mg;
        [110, 164.81, 220].forEach(f => { const n = ctx.createOscillator(); n.type = 'sine'; n.frequency.value = f; n.connect(mg); n.start(); this.nodes.push(n); });
    }
    catch { } }
    update(speed: number, pitch: number, s: Settings, playing: boolean, momentum: number) { if (!this.ctx)
        return; const now = this.ctx.currentTime; const active = playing && !s.muted; this.engine?.frequency.setTargetAtTime(pitch + speed * .95, now, .15); this.engineGain?.gain.setTargetAtTime(active ? s.vehicle / 100 * .045 : 0, now, .1); this.windGain?.gain.setTargetAtTime(active ? s.environment / 100 * (speed / 180 + (s.weather === 'rain' ? .15 : 0)) : 0, now, .15); this.musicGain?.gain.setTargetAtTime(active ? s.music / 100 * .014 * (.4 + momentum / 100) : 0, now, .2); }
    beep(frequency: number, s: Settings, duration = .13) { if (!this.ctx || s.muted)
        return; const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.frequency.value = frequency; g.gain.setValueAtTime(s.ui / 100 * .055, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001, this.ctx.currentTime + duration); o.connect(g).connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime + duration); o.onended = () => { o.disconnect(); g.disconnect(); }; }
    dispose() { this.nodes.forEach(n => n.stop()); void this.ctx?.close(); this.ctx = null; }
}
