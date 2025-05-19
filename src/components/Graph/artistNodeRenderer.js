import wrapText from "../../utils/wrapText.jsx";

export function renderArtistNode(
    node,
    ctx,
    globalScale,
    hoverNode,
    selectedNode,
    shouldFadeExplicitly,
    userRank,
    fadeNonTopArtists
) {
    const isSelected = selectedNode && node.id === selectedNode.id;
    const isHovered = hoverNode && node.id === hoverNode.id;


    if (shouldFadeExplicitly) {
        if (userRank === 0) {
            ctx.globalAlpha = 0.1; // not a top artist
        } else if (userRank <= 50) {
            ctx.globalAlpha = 1.0;
        } else if (userRank <= 100) {
            const fadeRatio = (userRank - 50) / 50;
            ctx.globalAlpha = 1.0 - 0.6 * fadeRatio;
        } else {
            ctx.globalAlpha = 0.2;
        }
    } else if (selectedNode) {
        const isSelected = selectedNode && node.id === selectedNode.id;
        const isHovered = hoverNode && node.id === hoverNode.id;
        const isConnectedToSelectedNode =
            selectedNode &&
            Array.isArray(selectedNode.relatedArtists) &&
            (selectedNode.relatedArtists.includes(node.id) ||
                node.relatedArtists?.includes(selectedNode.id));

        if (isSelected || isConnectedToSelectedNode) {
            ctx.globalAlpha = 1;
        } else if (isHovered) {
            ctx.globalAlpha = 0.5;
        } else {
            ctx.globalAlpha = 0.2;
        }
    } else {
        ctx.globalAlpha = 1;
    }

    let radius;

    if (fadeNonTopArtists && userRank > 0) {
        const maxSize = 80;
        const minSize = 15;
        const normalizedRank = Math.min(userRank - 1, 99) / 99;
        radius = maxSize - normalizedRank * (maxSize - minSize);
    } else {
        radius = node.radius; // use popularity-based default
    }
    const fontSize = Math.max(5, radius / 3);
    const maxTextWidth = radius * 1.5;

    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.shadowColor = isSelected || isHovered ? "#FFF" : "transparent";
    ctx.shadowBlur = isSelected || isHovered ? 10 : 0;

    // Border
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius + 1, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFF";
    ctx.fill();

    // Node fill
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = node.color || "#FFF";
    ctx.fill();

    if (globalScale > 1.1 / (radius / 13) || globalScale >= 2.5) {
        ctx.fillStyle = "#000";
        const lines = wrapText(ctx, node.name, maxTextWidth);
        const lineHeight = fontSize * 1.15;
        const totalHeight = lines.length * lineHeight;
        const startY = node.y - totalHeight / 2 + lineHeight * 0.8;

        lines.forEach((line, i) => {
            ctx.fillText(line, node.x, startY + i * lineHeight);
        });
    }

    ctx.globalAlpha = 1;
}
