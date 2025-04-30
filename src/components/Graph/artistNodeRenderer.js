import wrapText from "../../utils/wrapText.jsx";

export function renderNode(node, ctx, globalScale, minCount, maxCount, hoverNode, selectedNode) {

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

    const label = node.name;

    if (node.labelNode) {
        let fadeStart = 0.2;
        let fadeEnd = 0.4;

        if (globalScale > fadeEnd) return;

        let alpha = 1;
        if (globalScale > fadeStart) {
            alpha = Math.max(0, 1 - (globalScale - fadeStart) / (fadeEnd - fadeStart));
        }

        const maxFontSize = 600;
        const minFontSize = maxFontSize * 0.4;

        const popularityScale =
            maxCount !== minCount ? (node.count - minCount) / (maxCount - minCount) : 1;

        const fontSize = minFontSize + (maxFontSize - minFontSize) * popularityScale;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 3;

        ctx.strokeText(label, node.x, node.y);
        ctx.fillText(label, node.x, node.y);
        ctx.restore();
        return;
    }

    const radius = node.radius;
    const fontSize = Math.max(5, radius / 3);
    const maxTextWidth = radius * 1.5;

    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    if (isSelected || isHovered) {
        ctx.shadowColor = "#FFF";
        ctx.shadowBlur = 10;
    } else {
        ctx.shadowColor = "transparent";
    }


    // Border
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius + 1, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFF"; // Border color
    ctx.fill();

    // Node fill
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = node.color || "#FFF";
    ctx.fill();

    if (globalScale > 1.1 / (radius / 13)) {
        ctx.fillStyle = "#000";
        const lines = wrapText(ctx, label, maxTextWidth);
        const lineHeight = fontSize * 1.15;
        const totalHeight = lines.length * lineHeight;
        const startY = node.y - totalHeight / 2 + lineHeight * 0.8;

        lines.forEach((line, i) => {
            ctx.fillText(line, node.x, startY + i * lineHeight);
        });
    }
    ctx.globalAlpha = 1;
}