export default function drawLinks(canvas, nodes, links, graph, hoverNode) {
    if (!canvas || !graph) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (!source || !target) return;

        const screenSource = graph.graph2ScreenCoords(source.x, source.y);
        const screenTarget = graph.graph2ScreenCoords(target.x, target.y);

        const isConnected = hoverNode &&
            (link.source === hoverNode.id || link.target === hoverNode.id);

        ctx.strokeStyle = isConnected ? "#0f0" : "#fff";
        ctx.lineWidth = isConnected ? 3 : 1 * graph.zoom();

        ctx.beginPath();
        ctx.moveTo(screenSource.x, screenSource.y);
        ctx.lineTo(screenTarget.x, screenTarget.y);
        ctx.stroke();
    });
}