import { orbPosition } from './orb';
import { Vec2 } from './constants';

let audioCtx: AudioContext | null = null;
async function getContext(): Promise<AudioContext> {
    if (!audioCtx) {
        audioCtx = new AudioContext({ latencyHint: 'interactive' });
    }
    if (audioCtx.state !== 'running') {
        try {
            await audioCtx.resume();
        } catch {}
    }
    return audioCtx;
}

// --- Stereo panning based on orb-relative position ---
function getOrbRelativePan(playerX: number, orbX: number): number {
    const toggle = document.getElementById(
        'stereoToggle'
    ) as HTMLInputElement | null;
    const stereoEnabled = toggle?.checked ?? false;

    if (!stereoEnabled) return 0;

    const dx = playerX - orbX;
    const scaledPan = dx * 5; // Tweak this value for sensitivity
    return Math.max(-1, Math.min(1, scaledPan));
}

// --- Vertical distance to volume factor (optional) ---
function getVerticalVolumeFactor(playerY: number, orbY: number): number {
    const dy = Math.abs(playerY - orbY);
    const maxDY = 2;
    return Math.max(0.5, 1 - dy / maxDY);
}

// --- Proximity tone rate limiter ---
let lastToneTime = 0;
const toneCooldownMs = 50;

/**
 * Play a movement tone that reflects distance and direction to the orb.
 * Rate-limited to prevent overload.
 */
export async function playProximityTone(playerPos: Vec2) {
    const now = performance.now();
    if (now - lastToneTime < toneCooldownMs) return;
    lastToneTime = now;

    const ctx = await getContext();

    const [px, py] = playerPos;
    const [ox, oy] = orbPosition;

    const dx = ox - px;
    const dy = oy - py;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDist = Math.sqrt(4);
    const proximity = Math.max(0, 1 - distance / maxDist);

    const freq = 200 + proximity * 800;
    const baseVolume = 0.5 + proximity * 0.2;
    const verticalVolume = getVerticalVolumeFactor(py, oy);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    osc.type = 'sine';
    osc.frequency.value = freq;

    const t0 = ctx.currentTime + 0.005;
    gain.gain.setValueAtTime(baseVolume * verticalVolume, t0);
    gain.gain.linearRampToValueAtTime(0.001, t0 + 0.1);

    panner.pan.value = getOrbRelativePan(px, ox);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    osc.start(t0);
    osc.stop(t0 + 0.1);
}

/**
 * Play a low-pitched "thud" sound when hitting a wall.
 */
export async function playThud(playerPos: Vec2) {
    const ctx = await getContext();
    const [px] = playerPos;
    const [ox] = orbPosition;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    osc.type = 'square';
    osc.frequency.value = 100;

    const t0 = ctx.currentTime + 0.005;
    gain.gain.setValueAtTime(0.15, t0);
    gain.gain.linearRampToValueAtTime(0.001, t0 + 0.1);

    panner.pan.value = getOrbRelativePan(px, ox);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    osc.start(t0);
    osc.stop(t0 + 0.1);
}

/**
 * Play a satisfying orb collection sound with random pitch.
 */
export async function playOrbCollect(playerPos: Vec2) {
    const ctx = await getContext();
    const [px] = playerPos;
    const [ox] = orbPosition;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    osc.type = 'triangle';
    osc.frequency.value = 1000 + Math.random() * 400;

    const t0 = ctx.currentTime + 0.005;
    gain.gain.setValueAtTime(0.2, t0);
    gain.gain.linearRampToValueAtTime(0.001, t0 + 0.25);

    panner.pan.value = getOrbRelativePan(px, ox);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    osc.start(t0);
    osc.stop(t0 + 0.25);
}
