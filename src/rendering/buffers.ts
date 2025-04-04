/**
 * Create and upload vertex buffer
 * @param device GPUDevice
 * @param, data Float32Array
 * @returns GPUBuffer
 *
 */

export function createVertexBuffer(
    device: GPUDevice,
    data: Float32Array
): GPUBuffer {
    const buffer = device.createBuffer({
        size: data.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });

    new Float32Array(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
}

/**
 * Create a uniform buffer (e.g., for transformation matrices)
 * @param device GPUDevice
 * @param size Buffer size in bytes (e.g., 64 for mat4x4<f32>)
 * @returns GPUBuffer
 */
export function createUniformBuffer(
    device: GPUDevice,
    size: number
): GPUBuffer {
    return device.createBuffer({
        size,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
}
