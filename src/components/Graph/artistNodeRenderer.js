import wrapText from "../../utils/wrapText.jsx";

export function renderNode(node, ctx, globalScale, graphData) {
    const labelNodesOnly = graphData.nodes.filter(n => n.labelNode);
    const counts = labelNodesOnly.map(n => n.count || 0);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);
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
        ctx.strokeStyle = "#000";
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
}