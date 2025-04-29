export function calculateTopGenres(allGenres, count = 10) {
    if (!Array.isArray(allGenres)) return [];

    // Step 1: Sort genres by count descending
    const sorted = [...allGenres].sort((a, b) => (b.count || 0) - (a.count || 0));

    // Step 2: Distance helper (same as backend)
    const distance = (g1, g2) => {
        const dx = (g1.x || 0) - (g2.x || 0);
        const dy = (g1.y || 0) - (g2.y || 0);
        return Math.sqrt(dx * dx + dy * dy);
    };

    const baseDistance = 2500;
    const minDistance = Math.floor(baseDistance * Math.sqrt(10 / count));

    // Step 3: Select spaced-out top genres
    const selected = [];
    for (const genre of sorted) {
        const tooClose = selected.some(sel => distance(genre, sel) < minDistance);
        if (!tooClose) {
            selected.push(genre);
        }
        if (selected.length === count) break;
    }

    return selected;
}