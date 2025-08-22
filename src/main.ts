/// <reference types="@webgpu/types" />

import { createKeyboardInput } from './logic/keyboardnavigation';
import {
    createCircleVertices,
    createPointyTriangleVertices,
} from './utils/geometry';
import {
    createTrianglePipeline,
    createGlowPipeline,
} from './rendering/pipelines';
import { createVertexBuffer, createUniformBuffer } from './rendering/buffers';
import { initWebGPU } from './rendering/initWebGPU';
import { drawFrame } from './rendering/drawFrame';
import { orbPosition } from './logic/orb';

let playerPos: [number, number] = [0, 0];
let playerAngle: [number] = [0];

createKeyboardInput(playerPos, playerAngle);

async function main() {
    const { device, context, format } = await initWebGPU();

    const triangleVertices = createPointyTriangleVertices();
    const triangleBuffer = createVertexBuffer(device, triangleVertices);

    const circleSegments = 32;
    const orbVertices = createCircleVertices(0.025, circleSegments);
    const orbBuffer = createVertexBuffer(device, orbVertices);

    const triangleMatrixBuffer = createUniformBuffer(device, 64);
    const orbMatrixBuffer = createUniformBuffer(device, 64);

    const trianglePipeline = createTrianglePipeline(device, format);
    const glowPipeline = createGlowPipeline(device, format);

    const triangleBindGroup = device.createBindGroup({
        layout: trianglePipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: triangleMatrixBuffer } }],
    });

    const orbBindGroup = device.createBindGroup({
        layout: glowPipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: orbMatrixBuffer } }],
    });

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
        drawFrame({
            device,
            context,
            trianglePipeline,
            glowPipeline,
            triangleBuffer,
            orbBuffer,
            triangleBindGroup,
            orbBindGroup,
            playerPos,
            playerAngle,
            matrixBuffer: triangleMatrixBuffer,
            orbMatrixBuffer,
            orbPosition,
            circleSegments,
        });

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

main();
