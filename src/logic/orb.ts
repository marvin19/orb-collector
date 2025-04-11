import { gameFieldBounds, triangleMargin, Vec2 } from './constants';

export let orbPosition: Vec2 = getRandomOrbPosition();

export function getRandomOrbPosition(): Vec2 {
    const rangeX =
        gameFieldBounds.right - gameFieldBounds.left - 2 * triangleMargin;
    const rangeY =
        gameFieldBounds.top - gameFieldBounds.bottom - 2 * triangleMargin;

    const x = gameFieldBounds.left + triangleMargin + Math.random() * rangeX;
    const y = gameFieldBounds.bottom + triangleMargin + Math.random() * rangeY;
    return [x, y];
}

export function resetOrbPosition(): void {
    orbPosition = getRandomOrbPosition();
}

export function checkOrbCollision(
    playerPosition: Vec2,
    collisionRadius = 0.05
): boolean {
    const dx = playerPosition[0] - orbPosition[0];
    const dy = playerPosition[1] - orbPosition[1];
    return Math.sqrt(dx * dx + dy * dy) < collisionRadius;
}
