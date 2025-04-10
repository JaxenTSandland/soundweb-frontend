export default function drawLinks(canvas, nodes, links, graph, hoverNode, selectedNode) {
    if (!canvas || !graph) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (!source || !target) return;

        const screenSource = graph.graph2ScreenCoords(source.x, source.y);
        const screenTarget = graph.graph2ScreenCoords(target.x, target.y);

        const isConnected = selectedNode &&
            (link.source === selectedNode.id || link.target === selectedNode.id);
        const directlyConnectedIds = new Set();

        if (selectedNode) {
            links.forEach(link => {
                if (link.source === selectedNode.id) directlyConnectedIds.add(link.target);
                if (link.target === selectedNode.id) directlyConnectedIds.add(link.source);
            });
        }

        const isSecondaryConnection = selectedNode && !isConnected && (
            directlyConnectedIds.has(link.source) || directlyConnectedIds.has(link.target)
        );
        const zoom = graph.zoom?.() || 1;

        ctx.globalAlpha = 1;
        if (selectedNode) {
            if (isConnected) { // Connected to the hovered artist
                ctx.strokeStyle = selectedNode.color;
                ctx.lineWidth = 3;
            } else if (isSecondaryConnection) { // Connected to artists that are connected to the hovered artist
                ctx.globalAlpha = 0.6;
                ctx.strokeStyle = selectedNode.color;
                ctx.lineWidth = 1;
            } else { // Lines that have nothing to do with the hovered artist
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