import { createKeyboardInput } from './logic/keyboardnavigation';
import {
    createCircleVertices,
    createPointyTriangleVertices,
} from './utils/geometry';
import { initCanvas2D, drawFrame2D } from './rendering/canvas2d';
import { orbPosition } from './logic/orb';

let playerPos: [number, number] = [0, 0];
let playerAngle: [number] = [0];

createKeyboardInput(playerPos, playerAngle);

async function main() {
    const context2d = initCanvas2D();

    const triangleVertices = createPointyTriangleVertices();

    const circleSegments = 32;
    const orbVertices = createCircleVertices(0.025, circleSegments);

    const blackoutToggle = document.getElementById(
        'audioOnlyToggle'
    ) as HTMLInputElement;
    const blackoutOverlay = document.getElementById('blackoutOverlay');
    const stereoToggle = document.getElementById(
        'stereoToggle'
    ) as HTMLInputElement;

    // Restore saved settings
    const savedBlackout = localStorage.getItem('blackout');
    if (savedBlackout === 'true') {
        blackoutToggle.checked = true;
        blackoutOverlay!.style.display = 'block';
    }

    const savedStereo = localStorage.getItem('stereo');
    if (savedStereo === 'true') {
        stereoToggle.checked = true;
    }

    // Save settings on change
    blackoutToggle.addEventListener('change', () => {
        const enabled = blackoutToggle.checked;
        blackoutOverlay!.style.display = enabled ? 'block' : 'none';
        localStorage.setItem('blackout', enabled.toString());
    });

    stereoToggle.addEventListener('change', () => {
        localStorage.setItem('stereo', stereoToggle.checked.toString());
    });

    // Keyboard shortcut for blackout toggle (B)
    document.addEventListener('keydown', (e) => {
        if (
            e.key.toLowerCase() === 'b' &&
            !(
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            )
        ) {
            blackoutToggle.checked = !blackoutToggle.checked;
            const enabled = blackoutToggle.checked;
            blackoutOverlay!.style.display = enabled ? 'block' : 'none';
            localStorage.setItem('blackout', enabled.toString());

            const status = document.getElementById('blackoutStatus');
            if (status) {
                status.textContent = enabled
                    ? 'Blackout mode enabled. Visuals hidden.'
                    : 'Blackout mode disabled. Visuals shown.';
            }
        }
    });

    // Start rendering loop
    function frame() {
        drawFrame2D({
            context2d,
            playerPos,
            playerAngle,
            triangleVertices,
            orbVertices,
            orbPosition,
            circleSegments,
        });

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

main();
