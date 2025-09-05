import { gameFieldBounds, triangleMargin, Vec2 } from './constants';

export function randomizePlayerPosition(position: Vec2): void {
    const rangeX =
        gameFieldBounds.right - gameFieldBounds.left - 2 * triangleMargin;
    const rangeY =
        gameFieldBounds.top - gameFieldBounds.bottom - 2 * triangleMargin;
    position[0] =
        gameFieldBounds.left + triangleMargin + Math.random() * rangeX;
    position[1] =
        gameFieldBounds.bottom + triangleMargin + Math.random() * rangeY;
}
