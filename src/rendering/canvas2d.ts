import { mat4 } from 'gl-matrix';

type Vec2 = [number, number];

export type Canvas2DContext = {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
};

export function initCanvas2D(selector: string = 'canvas'): Canvas2DContext {
    const canvas = document.querySelector(selector) as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas element not found');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not supported');
    ctx.imageSmoothingEnabled = true;
    return { canvas, ctx };
}

function ndcToCanvas(
    x: number,
    y: number,
    width: number,
    height: number
): [number, number] {
    // Input coordinates are in NDC [-1,1]. Map to canvas pixels.
    const px = (x * 0.5 + 0.5) * width;
    const py = (1.0 - (y * 0.5 + 0.5)) * height; // flip Y for canvas
    return [px, py];
}

function applyModel(mat: mat4, v: Vec2): Vec2 {
    const x = v[0];
    const y = v[1];
    const nx = mat[0] * x + mat[4] * y + mat[12];
    const ny = mat[1] * x + mat[5] * y + mat[13];
    return [nx, ny];
}

export function drawFrame2D(params: {
    context2d: Canvas2DContext;
    playerPos: Vec2;
    playerAngle: [number];
    triangleVertices: Float32Array;
    orbVertices: Float32Array;
    orbPosition: Vec2;
    circleSegments: number;
}) {
    const {
        context2d,
        playerPos,
        playerAngle,
        triangleVertices,
        orbVertices,
        orbPosition,
        circleSegments: _circleSegments,
    } = params;

    const { ctx, canvas } = context2d;

    // Clear background
    ctx.fillStyle = 'rgb(13,13,26)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Build model matrices similar to WebGPU path
    const playerModel = mat4.create();
    mat4.translate(playerModel, playerModel, [playerPos[0], playerPos[1], 0]);
    mat4.rotateZ(playerModel, playerModel, playerAngle[0]);

    const orbModel = mat4.create();
    mat4.translate(orbModel, orbModel, [orbPosition[0], orbPosition[1], 0]);

    // Draw player triangle (hot pink)
    ctx.beginPath();
    for (let i = 0; i < triangleVertices.length; i += 2) {
        const vx = triangleVertices[i];
        const vy = triangleVertices[i + 1];
        const [mx, my] = applyModel(playerModel, [vx, vy]);
        const [px, py] = ndcToCanvas(mx, my, canvas.width, canvas.height);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgb(255,26,153)';
    ctx.fill();

    // Draw glowing orb by rendering triangles with additive-like effect
    // We approximate glow by drawing the filled circle with a radial gradient
    // derived from local position distance, matching shader logic.
    // Compute circle center in canvas space
    const [cx, cy] = ndcToCanvas(
        orbPosition[0],
        orbPosition[1],
        canvas.width,
        canvas.height
    );

    // Estimate radius from first non-center vertex (data packed as [0,0, x1,y1, x2,y2] per segment)
    // Use magnitude of one vertex in NDC scaled to pixels.
    if (orbVertices.length >= 6) {
        const vx = orbVertices[2];
        const vy = orbVertices[3];
        // transform local vertex by model then map to pixels
        const [mx, my] = applyModel(orbModel, [vx, vy]);
        const [px, py] = ndcToCanvas(mx, my, canvas.width, canvas.height);
        const dx = px - cx;
        const dy = py - cy;
        const radiusPx = Math.hypot(dx, dy);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radiusPx);
        // Match shader glow/core falloff roughly
        grad.addColorStop(0.0, 'rgba(255,204,51,1.0)');
        grad.addColorStop(0.3, 'rgba(255,204,51,0.7)');
        grad.addColorStop(0.6, 'rgba(255,204,51,0.25)');
        grad.addColorStop(1.0, 'rgba(255,204,51,0.0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
        ctx.fill();
    }
}
