/**
 *
 * Movement and key input logic
 *
 */

import {
    gameFieldBounds,
    triangleMargin,
    movementStep,
    Vec1,
    Vec2,
} from './constants';

import { resetOrbPosition, checkOrbCollision } from './orb';
import { updateScoreUI } from './GameState';

let score = 0;

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

        console.log(`Position: ${position}`);

        // Check for collision
        if (checkOrbCollision(position)) {
            console.log('Collision detected!');
            score += 1;
            resetOrbPosition();
            updateScoreUI(score);
        }
    });
}
