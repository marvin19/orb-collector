/// <reference types="@webgpu/types" />

import { mat4 } from 'gl-matrix';
import { createKeyboardInput } from './keyboardnavigation';

let playerPos: [number, number] = [0, 0];
let playerAngle: [number] = [0];

createKeyboardInput(playerPos, playerAngle);

function createCircleVertices(
    radius: number = 0.025,
    segments: number = 32
): Float32Array {
    const data: number[] = [];
    for (let i = 0; i < segments; i++) {
        const theta1 = (i / segments) * Math.PI * 2;
        const theta2 = ((i + 1) / segments) * Math.PI * 2;
        data.push(0, 0); // center
        data.push(Math.cos(theta1) * radius, Math.sin(theta1) * radius);
        data.push(Math.cos(theta2) * radius, Math.sin(theta2) * radius);
    }
    return new Float32Array(data);
}

async function initWebGPU() {
    if (!navigator.gpu) throw new Error('WebGPU not supported');

    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter!.requestDevice();
    const context = canvas.getContext('webgpu') as GPUCanvasContext;
    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device,
        format,
        alphaMode: 'opaque',
    });

    // Triangle (player) vertex data
    const triangleVertices = new Float32Array([
        -0.5, -0.5, 0.5, -0.5, 0.0, 0.5,
    ]);

    const triangleBuffer = device.createBuffer({
        size: triangleVertices.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(triangleBuffer.getMappedRange()).set(triangleVertices);
    triangleBuffer.unmap();

    // Orb vertex data
    const circleSegments = 32;
    const orbVertices = createCircleVertices(0.025, circleSegments);
    const orbBuffer = device.createBuffer({
        size: orbVertices.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(orbBuffer.getMappedRange()).set(orbVertices);
    orbBuffer.unmap();

    // Uniform buffers (player + orb)
    const matrixBuffer = device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const orbMatrix = mat4.create();
    mat4.translate(orbMatrix, orbMatrix, [0.5, 0.5, 0]);
    const orbMatrixBuffer = device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(orbMatrixBuffer, 0, orbMatrix as Float32Array);

    // Shader for hot pink triangle
    const triangleShader = device.createShaderModule({
        code: `
      @group(0) @binding(0)
      var<uniform> modelMatrix: mat4x4<f32>;

      struct VertexOutput {
        @builtin(position) position: vec4<f32>,
      };

      @vertex
      fn vs_main(@location(0) position: vec2<f32>) -> VertexOutput {
        var out: VertexOutput;
        out.position = modelMatrix * vec4<f32>(position, 0.0, 1.0);
        return out;
      }

      @fragment
      fn fs_main() -> @location(0) vec4<f32> {
        return vec4<f32>(1.0, 0.1, 0.6, 1.0); // hot pink
      }
    `,
    });

    // Shader for glowing orb
    const glowShader = device.createShaderModule({
        code: `
      @group(0) @binding(0)
      var<uniform> modelMatrix: mat4x4<f32>;

      struct VertexOutput {
        @builtin(position) position: vec4<f32>,
        @location(0) localPos: vec2<f32>
      };

      @vertex
      fn vs_main(@location(0) position: vec2<f32>) -> VertexOutput {
        var out: VertexOutput;
        out.position = modelMatrix * vec4<f32>(position, 0.0, 1.0);
        out.localPos = position;
        return out;
      }

      @fragment
      fn fs_main(@location(0) localPos: vec2<f32>) -> @location(0) vec4<f32> {
        let dist = length(localPos);
        let glow = smoothstep(0.05, 0.0, dist);
        let core = smoothstep(0.015, 0.0, dist);
        let color = vec3<f32>(1.0, 0.8, 0.2);
        return vec4<f32>(color * (glow + core), glow);
      }
    `,
    });

    // Pipeline for triangle
    const trianglePipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: triangleShader,
            entryPoint: 'vs_main',
            buffers: [
                {
                    arrayStride: 8,
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: 'float32x2',
                        },
                    ],
                },
            ],
        },
        fragment: {
            module: triangleShader,
            entryPoint: 'fs_main',
            targets: [{ format }],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });

    // Pipeline for orb (with glowing shader)
    const glowPipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: glowShader,
            entryPoint: 'vs_main',
            buffers: [
                {
                    arrayStride: 8,
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: 'float32x2',
                        },
                    ],
                },
            ],
        },
        fragment: {
            module: glowShader,
            entryPoint: 'fs_main',
            targets: [
                {
                    format,
                    blend: {
                        color: {
                            srcFactor: 'one',
                            dstFactor: 'one',
                            operation: 'add',
                        },
                        alpha: {
                            srcFactor: 'one',
                            dstFactor: 'one-minus-src-alpha',
                            operation: 'add',
                        },
                    },
                },
            ],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });

    // Bind groups
    const triangleBindGroup = device.createBindGroup({
        layout: trianglePipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: { buffer: matrixBuffer },
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

    function frame() {
        // Update player transformation
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [
            playerPos[0],
            playerPos[1],
            0,
        ]);
        mat4.rotateZ(modelMatrix, modelMatrix, playerAngle[0]);
        mat4.translate(modelMatrix, modelMatrix, [0, -0.25, 0]); // optional pivot
        device.queue.writeBuffer(matrixBuffer, 0, modelMatrix as Float32Array);

        const encoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();
        const pass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        });

        // Draw triangle (player)
        pass.setPipeline(trianglePipeline);
        pass.setVertexBuffer(0, triangleBuffer);
        pass.setBindGroup(0, triangleBindGroup);
        pass.draw(3);

        // Draw glowing orb
        pass.setPipeline(glowPipeline);
        pass.setVertexBuffer(0, orbBuffer);
        pass.setBindGroup(0, orbBindGroup);
        pass.draw(circleSegments * 3);

        pass.end();
        device.queue.submit([encoder.finish()]);
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

initWebGPU();
