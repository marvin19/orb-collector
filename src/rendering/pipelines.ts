// pipelines.ts

import { orbGlowShader, triangleShader } from './shaders';

export function createTrianglePipeline(
    device: GPUDevice,
    format: GPUTextureFormat
): GPURenderPipeline {
    const triangleShaderModule = device.createShaderModule({
        code: triangleShader,
    });

    return device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: triangleShaderModule,
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
            module: triangleShaderModule,
            entryPoint: 'fs_main',
            targets: [{ format }],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });
}

export function createGlowPipeline(
    device: GPUDevice,
    format: GPUTextureFormat
): GPURenderPipeline {
    const glowShaderModule = device.createShaderModule({
        code: orbGlowShader,
    });

    return device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: glowShaderModule,
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
            module: glowShaderModule,
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
}
