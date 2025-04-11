/**
 *
 * Movement and key input logic
 *
 */

import { gameFieldBounds, triangleMargin, movementStep } from './constants';

// Mutable references to single or double values
export type Vec2 = [number, number];
export type Vec1 = [number];

export function createKeyboardInput(position: Vec2, angle: Vec1): void {
    window.addEventListener('keydown', (e) => {
        let [x, y] = position;

        switch (e.key) {
            case 'ArrowUp':
                if (y + movementStep + triangleMargin <= gameFieldBounds.top) {
                    y += movementStep;
                    angle[0] = 0;
                }
                break;

            case 'ArrowDown':
                if (
                    y - movementStep - triangleMargin >=
                    gameFieldBounds.bottom
                ) {
                    y -= movementStep;
                    angle[0] = Math.PI;
                }
                break;

            case 'ArrowLeft':
                if (x - movementStep - triangleMargin >= gameFieldBounds.left) {
                    x -= movementStep;
                    angle[0] = Math.PI / 2;
                }
                break;

            case 'ArrowRight':
                angle[0] = -Math.PI / 2;
                if (
                    x + movementStep + triangleMargin <=
                    gameFieldBounds.right
                ) {
                    x += movementStep;
                    angle[0] = -Math.PI / 2;
                }
                break;
        }

        position[0] = x;
        position[1] = y;
    });
}
