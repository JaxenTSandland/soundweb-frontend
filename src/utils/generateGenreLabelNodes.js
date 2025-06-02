import { toTitleCase } from "./textUtils.js";

export function generateGenreLabelNodes(activeGenres, labelCount = 10, graphScale = 1.0) {
    if (!Array.isArray(activeGenres)) return [];

    // Sort by usage count
    const sorted = [...activeGenres].sort((a, b) => (b.count || 0) - (a.count || 0));

    // Distance formula
    const distance = (g1, g2) => {
        const dx = (g1.x || 0) - (g2.x || 0);
        const dy = (g1.y || 0) - (g2.y || 0);
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Adjusted base distance using graph scale
    const baseDistance = 2000;
    const scaledBaseDistance = baseDistance * (graphScale + ((1 - graphScale) / 2));
    const minDistance = Math.floor(scaledBaseDistance * Math.sqrt(10 / labelCount));

    const selected = [];

    for (const genre of sorted) {
        const tooClose = selected.some(sel => distance(genre, sel) < minDistance);
        const notRelevantEnough = selected.length > 0 ? selected[0] / 10 > genre.count : false;

        if (!tooClose && !notRelevantEnough) {
            selected.push(genre);
        }
        if (selected.length === labelCount || notRelevantEnough) break;
    }

    // Format label nodes
    return selected.map((genre, i) => ({
        id: `genre-${genre.name.toLowerCase()}-${i}`,
        name: toTitleCase(genre.name),
        x: genre.x,
        y: genre.y,
        radius: 1,
        color: "transparent",
        labelNode: true,
        count: genre.count
    }));
}