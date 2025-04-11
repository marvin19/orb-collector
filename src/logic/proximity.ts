import { orbPosition } from './orb';
import { Vec2 } from './constants';

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    return audioCtx;
}

// Plays movement tone that reflects proximity of the orb
export function playProximityTone(playerPos: Vec2) {
    const ctx = getContext();

    const dx = orbPosition[0] - playerPos[0];
    const dy = orbPosition[1] - playerPos[1];
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize distance into [0, 1]
    const maxDist = Math.sqrt(4); // Diagonal of gameFieldBounds
    const proximity = Math.max(0, 1 - distance / maxDist);

    const freq = 200 + proximity * 800; // Frequency range from 200 to 1000 Hz
    const vol = 0.05 + proximity * 0.2; // Volume range from 0.05 to 0.25

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07); // Very short

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.07);
}
