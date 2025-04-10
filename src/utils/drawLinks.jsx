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
        const directlyConnectedIds = new Set();
        if (hoverNode) {
            links.forEach(link => {
                if (link.source === hoverNode.id) directlyConnectedIds.add(link.target);
                if (link.target === hoverNode.id) directlyConnectedIds.add(link.source);
            });
        }

        const isSecondaryConnection = hoverNode && !isConnected && (
            directlyConnectedIds.has(link.source) || directlyConnectedIds.has(link.target)
        );
        const zoom = graph.zoom?.() || 1;

        ctx.globalAlpha = 1;
        if (hoverNode) {
            if (isConnected) {
                ctx.globalAlpha = 1;
                ctx.strokeStyle = hoverNode.color;
                ctx.lineWidth = 3;
            } else if (isSecondaryConnection) {
                ctx.globalAlpha = 0.75;
                ctx.strokeStyle = hoverNode.color;
                ctx.lineWidth = 1;
            } else {
                ctx.globalAlpha = 0;
            }
        } else {
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1 * zoom;
        }




        ctx.beginPath();
        ctx.moveTo(screenSource.x, screenSource.y);
        ctx.lineTo(screenTarget.x, screenTarget.y);
        ctx.stroke();
    });
}