import wrapText from "../../utils/wrapText.jsx";

export function renderArtistNode(node, ctx, globalScale, hoverNode, selectedNode) {
    const isSelected = selectedNode && node.id === selectedNode.id;
    const isHovered = hoverNode && node.id === hoverNode.id;

    const isConnectedToSelectedNode = Boolean(
        selectedNode &&
        Array.isArray(selectedNode.relatedArtists) &&
        (selectedNode.relatedArtists.includes(node.id) || node.relatedArtists?.includes(selectedNode.id))
    );

    if (selectedNode) {
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

    const radius = node.radius;
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
