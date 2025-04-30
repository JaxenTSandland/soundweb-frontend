import { toTitleCase } from "./textUtils.js";

export function generateGenreLabelNodes(genreLabelsRaw, allGenres, labelCount = 10) {
    if (!Array.isArray(allGenres)) return [];

    // Step 1: Filter toggled genres
    const toggledGenres = allGenres.filter(g => g.toggled);

    // Step 2: Sort by usage count descending
    const sorted = [...toggledGenres].sort((a, b) => (b.count || 0) - (a.count || 0));

    // Step 3: Distance function
    const distance = (g1, g2) => {
        const dx = (g1.x || 0) - (g2.x || 0);
        const dy = (g1.y || 0) - (g2.y || 0);
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Step 4: Pick spaced-out genres
    const baseDistance = 2500;
    const minDistance = Math.floor(baseDistance * Math.sqrt(10 / labelCount));
    const selected = [];

    for (const genre of sorted) {
        const tooClose = selected.some(sel => distance(genre, sel) < minDistance);
        if (!tooClose) {
            selected.push(genre);
        }
        if (selected.length === labelCount) break;
    }

    const selectedNameSet = new Set(selected.map(g => g.name));

    // Step 5: Build label nodes
    return genreLabelsRaw
        .filter(g => selectedNameSet.has(g.name))
        .map((genre, i) => ({
            id: `genre-${i}`,
            name: toTitleCase(genre.name),
            x: genre.x,
            y: genre.y,
            radius: 1,
            color: "transparent",
            labelNode: true,
            count: genre.count
        }));
}