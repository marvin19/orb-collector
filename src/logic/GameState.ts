// This file will hold the game state
export function updateScoreUI(score: number): void {
    const el = document.getElementById('scoreDisplay');
    if (el) el.textContent = `Score: ${score}`;
}
