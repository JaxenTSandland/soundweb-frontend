import { useEffect } from "react";

export function useGraphInit(graphRef, nodes) {
    useEffect(() => {
        if (!graphRef.current || nodes.length === 0) return;

        const avgX = nodes.reduce((sum, n) => sum + n.x, 0) / nodes.length;
        const yVals = nodes.map(n => n.y);
        const centerY = (Math.min(...yVals) + Math.max(...yVals)) / 2;

        graphRef.current.centerAt(avgX, centerY, 0);
        graphRef.current.zoom(0.04, 1000);
    }, [nodes]);
}
