export function createCircleVertices(
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
