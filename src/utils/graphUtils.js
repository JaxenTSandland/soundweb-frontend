export function evaluateRenderState(node, fadeNonTopArtists, userArtistRanks) {
    const rank = userArtistRanks?.get(node.id);
    const userRank = typeof rank === "number" ? rank + 1 : 0;
    const shouldRender = !fadeNonTopArtists || userRank > 0;

    return { shouldRender, userRank };
}
