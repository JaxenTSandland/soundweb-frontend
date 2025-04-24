import React, { useEffect, useRef, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import useTooltip from "./useTooltip.jsx";
import {renderNode} from "./artistNodeRenderer.js";
import drawLinks from "../../utils/drawLinks.jsx";
import DataFetcher from "../../utils/dataFetcher.js";
import {useGraphInit} from "../../utils/graphInit.jsx";
import {toTitleCase} from "../../utils/textUtils.js";
import RightSidebar from "./rightSidebar.jsx";





export default function ArtistGraph() {
    const { showTooltip, hideTooltip } = useTooltip();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [hoverNode, setHoverNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    const dataFetcher = new DataFetcher();
    const [lastSyncTime, setLastSyncTime] = useState("Loading...");

    const [allGenres, setAllGenres] = useState([]);
    const [sortMethod, setSortMethod] = useState("popularity");

    // Search bar states
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredResults, setFilteredResults] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);


    const graphRef = useRef(null);
    const canvasRef = useRef(null);
    const [popupData, setPopupData] = useState(undefined);
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

    // region genre filtering functions
    function toggleGenre(genreName) {
        setSelectedNode(null);
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
        if (!node.genres || node.genres.length === 0) return false;

        const topGenre = node.genres[0]; // Only the top genre matters
        const activeGenres = allGenres.filter(g => g.toggled).map(g => g.genre);

        return !activeGenres.includes(topGenre);
    }
    // endregion

    function parseLastSync(lastSync) {
        if (!lastSync || !lastSync.year) return "Unknown";

        const {
            year, month, day, hour, minute, second
        } = lastSync;

        const date = new Date(
            year.low,
            month.low - 1,
            day.low,
            hour.low,
            minute.low,
            second.low
        );

        return date;
    }

    useEffect(() => {
        if (!selectedNode || selectedNode.labelNode) {
            console.log("[popup] clearing popupData");
            setPopupData(undefined);
            return;
        }

        console.log("[popup] showing popup for", selectedNode.name);
        setPopupData({
            name: selectedNode.name,
            image: selectedNode.imageUrl,
            label: selectedNode.genres.join(", "),
            node: selectedNode
        });
    }, [selectedNode]);

    function openSidebarForArtist(node) {
        if (!node || node.labelNode) return;
        setSelectedNode(node);
    }


    useEffect(() => {
        async function loadGraph() {
            const { artistNodesRaw, genreLabels, allGenres, links } = await dataFetcher.fetchArtistAndGenreData();

            // Build artist map by ID for fast lookup
            const relatedMap = {};
            links.forEach(link => {
                if (!relatedMap[link.source]) relatedMap[link.source] = new Set();
                if (!relatedMap[link.target]) relatedMap[link.target] = new Set();
                relatedMap[link.source].add(link.target);
                relatedMap[link.target].add(link.source);
            });

            const artistNodes = artistNodesRaw.map(artist => ({
                id: artist.id,
                name: artist.name,
                lastfmMBID: artist.lastfmMBID,
                radius: Math.pow(artist.popularity / 100, 4.5) * 70 + 5,
                genres: artist.genres,
                spotifyId: artist.spotifyId,
                spotifyUrl: artist.spotifyId
                    ? `https://open.spotify.com/artist/${artist.spotifyId}`
                    : artist.spotifyUrl || "",
                imageUrl: artist.imageUrl,
                color: artist.color,
                x: artist.x,
                y: artist.y,
                label: `${artist.name}\nGenre: ${artist.genres.join(", ")}\nPopularity: ${artist.popularity}/100`,
                labelNode: false,
                relatedArtists: Array.from(relatedMap[artist.id] || [])
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

            // Build a map of genreName -> color
            const genreColorMap = {};
            allGenres.forEach(g => {
                genreColorMap[g.name] = g.color;
            });

            // Count genre usage and add toggled + color
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
                    color: genreColorMap[genre] || "#888",
                    toggled: true
                }));

            setAllGenres(sortedGenres);
            setGraphData({ nodes: [...artistNodes, ...labelNodes], links: [] });
            setAllLinks(links);
        }

        loadGraph();
    }, []);


    useEffect(() => {
        async function fetchSyncTime() {
            const lastSync = await dataFetcher.fetchLastSync();
            setLastSyncTime(parseLastSync(lastSync));
        }

        fetchSyncTime();
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
    }, [hoverNode, selectedNode, allGenres]);

    return (
        <div id="graph-container" style={{ display: "flex", width: "100vw", height: "100vh" }}>
            <div style={{ position: "relative", flex: 1 }}>
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

                        }}
                        onNodeClick={openSidebarForArtist}
                        onBackgroundClick={() => {
                            setSelectedNode(null);
                            setPopupData(undefined);
                        }}
                        onZoom={() =>
                            drawLinks(canvasRef.current, graphData.nodes, allLinks, graphRef.current, hoverNode, selectedNode, shouldFadeNode)
                        }
                        onPan={() =>
                            drawLinks(canvasRef.current, graphData.nodes, allLinks, graphRef.current, hoverNode, selectedNode, shouldFadeNode)
                        }
                    />
                </div>
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        left: 15,
                        color: "white",
                        fontSize: "18px",
                        fontWeight: "bold",
                        letterSpacing: "1px",
                        zIndex: 25
                    }}
                >
                    Soundweb
                </div>
                {lastSyncTime && (
                    <div
                        style={{
                            position: "absolute",
                            top: 35,
                            left: 10,
                            background: "#1a1a1a",
                            color: "white",
                            padding: "6px 12px",
                            fontSize: "13px",
                            borderRadius: "6px",
                            border: "1px solid #444",
                            zIndex: 25
                        }}
                    >
                        Last updated: {new Date(lastSyncTime).toLocaleString()}
                    </div>
                )}
            </div>

            <RightSidebar
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                allGenres={allGenres}
                toggleGenre={toggleGenre}
                setAllGenres={setAllGenres}
                sortMethod={sortMethod}
                cycleSortMethod={cycleSortMethod}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredResults={filteredResults}
                isSearchFocused={isSearchFocused}
                setIsSearchFocused={setIsSearchFocused}
                handleResultClick={handleResultClick}
            />
        </div>
    );

}
