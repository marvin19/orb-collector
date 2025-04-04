/**
 *
 * Movement and key input logic
 *
 */

export type Vec2 = [number, number];

export function createKeyboardInput(position: Vec2): void {
    window.addEventListener('keydown', (e) => {
        const step = 0.05;
        switch (e.key) {
            case 'ArrowUp':
                position[1] += step;
                break;
            case 'ArrowDown':
                position[1] -= step;
                break;
            case 'ArrowLeft':
                position[0] -= step;
                break;
            case 'ArrowRight':
                position[0] += step;
                break;
        }
    });
}
