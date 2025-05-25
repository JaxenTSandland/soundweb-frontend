export default function drawLinks(canvas, nodes, links, graph, selectedNode) {
    if (!canvas || !graph) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const zoom = graph.zoom?.() || 1;

    // Build node lookup map
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Cache directly connected IDs (first-degree)
    const directlyConnectedIds = new Set();
    if (selectedNode) {
        links.forEach(link => {
            if (link.source === selectedNode.id) directlyConnectedIds.add(link.target);
            if (link.target === selectedNode.id) directlyConnectedIds.add(link.source);
        });
    }

    for (const link of links) {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (!source || !target) continue;
        if (source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) continue;

        const screenSource = graph.graph2ScreenCoords(source.x, source.y);
        const screenTarget = graph.graph2ScreenCoords(target.x, target.y);

        const isConnected = selectedNode &&
            (link.source === selectedNode.id || link.target === selectedNode.id);

        const isSecondaryConnection = selectedNode && !isConnected && (
            directlyConnectedIds.has(link.source) || directlyConnectedIds.has(link.target)
        );

        // Style
        if (selectedNode) {
            if (isConnected) {
                ctx.globalAlpha = 1;
                ctx.strokeStyle = selectedNode.color;
                ctx.lineWidth = 3;
            } else if (isSecondaryConnection) {
                ctx.globalAlpha = 0.6;
                ctx.strokeStyle = selectedNode.color;
                ctx.lineWidth = 1;
            } else {
                ctx.globalAlpha = 0;
                continue;
            }
        } else {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.5 * zoom;
        }

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(screenSource.x, screenSource.y);
        ctx.lineTo(screenTarget.x, screenTarget.y);
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
}