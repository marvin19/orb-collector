/**
 *
 * initWebGPU - Initializes WebGPU for rendering.
 *
 * @param canvasSelector
 * @returns { device, context, format, canvas }
 */
export async function initWebGPU(canvasSelector: string = 'canvas') {
    if (!navigator.gpu) throw new Error('WebGPU not supported');

    const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement;
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter!.requestDevice();
    const context = canvas.getContext('webgpu') as GPUCanvasContext;
    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device,
        format,
        alphaMode: 'opaque',
    });

    return { device, context, format, canvas };
}
