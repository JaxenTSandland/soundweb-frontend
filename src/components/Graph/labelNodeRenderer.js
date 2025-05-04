export function renderLabelNode(node, ctx, globalScale, minCount, maxCount, graphScale) {
    const maxFontSize = 600 * graphScale;
    const minFontSize = maxFontSize * 0.4;

    const popularityScale =
        maxCount !== minCount ? (node.count - minCount) / (maxCount - minCount) : 1;

    const fontSize = minFontSize + (maxFontSize - minFontSize) * popularityScale;

    const fontFactor = fontSize / 500;
    const fadeStart = 0.1 / fontFactor;
    const fadeEnd = 0.3 / fontFactor;

    if (globalScale > fadeEnd) return;

    let alpha = 1;
    if (globalScale > fadeStart) {
        alpha = Math.max(0, 1 - (globalScale - fadeStart) / (fadeEnd - fadeStart));
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";


    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeText(node.name, node.x, node.y);


    ctx.fillStyle = "#fff";
    ctx.fillText(node.name, node.x, node.y);

    ctx.restore();
}