import React, { useEffect, useRef, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import useTooltip from "./useTooltip.jsx";
import {renderNode} from "./artistNodeRenderer.js";
import ArtistPopup from "./artistPopup.jsx";
import drawLinks from "../../utils/drawLinks.jsx";
import {fetchArtistAndGenreData} from "../../utils/fetchGraphData.jsx";
import {useGraphInit} from "../../utils/graphInit.jsx";

export default function ArtistGraph() {
    const { showTooltip, hideTooltip } = useTooltip();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [genreLabels, setGenreLabels] = useState([]);
    const [hoverNode, setHoverNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    const graphRef = useRef(null);
    const canvasRef = useRef(null);
    const [popupData, setPopupData] = useState(null);
    const [allLinks, setAllLinks] = useState([]);

    const labelNodesOnly = graphData.nodes.filter(n => n.labelNode);
    const counts = labelNodesOnly.map(n => n.count || 0);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);


    function openPopupForNode(node) {
        if (!node || node.labelNode) return;
        setSelectedNode(node);
        setPopupData({
            x: 0,
            y: 0,
            name: node.name,
            label: node.genres.join(", "),
            node
        });
    }

    useEffect(() => {
        fetch("http://localhost:3000/api/genres/top?count=10")
            .then(res => res.json())
            .then(setGenreLabels)
            .catch(err => console.error("Failed to load genre labels:", err));
    }, []);


    useEffect(() => {
        async function loadGraph() {
            const allNodes = await fetchArtistAndGenreData(setGraphData, setAllLinks, setGenreLabels);
            if (allNodes && graphRef.current) {
                drawLinks(canvasRef.current, graphData.nodes, allLinks, graphRef.current, hoverNode);
            }
        }

        loadGraph();
    }, []);

    useGraphInit(graphRef, graphData.nodes);


    useEffect(() => {
        if (graphData.nodes.length > 0 && allLinks.length > 0) {
            drawLinks(canvasRef.current, graphData.nodes, allLinks, graphRef.current, hoverNode, selectedNode);

        }
    }, [hoverNode, selectedNode]);

    return (
        <div id="graph-container" style={{ position: "relative", width: "100vw", height: "100vh" }}>
            {popupData && (
                <ArtistPopup {...popupData} />
            )}

            <div
                id="tooltip"
                style={{
                    position: "absolute",
                    pointerEvents: "none",
                    background: "rgba(0,0,0,0.8)",
                    color: "white",
                    padding: "8px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    display: "none",
                    zIndex: 10
                }}
            />
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    position: "relative",
                    background: "black"
                }}>
                <canvas
                    ref={canvasRef}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 0.5
                    }}
                />
                <ForceGraph2D
                    d3Force="none"
                    ref={graphRef}
                    minZoom={0.04}
                    maxZoom={2.5}
                    graphData={graphData}
                    nodeLabel={() => ""}
                    enableNodeDrag={false}
                    onNodeHover={(node) => {
                        if (node && !node.labelNode) {
                            setHoverNode(node);
                            showTooltip(node);
                        } else {
                            setHoverNode(null);
                            hideTooltip();
                        }
                    }}
                    nodePointerAreaPaint={(node, color, ctx) => {
                        const adjustedRadius = node.radius / 1;
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, adjustedRadius, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }}


                    nodeCanvasObject={(node, ctx, globalScale) =>
                        renderNode(
                            node,
                            ctx,
                            globalScale,
                            graphData,
                            minCount,
                            maxCount,
                            hoverNode,
                            selectedNode
                        )
                    }

                    onNodeClick={openPopupForNode}
                    onBackgroundClick={() => {
                        setSelectedNode(null);
                        setPopupData(null);
                    }}
                    onZoom={() =>
                        drawLinks(canvasRef.current, graphData.nodes, allLinks, graphRef.current, hoverNode, selectedNode)
                    }
                    onPan={() =>
                        drawLinks(canvasRef.current, graphData.nodes, allLinks, graphRef.current, hoverNode, selectedNode)
                    }
                />
            </div>
        </div>
    );
}
