// This file will hold the game state
export function updateScoreUI(score: number): void {
    const el = document.getElementById('scoreDisplay');
    if (el) el.textContent = `Score: ${score}`;
}

export function updateLevelUI(level: number): void {
    const el = document.getElementById('levelValue');
    if (el) el.textContent = String(level);
}

export function showNextLevelButton(show: boolean): void {
    const btn = document.getElementById('nextLevelBtn');
    if (btn) {
        const el = btn as HTMLButtonElement;
        el.style.display = show ? 'inline-block' : 'none';
        if (show) {
            queueMicrotask(() => el.focus());
        }
    }
}

export function isNextLevelVisible(): boolean {
    const btn = document.getElementById(
        'nextLevelBtn'
    ) as HTMLButtonElement | null;
    return !!btn && btn.style.display !== 'none';
}

let nextLevelPending = false;
export function setNextLevelPending(pending: boolean): void {
    nextLevelPending = pending;
}
export function isNextLevelPending(): boolean {
    return nextLevelPending;
}
