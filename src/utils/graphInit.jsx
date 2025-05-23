import { useEffect } from "react";

export function useGraphInit(graphRef, nodes, graphScale) {
    useEffect(() => {
        if (!graphRef.current || nodes.length === 0 || !graphScale) return;
        graphRef.current.zoom(1);
        const timeout = setTimeout(() => {
            const avgX = nodes.reduce((sum, n) => sum + n.x, 0) / nodes.length;
            const yVals = nodes.map(n => n.y);
            const centerY = (Math.min(...yVals) + Math.max(...yVals)) / 2;

            const baseZoom = 0.04;
            const adjustedZoom = baseZoom / graphScale;

            graphRef.current.centerAt(avgX, centerY, 0);
            graphRef.current.zoom(adjustedZoom, 1000);
        }, 10);

        return () => clearTimeout(timeout);
    }, [nodes]);
}
