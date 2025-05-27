import { useEffect } from "react";

const xOffset = -400;
const yOffset = -800;

export function useGraphInit(graphRef, nodes, graphScale) {
    useEffect(() => {
        if (!graphRef.current || nodes.length === 0 || !graphScale) return;

        graphRef.current.zoom(1);

        const timeout = setTimeout(() => {
            applyGraphCentering(graphRef, nodes, graphScale);
        }, 10);

        return () => clearTimeout(timeout);
    }, [nodes]);
}

export function applyGraphCentering(graphRef, nodes, graphScale) {
    if (!graphRef.current || nodes.length === 0 || !graphScale) return;

    const xVals = nodes.map(n => n.x);
    const yVals = nodes.map(n => n.y);
    const centerX = (Math.min(...xVals) + Math.max(...xVals)) / 2;
    const centerY = (Math.min(...yVals) + Math.max(...yVals)) / 2;

    const baseZoom = 0.04;
    const adjustedZoom = baseZoom / graphScale;

    const duration = 1000;

    graphRef.current.centerAt(centerX - (xOffset * graphScale), centerY - (yOffset * graphScale), duration);
    graphRef.current.zoom(adjustedZoom, duration);
}