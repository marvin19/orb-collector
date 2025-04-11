/// <reference types="@webgpu/types" />

import { createKeyboardInput } from './logic/KeyboardNavigation';
import { createCircleVertices } from './utils/geometry';
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

    // Triangle (player) vertex data
    const triangleVertices = new Float32Array([
        -0.025, -0.025, 0.025, -0.025, 0.0, 0.025,
    ]);
    const triangleBuffer = createVertexBuffer(device, triangleVertices);

    // Orb vertex data
    const circleSegments = 32;
    const orbVertices = createCircleVertices(0.025, circleSegments);
    const orbBuffer = createVertexBuffer(device, orbVertices);

    // Create uniform buffers
    const triangleMatrixBuffer = createUniformBuffer(device, 64);
    const orbMatrixBuffer = createUniformBuffer(device, 64);

    // Create pipelines
    const trianglePipeline = createTrianglePipeline(device, format);
    const glowPipeline = createGlowPipeline(device, format);

    // Bind groups
    const triangleBindGroup = device.createBindGroup({
        layout: trianglePipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: { buffer: triangleMatrixBuffer },
            },
        ],
    });

    const orbBindGroup = device.createBindGroup({
        layout: glowPipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: { buffer: orbMatrixBuffer },
            },
        ],
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
