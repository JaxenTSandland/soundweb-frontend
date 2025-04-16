import React, { useEffect, useRef, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import useTooltip from "./useTooltip.jsx";
import {renderNode} from "./artistNodeRenderer.js";
import drawLinks from "../../utils/drawLinks.jsx";
import {fetchArtistAndGenreData} from "../../utils/fetchGraphData.jsx";
import {useGraphInit} from "../../utils/graphInit.jsx";
import drawNodePopup from "../../utils/drawNodePopup.jsx";
import {toTitleCase} from "../../utils/textUtils.js";



export default function ArtistGraph() {
    const { showTooltip, hideTooltip } = useTooltip();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [genreLabels, setGenreLabels] = useState([]);
    const [hoverNode, setHoverNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    const [allGenres, setAllGenres] = useState([]);
    const [genreFilterMode, setGenreFilterMode] = useState("exclude");
    const [sortMethod, setSortMethod] = useState("popularity");

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
        setTimeout(() => setSelectedNode(node), 900);
    }

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredResults([]);
            return;
        }

        const results = graphData.nodes
            .filter(n => !n.labelNode && !shouldFadeNode(n) && n.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 5);

        setFilteredResults(results);
    }, [searchTerm, graphData.nodes]);
    // endregion

    // region genre filtering methods
    function toggleGenre(genreName) {
        setAllGenres(prev =>
            prev.map(g =>
                g.genre === genreName ? { ...g, toggled: !g.toggled } : g
            )
        );
    }

    function cycleSortMethod() {
        setSortMethod(prev => {
            if (prev === "popularity") return "alphabetical";
            return "popularity";
        });
    }

    function shouldFadeNode(node) {
        if (node.labelNode) return false;

        const includeMode = genreFilterMode === "include";

        const activeGenres = allGenres
            .filter(g => includeMode ? g.toggled : !g.toggled)
            .map(g => g.genre);

        if (includeMode) {
            // Fade nodes that match NONE of the active genres
            return !node.genres.some(g => activeGenres.includes(g));
        } else {
            // Fade nodes that match ANY of the active genres
            return node.genres.some(g => activeGenres.includes(g));
        }
    }

    const sortedGenres = [...allGenres].sort((a, b) => {
        if (sortMethod === "alphabetical") {
            return a.genre.localeCompare(b.genre);
        }
        // Default to popularity
        return b.count - a.count;
    });
    // endregion

    useEffect(() => {
        if (!selectedNode || selectedNode.labelNode) {
            setPopupData(null);
            return;
        }

        setPopupData({
            x: 0,
            y: 0,
            name: selectedNode.name,
            image: selectedNode.imageUrl,
            label: selectedNode.genres.join(", "),
            node: selectedNode
        });
    }, [selectedNode]);

    function openPopupForNode(node) {
        if (!node || node.labelNode) return;
        setSelectedNode(node);
    }


    useEffect(() => {
        async function loadGraph() {
            const { artistNodesRaw, genreLabels, links } = await fetchArtistAndGenreData();

            const artistNodes = artistNodesRaw.map(artist => ({
                id: artist.id,
                name: artist.name,
                radius: Math.pow(artist.popularity / 100, 4.5) * 70 + 5,
                genres: artist.genres,
                spotifyUrl: artist.spotifyId
                    ? `https://open.spotify.com/artist/${artist.spotifyId}`
                    : artist.spotifyUrl || "",
                imageUrl: artist.imageUrl,
                color: artist.color,
                x: artist.x,
                y: artist.y,
                label: `${artist.name}\nGenre: ${artist.genres.join(", ")}\nPopularity: ${artist.popularity}/100`,
                labelNode: false
            }));

            const labelNodes = genreLabels.map((genre, i) => ({
                id: `genre-${i}`,
                name: toTitleCase(genre.name),
                x: genre.x,
                y: genre.y,
                radius: 1,
                color: "transparent",
                labelNode: true,
                count: genre.count
            }));

            const genreUsageMap = {};

            artistNodes.forEach(artist => {
                artist.genres.forEach(genre => {
                    genreUsageMap[genre] = (genreUsageMap[genre] || 0) + 1;
                });
            });
            const sortedGenres = Object.entries(genreUsageMap)
                .sort((a, b) => b[1] - a[1])
                .map(([genre, count]) => ({
                    genre,
                    count,
                    toggled: true
                }));

            setAllGenres(sortedGenres);

            setGraphData({ nodes: [...artistNodes, ...labelNodes], links: [] });
            setAllLinks(links);
            setGenreLabels(genreLabels);
        }

        loadGraph();
    }, []);


    useGraphInit(graphRef, graphData.nodes);

    useEffect(() => {
        if (graphData.nodes.length > 0 && allLinks.length > 0) {
            drawLinks(
                canvasRef.current,
                graphData.nodes,
                allLinks,
                graphRef.current,
                hoverNode,
                selectedNode,
                shouldFadeNode
            );
        }
    }, [hoverNode, selectedNode, allGenres, genreFilterMode]);

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
                        const faded = shouldFadeNode(node);
                        if (!faded) {
                            renderNode(
                                node,
                                ctx,
                                globalScale,
                                graphData,
                                minCount,
                                maxCount,
                                hoverNode,
                                selectedNode,
                            );
                        }

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
                        drawLinks(canvasRef.current, graphData.nodes, allLinks, graphRef.current, hoverNode, selectedNode, shouldFadeNode)
                    }
                    onPan={() =>
                        drawLinks(canvasRef.current, graphData.nodes, allLinks, graphRef.current, hoverNode, selectedNode, shouldFadeNode)
                    }
                />
            </div>
            {/* Genre list display */}
            <div
                style={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    width: "300px",
                    maxHeight: "35vh",
                    background: "#1a1a1a",
                    border: "1px solid #444",
                    borderRadius: "6px",
                    overflow: "hidden",
                    zIndex: 20,
                    color: "white",
                    fontSize: "14px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.5)"
                }}
            >
                {/* Fixed header */}
                <div
                    style={{
                        background: "#1a1a1a",
                        padding: "10px",
                        borderBottom: "1px solid #444",
                        fontWeight: "bold",
                        fontSize: "15px",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <span>Filter by Genre</span>
                    <button
                        onClick={() => {
                            setGenreFilterMode(prev => {
                                const newMode = prev === "exclude" ? "include" : "exclude";
                                setGenreFilterMode(prev => {
                                    const newMode = prev === "exclude" ? "include" : "exclude";
                                    setAllGenres(genres => genres.map(g => ({ ...g, toggled: newMode === "include" })));
                                    setSelectedNode(null);
                                    return newMode;
                                });
                                return newMode;
                            });
                        }}
                        style={{
                            fontSize: "12px",
                            padding: "4px 8px",
                            background: "#333",
                            color: "white",
                            border: "1px solid #555",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        {genreFilterMode === "exclude" ? "Exclude genres" : "Include genres"}
                    </button>
                </div>

                {/* Scrollable list */}
                <div style={{ maxHeight: "calc(35vh - 40px)", overflowY: "auto" }}>
                    <div style={{ padding: "10px", borderBottom: "1px solid #333", display: "flex", gap: "8px" }}>
                        <button
                            onClick={() => {
                                const onCount = allGenres.filter(g => g.toggled).length;
                                const selectAll = onCount / allGenres.length <= 0.5;
                                setAllGenres(allGenres.map(g => ({ ...g, toggled: selectAll })));
                                setSelectedNode(null);
                            }}
                            style={{
                                fontSize: "12px",
                                padding: "4px 8px",
                                background: "#222",
                                color: "white",
                                border: "1px solid #444",
                                borderRadius: "4px",
                                cursor: "pointer",
                                flex: 1
                            }}
                        >
                            {allGenres.filter(g => genreFilterMode === "include" ? g.toggled : !g.toggled).length / allGenres.length > 0.5
                                ? "Deselect all"
                                : "Select all"}
                        </button>

                        <button
                            onClick={cycleSortMethod}
                            style={{
                                fontSize: "12px",
                                padding: "4px 8px",
                                background: "#222",
                                color: "white",
                                border: "1px solid #444",
                                borderRadius: "4px",
                                cursor: "pointer",
                                flex: 1
                            }}
                        >
                            Sort: {sortMethod === "alphabetical" ? "A–Z" : "Popularity"}
                        </button>
                    </div>
                    <ul style={{ listStyle: "none", padding: "10px", margin: 0 }}>
                        {sortedGenres.map(({ genre, count, toggled }) => (
                            <li key={genre} style={{ marginBottom: "6px", display: "flex", alignItems: "center" }}>
                                <input
                                    type="checkbox"
                                    checked={genreFilterMode === "exclude" ? !toggled : toggled}
                                    onChange={() => toggleGenre(genre)}
                                    style={{ marginRight: "8px" }}
                                />
                                <span>{toTitleCase(genre)} ({count})</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

}
