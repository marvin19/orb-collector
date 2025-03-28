/// <reference types="@webgpu/types" />

import { mat4 } from "gl-matrix";

// Track player position
let playerPos = [0, 0];

// Listen for keyboard input
window.addEventListener("keydown", (e) => {
  const step = 0.05;
  switch (e.key) {
    case "ArrowUp":
      playerPos[1] += step;
      break;
    case "ArrowDown":
      playerPos[1] -= step;
      break;
    case "ArrowLeft":
      playerPos[0] -= step;
      break;
    case "ArrowRight":
      playerPos[0] += step;
      break;
  }
});

async function initWebGPU() {
  if (!navigator.gpu) {
    throw new Error("WebGPU is not supported in this browser.");
  }

  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter!.requestDevice();

  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({
    device,
    format,
    alphaMode: "opaque",
  });

  // Triangle vertex positions
  const vertices = new Float32Array([
    -0.5, -0.5,
     0.5, -0.5,
     0.0,  0.5
  ]);

  // Create vertex buffer
  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
  vertexBuffer.unmap();

  // Create model matrix and uniform buffer
  const modelMatrix = mat4.create();
  const matrixBuffer = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // Shader with transformation support
  const shaderModule = device.createShaderModule({
    code: `
      @group(0) @binding(0)
      var<uniform> modelMatrix: mat4x4<f32>;

      @vertex
      fn vs_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32> {
        return modelMatrix * vec4<f32>(position, 0.0, 1.0);
      }

      @fragment
      fn fs_main() -> @location(0) vec4<f32> {
        return vec4<f32>(0.2, 0.7, 1.0, 1.0); // light blue
      }
    `,
  });

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "vs_main",
      buffers: [
        {
          arrayStride: 8,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: "float32x2",
            },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fs_main",
      targets: [{ format }],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  const bindGroupLayout = pipeline.getBindGroupLayout(0);
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: matrixBuffer,
        },
      },
    ],
  });

  function frame() {
    // Update transformation matrix based on player position
    mat4.identity(modelMatrix);
    mat4.translate(modelMatrix, modelMatrix, [playerPos[0], playerPos[1], 0]);
    device.queue.writeBuffer(matrixBuffer, 0, modelMatrix as Float32Array);

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.draw(3);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

initWebGPU();
