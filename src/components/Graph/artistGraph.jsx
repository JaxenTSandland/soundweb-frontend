import React, {useEffect, useMemo, useRef, useState} from "react";
import { ForceGraph2D } from "react-force-graph";
import useTooltip from "./useTooltip.jsx";
import {renderArtistNode} from "./artistNodeRenderer.js";
import drawLinks from "../../utils/drawLinks.jsx";
import DataFetcher from "../../utils/dataFetcher.js";
import {useGraphInit} from "../../utils/graphInit.jsx";
import RightSidebar from "./rightSidebar.jsx";
import {ArtistNode} from "../../models/artistNode.js";
import {generateGenreLabelNodes} from "../../utils/generateGenreLabelNodes.js";
import {renderLabelNode} from "./labelNodeRenderer.js";
import {toTitleCase} from "../../utils/textUtils.js";



const dataFetcher = new DataFetcher();

export default function ArtistGraph({ mode, param }) {
    const { showTooltip, hideTooltip } = useTooltip();
    const [artistNodes, setArtistNodes] = useState([]);
    const [genreLabelNodes, setGenreLabelNodes] = useState([]);
    const [hoverNode, setHoverNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [showLinks, setShowLinks] = useState(true);
    const [showTopGenres, setShowTopGenres] = useState(true);

    const [lastSyncTime, setLastSyncTime] = useState("Loading...");

    const [allTopGenres, setAllTopGenres] = useState([]);
    const [allUsedGenres, setAllUsedGenres] = useState([]);
    const [sortMethod, setSortMethod] = useState("popularity");

    // Search bar states
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredResults, setFilteredResults] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);


    const graphRef = useRef(null);
    const canvasRef = useRef(null);
    const [allLinks, setAllLinks] = useState([]);
    const [filteredLinks, setFilteredLinks] = useState([]);

    const activeGenreNameSet = useMemo(() => {
        return new Set(allTopGenres.filter(g => g.toggled).map(g => g.name));
    }, [allTopGenres]);
    const visibleLabelNameSet = useMemo(() => {
        if (!Array.isArray(allTopGenres) || allTopGenres.length === 0) return new Set();

        const toggledGenres = allTopGenres.filter(g => g.toggled);
        const topLabels = generateGenreLabelNodes(toggledGenres, 10);
        console.log("New top genres: ", topLabels);
        return new Set(topLabels.map(g => toTitleCase(g.name)));
    }, [allTopGenres]);
    const { minCount, maxCount } = useMemo(() => {
        if (!allTopGenres || allTopGenres.length === 0) return { minCount: 0, maxCount: 1 };

        const counts = allTopGenres.map(g => g.count || 0);
        return {
            minCount: Math.min(...counts),
            maxCount: Math.max(...counts),
        };
    }, [activeGenreNameSet]);

    const [artistNodesRaw, setArtistNodesRaw] = useState([]);
    const [genreLabelsRaw, setGenreLabelsRaw] = useState([]);
    const [allGenresRaw, setAllGenresRaw] = useState([]);
    const [rawLinks, setRawLinks] = useState([]);

    const graphScale = useMemo(() => {
        const artistCount = artistNodesRaw.length;
        return Math.max(artistCount * 20, 2000) / 20000;
    }, [artistNodesRaw.length]);

    useEffect(() => {
        async function loadGraph() {
            try {
                console.log("Loading graph data");
                setSelectedNode(null);

                let artistNodesRaw = [];
                let genreLabels = [];
                let links = [];
                let lastSync = null;

                if (mode === "Top1000") {
                    const data = await dataFetcher.fetchTopArtistData();
                    artistNodesRaw = data.artistNodesRaw;
                    genreLabels = [];
                    links = data.links;
                    lastSync = data.lastSync;

                } else if (mode === "UserCustom" && param) {
                    const data = await dataFetcher.fetchCustomArtistAndLinkData(1000);
                    artistNodesRaw = data.artistNodesRaw;
                    links = data.links;
                    lastSync = data.lastSync;
                    genreLabels = [];

                } else if (mode === "ArtistBased" && param) {
                    console.warn("[ArtistGraph] ArtistBased mode not implemented yet.");
                }

                setLastSyncTime(parseLastSync(lastSync));
                setGenreLabelsRaw(genreLabels);
                setRawLinks(links);
                setArtistNodesRaw(artistNodesRaw);

            } catch (err) {
                console.error("[ArtistGraph] Failed to load graph data:", err);
            }
        }

        loadGraph().then();
    }, [mode, param]);


    useEffect(() => {
        async function loadGenres() {
            try {
                const fetchedAllGenres = await dataFetcher.fetchAllGenres();
                const scaledGenres = fetchedAllGenres.map(g => ({
                    ...g
                }));
                setAllGenresRaw(scaledGenres);
            } catch (error) {
                console.error("Failed to load allGenres: ", error);
                setAllGenresRaw([]);
            }
        }

        loadGenres();
    }, [graphScale]);


    useEffect(() => {
        function buildGraph() {
            if (allGenresRaw.length === 0 || artistNodesRaw.length === 0) return;
            console.log("Building Graph");

            // Build artist map by ID for fast lookup
            const relatedMap = {};
            rawLinks.forEach(link => {
                if (!relatedMap[link.source]) relatedMap[link.source] = new Set();
                if (!relatedMap[link.target]) relatedMap[link.target] = new Set();
                relatedMap[link.source].add(link.target);
                relatedMap[link.target].add(link.source);
            });

            const artistNodes = artistNodesRaw.map(artist => {
                const node = new ArtistNode(artist);
                node.labelNode = false;
                node.radius = Math.pow(node.popularity / 100, 4.5) * 70 + 5;
                node.label = `${artist.name}\nGenre: ${artist.genres.slice(0,3).join(", ")}\nPopularity: ${artist.popularity}/100`;

                node.x *= graphScale;
                node.y *= graphScale;

                return node;
            });
            console.log(`${artistNodes.length} artist nodes made`);

            // Build a set of genres actually used by the artist nodes
            const topGenreUsageMap = {};
            artistNodes.forEach(artist => {
                topGenreUsageMap[artist.genres[0]] = (topGenreUsageMap[artist.genres[0]] || 0) + 1;
            });
            const usedGenreUsageMap = {};
            artistNodes.forEach(artist => {
                artist.genres.forEach(genre => {
                    usedGenreUsageMap[genre] = (usedGenreUsageMap[genre] || 0) + 1;
                });
            });


            const sortedTopGenres = allGenresRaw
                .filter(g => topGenreUsageMap[g.name])
                .map(g => ({
                    ...g,
                    toggled: true,
                    x: g.x * graphScale,
                    y: g.y * graphScale,
                    count: topGenreUsageMap[g.name]
                }));

            const sortedUsedGenres = allGenresRaw
                .filter(g => usedGenreUsageMap[g.name])
                .map(g => ({
                    ...g,
                    toggled: true,
                    x: g.x,
                    y: g.y,
                    count: usedGenreUsageMap[g.name]
                }));

            const labelNodes = generateGenreLabelNodes(sortedUsedGenres, sortedUsedGenres.length);

            setAllTopGenres(sortedTopGenres);
            setAllUsedGenres(sortedUsedGenres);
            setArtistNodes(artistNodes);
            setGenreLabelNodes(labelNodes)
            setAllLinks(rawLinks);
            setGraphData({
                nodes: [...artistNodes, ...labelNodes],
                links: []
            });
        }

        buildGraph();
    }, [artistNodesRaw, genreLabelsRaw, allGenresRaw, rawLinks]);

    // endregion

    // region Search bar functions

    function handleResultClick(node) {
        if (!node || !graphRef.current) return;
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(1.5, 1000);
        setSearchTerm("");
        setFilteredResults([]);
        setSelectedNode(null);
        setTimeout(() => setSelectedNode(node), 1050);
    }

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredResults([]);
            return;
        }

        const results = artistNodes
            .filter(n => !n.labelNode && !shouldFadeNode(n) && n.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 5);

        setFilteredResults(results);
    }, [searchTerm, artistNodes]);
    // endregion

    // region genre filtering functions
    function toggleGenre(genreName) {
        setSelectedNode(null);
        setAllTopGenres(prev =>
            prev.map(g =>
                g.name === genreName ? { ...g, toggled: !g.toggled } : g
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
        if (!node.genres || node.genres.length === 0) return true;

        const topGenre = node.genres[0];
        return !activeGenreNameSet.has(topGenre);
    }
    // endregion

    function drawLinksIfNeeded() {
        if (
            showLinks &&
            artistNodes.length > 0 &&
            filteredLinks.length > 0 &&
            graphRef.current &&
            canvasRef.current
        ) {

            //console.log(`Drawing ${linksToDraw.length} links`);
            drawLinks(
                canvasRef.current,
                artistNodes,
                filteredLinks,
                graphRef.current,
                selectedNode
            );
        } else if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }

    useEffect(() => {
        if (!selectedNode) {
            const visibleLinks = allLinks.filter(link => {
                const sourceNode = artistNodes.find(n => n.id === link.source);
                const targetNode = artistNodes.find(n => n.id === link.target);

                return sourceNode && targetNode && !shouldFadeNode(sourceNode) && !shouldFadeNode(targetNode);
            });

            setFilteredLinks(visibleLinks);
            return;
        }

        const firstDegree = new Set();
        const secondDegree = new Set();

        allLinks.forEach(link => {
            if (link.source === selectedNode.id) {
                firstDegree.add(link.target);
            }
            if (link.target === selectedNode.id) {
                firstDegree.add(link.source);
            }
        });

        allLinks.forEach(link => {
            if (firstDegree.has(link.source) || firstDegree.has(link.target)) {
                secondDegree.add(link.source);
                secondDegree.add(link.target);
            }
        });

        const newFilteredLinks = allLinks.filter(link => {
            const sourceNode = artistNodes.find(n => n.id === link.source);
            const targetNode = artistNodes.find(n => n.id === link.target);
            const bothVisible = sourceNode && targetNode && !shouldFadeNode(sourceNode) && !shouldFadeNode(targetNode);

            return bothVisible && (
                link.source === selectedNode.id ||
                link.target === selectedNode.id ||
                firstDegree.has(link.source) ||
                firstDegree.has(link.target)
            );
        });

        setFilteredLinks(newFilteredLinks);
    }, [activeGenreNameSet, selectedNode, allLinks, artistNodes, mode]);


    function parseLastSync(lastSync) {
        if (!lastSync) return "Unknown";

        if (typeof lastSync === "string") { // ISO String
            const date = new Date(lastSync);
            if (!date) return "Invalid Date";
            return date.toLocaleString();
        }

        if (typeof lastSync === "object") { // Date object
            const { year, month, day, hour, minute, second } = lastSync;

            if (!year || !month || !day || !hour || !minute || !second) {
                return "Invalid Date";
            }

            const date = new Date(
                year.low,
                month.low - 1,
                day.low,
                hour.low,
                minute.low,
                second.low
            );

            if (isNaN(date)) return "Invalid Date";
            return date.toLocaleString();
        }

        return "Unknown";
    }

    function openSidebarForArtist(node) {
        if (!node || node.labelNode || shouldFadeNode(node)) return;
        setSelectedNode(node);
    }

    useGraphInit(graphRef, artistNodes);

    useEffect(() => {
        if (graphRef.current && canvasRef.current) {
            drawLinksIfNeeded();
        }
    }, [selectedNode, filteredLinks, showLinks, artistNodes]);

    return (
        <div id="graph-container" style={{ display: "flex", width: "100vw", height: "100vh" }}>
            <div style={{ position: "relative", flex: 1 }}>
                {/* Toggle links button */}
                <button
                    onClick={() => setShowLinks(prev => !prev)}
                    style={{
                        position: "absolute",
                        bottom: 20,
                        left: 20,
                        padding: "6px 12px",
                        backgroundColor: "#1a1a1a",
                        color: "white",
                        border: "1px solid #444",
                        borderRadius: "6px",
                        fontSize: "13px",
                        cursor: "pointer",
                        zIndex: 25
                    }}
                >
                    {showLinks ? "Hide Links" : "Show Links"}
                </button>
                {/* Toggle top genres button */}
                <button
                    onClick={() => setShowTopGenres(prev => !prev)}
                    style={{
                        position: "absolute",
                        bottom: 60,
                        left: 20,
                        padding: "6px 12px",
                        backgroundColor: "#1a1a1a",
                        color: "white",
                        border: "1px solid #444",
                        borderRadius: "6px",
                        fontSize: "13px",
                        cursor: "pointer",
                        zIndex: 25
                    }}
                >
                    {showTopGenres ? "Hide Top Genres" : "Show Top Genres"}
                </button>
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
                            if (node && !node.labelNode && !shouldFadeNode(node)) {
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

                            if (node.labelNode) {
                                if (!showTopGenres || !visibleLabelNameSet.has(toTitleCase(node.name))) return;
                                renderLabelNode(node, ctx, globalScale, minCount, maxCount, graphScale);
                            } else {
                                const faded = shouldFadeNode(node);
                                if (!faded) {
                                    renderArtistNode(node, ctx, globalScale, hoverNode, selectedNode);
                                }
                            }

                        }}
                        onNodeClick={openSidebarForArtist}
                        onBackgroundClick={() => {
                            setSelectedNode(null);
                        }}
                        onZoom={() =>
                            drawLinksIfNeeded()
                        }
                        onPan={() =>
                            drawLinksIfNeeded()
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
                        Last updated: {lastSyncTime}

                    </div>
                )}
            </div>

            <RightSidebar
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                allTopGenres={allTopGenres}
                allUsedGenres={allUsedGenres}
                toggleGenre={toggleGenre}
                setAllGenres={setAllTopGenres}
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
