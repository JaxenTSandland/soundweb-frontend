export default function drawLegend(canvas, graph, graphScale) {
    if (!canvas || !graph) return;

    const ctx = canvas.getContext("2d");
    const zoom = graph.zoom?.() || 1;

    // Use graph-provided coordinate transform
    const topPos = graph.graph2ScreenCoords(0, graphScale * -7800);
    const leftPos = graph.graph2ScreenCoords(-graphScale * 9200, graphScale * 3000);
    const fontSize = 800 * zoom * graphScale;

    const topText = '\u2039\u2013\u2013\u2013\u2013\u2013\u2013 Ambient \u2013\u2013\u2013\u2013\u2013\u2013\u2013 Aggressive \u2013\u2013\u2013\u2013\u2013\u2013\u203A'
    const leftText = '\u2039\u2013\u2013\u2013\u2013\u2013\u2013\u2013\u2013\u2013\u2013\u2013 Organic \u2013\u2013\u2013\u2013\u2013\u2013\u2013 Techno \u2013\u2013\u2013\u2013\u2013\u2013\u2013\u2013\u2013\u2013\u2013\u203A'

    ctx.save();
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    // Bottom horizontal text
    ctx.strokeText(`${topText}`, topPos.x, topPos.y);
    ctx.fillText(`${topText}`, topPos.x, topPos.y);

    // Left vertical text
    ctx.translate(leftPos.x, leftPos.y);
    ctx.rotate(-Math.PI / 2);
    ctx.strokeText(`${leftText}`, 0, 0);
    ctx.fillText(`${leftText}`, 0, 0);

    ctx.restore();
}