async function initWebGPU() {
    if (!navigator.gpu) {
      throw new Error("WebGPU is not supported in this browser.");
    }
  
    // Get canvas and WebGPU device
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
  
    // Triangle vertex positions (X, Y)
    const vertices = new Float32Array([
      -0.5, -0.5,  // bottom left
       0.5, -0.5,  // bottom right
       0.0,  0.5   // top center
    ]);
  
    // Create vertex buffer
    const vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });
  
    new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
    vertexBuffer.unmap();
  
    // Shaders in WGSL
    const shaderModule = device.createShaderModule({
      code: `
        @vertex
        fn vs_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32> {
          return vec4<f32>(position, 0.0, 1.0);
        }
  
        @fragment
        fn fs_main() -> @location(0) vec4<f32> {
          return vec4<f32>(0.2, 0.7, 1.0, 1.0); // light blue
        }
      `,
    });
  
    // Create render pipeline
    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
        buffers: [
          {
            arrayStride: 8, // 2 floats * 4 bytes
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
  
    // Frame rendering loop
    function frame() {
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
      renderPass.draw(3);
      renderPass.end();
  
      device.queue.submit([commandEncoder.finish()]);
      requestAnimationFrame(frame);
    }
  
    requestAnimationFrame(frame);
  }
  
  initWebGPU();
  