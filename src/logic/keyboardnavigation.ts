/**
 *
 * Movement and key input logic
 *
 */

// Mutable references to single or double values
export type Vec2 = [number, number];
export type Vec1 = [number];

export function createKeyboardInput(position: Vec2, angle: Vec1): void {
    window.addEventListener('keydown', (e) => {
        const step = 0.05;
        switch (e.key) {
            case 'ArrowUp':
                position[1] += step;
                angle[0] = 0; // Up
                break;
            case 'ArrowDown':
                position[1] -= step;
                angle[0] = Math.PI; // Down
                break;
            case 'ArrowLeft':
                position[0] -= step;
                angle[0] = Math.PI / 2; // Left (CCW from up)
                break;
            case 'ArrowRight':
                position[0] += step;
                angle[0] = -Math.PI / 2; // Right (CW from up)
                break;
        }
    });
}
