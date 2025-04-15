import React, { useEffect, useRef, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import useTooltip from "./useTooltip.jsx";
import {renderNode} from "./artistNodeRenderer.js";
import drawLinks from "../../utils/drawLinks.jsx";
import {fetchArtistAndGenreData} from "../../utils/fetchGraphData.jsx";
import {useGraphInit} from "../../utils/graphInit.jsx";
import drawNodePopup from "../../utils/drawNodePopup.jsx";



export default function ArtistGraph() {
    const { showTooltip, hideTooltip } = useTooltip();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [genreLabels, setGenreLabels] = useState([]);
    const [hoverNode, setHoverNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    // Search bar states
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredResults, setFilteredResults] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);


    const graphRef = useRef(null);
    const canvasRef = useRef(null);
    const [popupData, setPopupData] = useState(null);
    const [allLinks, setAllLinks] = useState([]);

    const labelNodesOnly = graphData.nodes.filter(n => n.labelNode);
    const counts = labelNodesOnly.map(n => n.count || 0);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);


    // region Search bar functions

    function handleResultClick(node) {
        if (!node || !graphRef.current) return;
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(1.5, 1000);
        setSearchTerm("");
        setFilteredResults([]);
        setSelectedNode(null);
        setTimeout(() => setSelectedNode(node), 750);
    }

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredResults([]);
            return;
        }

        const results = graphData.nodes
            .filter(n => !n.labelNode && n.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 3);

        setFilteredResults(results);
    }, [searchTerm, graphData.nodes]);
    // endregion


    function openPopupForNode(node) {
        if (!node || node.labelNode) return;
        setSelectedNode(node);
        console.log(node);
        setPopupData({
            x: 0,
            y: 0,
            name: node.name,
            image: node.imageUrl,
            label: node.genres.join(", "),
            node
        });
    }


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
            {/* Search bar */}
            <div style={{ position: "absolute", top: 10, right: 10, zIndex: 20, width: "250px" }}>
                <form style={{ marginBottom: "4px" }}>
                    <input
                        type="text"
                        placeholder="Search artist..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => {
                            setTimeout(() => setIsSearchFocused(false), 100);
                        }}
                        style={{
                            width: "100%",
                            padding: "6px 10px",
                            fontSize: "14px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            outline: "none",
                            background: "#1a1a1a",
                            color: "#fff"
                        }}
                    />
                </form>

                {searchTerm && isSearchFocused && filteredResults.length > 0 && (
                    <div
                        style={{
                            background: "#222",
                            borderRadius: "6px",
                            border: "1px solid #444",
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
                        }}
                    >
                        {filteredResults.map((node) => (
                            <div
                                key={node.id}
                                onClick={() => handleResultClick(node)}
                                style={{
                                    padding: "6px 10px",
                                    cursor: "pointer",
                                    color: "white",
                                    fontSize: "14px",
                                    borderBottom: "1px solid #333"
                                }}
                            >
                                {node.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tooltip */}
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
                }}
            >
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
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        renderNode(
                            node,
                            ctx,
                            globalScale,
                            graphData,
                            minCount,
                            maxCount,
                            hoverNode,
                            selectedNode
                        );

                        if (popupData && popupData.node === node) {
                            drawNodePopup(ctx, node, popupData, globalScale);
                        }
                    }}
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
