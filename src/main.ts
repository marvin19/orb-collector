/// <reference types="@webgpu/types" />

import { mat4 } from 'gl-matrix';
import { createKeyboardInput } from './logic/keyboardnavigation';
import { createCircleVertices } from './utils/geometry';
import {
    createTrianglePipeline,
    createGlowPipeline,
} from './rendering/pipelines';
import { createVertexBuffer, createUniformBuffer } from './rendering/buffers';
import { initWebGPU } from './rendering/initWebGPU';
import { drawFrame } from './rendering/drawFrame';

let playerPos: [number, number] = [0, 0];
let playerAngle: [number] = [0];

createKeyboardInput(playerPos, playerAngle);

async function main() {
    const { device, context, format } = await initWebGPU();

    // Triangle (player) vertex data
    const triangleVertices = new Float32Array([
        -0.5, -0.5, 0.5, -0.5, 0.0, 0.5,
    ]);
    const triangleBuffer = createVertexBuffer(device, triangleVertices);

    // Orb vertex data
    const circleSegments = 32;
    const orbVertices = createCircleVertices(0.025, circleSegments);
    const orbBuffer = createVertexBuffer(device, orbVertices);

    // Create uniform buffers
    const triangleMatrixBuffer = createUniformBuffer(device, 64);
    const orbMatrixBuffer = createUniformBuffer(device, 64);

    // Set static orb transform
    const orbMatrix = mat4.create();
    mat4.translate(orbMatrix, orbMatrix, [0.5, 0.5, 0]);
    device.queue.writeBuffer(orbMatrixBuffer, 0, orbMatrix as Float32Array);

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

    // 🌀 Start rendering loop
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
            circleSegments,
        });

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

main();
