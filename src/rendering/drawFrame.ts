import { mat4 } from 'gl-matrix';

/**
 * drawFrame - Renders a frame using WebGPU.
 * @param param0
 *
 */

export function drawFrame({
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
    matrixBuffer,
    circleSegments,
}: {
    device: GPUDevice;
    context: GPUCanvasContext;
    trianglePipeline: GPURenderPipeline;
    glowPipeline: GPURenderPipeline;
    triangleBuffer: GPUBuffer;
    orbBuffer: GPUBuffer;
    triangleBindGroup: GPUBindGroup;
    orbBindGroup: GPUBindGroup;
    playerPos: [number, number];
    playerAngle: [number];
    matrixBuffer: GPUBuffer;
    circleSegments: number;
}) {
    // Update transformation matrix for the player
    // Update transformation matrix for the player
    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [playerPos[0], playerPos[1], 0]);
    mat4.rotateZ(modelMatrix, modelMatrix, playerAngle[0]);

    // Calculate pivot dynamically (based on triangle size)
    const triangleHeight = 0.05;
    const pivotOffset = -triangleHeight / 2;
    mat4.translate(modelMatrix, modelMatrix, [0, pivotOffset, 0]);

    device.queue.writeBuffer(matrixBuffer, 0, modelMatrix as Float32Array);

    // Render pass
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

    pass.setPipeline(trianglePipeline);
    pass.setVertexBuffer(0, triangleBuffer);
    pass.setBindGroup(0, triangleBindGroup);
    pass.draw(3);

    pass.setPipeline(glowPipeline);
    pass.setVertexBuffer(0, orbBuffer);
    pass.setBindGroup(0, orbBindGroup);
    pass.draw(circleSegments * 3);

    pass.end();
    device.queue.submit([encoder.finish()]);
}
