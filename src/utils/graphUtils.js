export function evaluateRenderState(node, fadeNonTopArtists, userArtistRanks) {
    const rank = userArtistRanks?.get(node.id);
    const userRank = typeof rank === "number" ? rank + 1 : 0;
    const shouldRender = !fadeNonTopArtists || userRank > 0;

    return { shouldRender, userRank };
}

export function withRelatedNodes(selectedNode, allArtistNodes, shouldFadeNode) {
    if (!selectedNode || !Array.isArray(selectedNode.relatedArtists)) return selectedNode;

    const relatedNodes = selectedNode.relatedArtists
        .map(id => allArtistNodes.find(n => n.id === id))
        .filter(Boolean)
        .map(node => ({
            ...node,
            faded: shouldFadeNode?.(node)
        }));

    return { ...selectedNode, relatedNodes };
}
