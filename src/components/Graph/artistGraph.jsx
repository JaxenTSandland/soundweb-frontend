import React, {useEffect, useMemo, useRef, useState} from "react";
import { ForceGraph2D } from "react-force-graph";
import useTooltip from "./useTooltip.jsx";
import {renderArtistNode} from "./artistNodeRenderer.js";
import drawLinks from "../../utils/drawLinks.jsx";
import {
    fetchAllArtistsData,
    fetchAllGenres,
    fetchCustomArtistAndLinkData,
    fetchUserImportProgress,
    fetchUserTopArtistGraph
} from "../../utils/dataFetcher.js";
import {useGraphInit, applyGraphCentering} from "../../utils/graphInit.jsx";
import Sidebar from "../Sidebar/sidebar.jsx";
import {ArtistNode} from "../../models/artistNode.js";
import {generateGenreLabelNodes} from "../../utils/generateGenreLabelNodes.js";
import {renderLabelNode} from "./labelNodeRenderer.js";
import {toTitleCase} from "../../utils/textUtils.js";
import {getTop1000Cache, refreshTop1000Cache} from "../../cache/top1000.js";
import {top1000ArtistRanks} from "../../cache/top1000ArtistRanks.js";
import {withRelatedNodes} from "../../utils/graphUtils.js";
import drawLegend from "../../utils/drawLegend.jsx";
import ToggleButtons from "./Components/ToggleButtons.jsx";
import ZoomControls from "./Components/ZoomControls.jsx";
import "./Components/hamburger.css"

export default function ArtistGraph({ mode, param, user }) {
    const userId = user?.id;

    const [isLoading, setIsLoading] = useState(true);
    const [progressInfo, setProgressInfo] = useState({
        foundCount: 0,
        totalCount: 0,
        progress: 0,
        importingNow: null
    });

    const { showTooltip, hideTooltip } = useTooltip(getNodeLabel);
    const [artistNodes, setArtistNodes] = useState([]);
    const [hoverNode, setHoverNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [showLinks, setShowLinks] = useState(true);
    const [showTopGenres, setShowTopGenres] = useState(true);
    const [showLegend, setShowLegend] = useState(false);
    const [hasTriedToFetchGraph, setHasTriedToFetchGraph] = useState(false);


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
    const zoomingRef = useRef(false);
    const [allLinks, setAllLinks] = useState([]);
    const [filteredLinks, setFilteredLinks] = useState([]);

    const activeGenreNameSet = useMemo(() => {
        return new Set(allTopGenres.filter(g => g.toggled).map(g => g.name));
    }, [allTopGenres]);

    const { minCount, maxCount } = useMemo(() => {
        if (!allTopGenres || allTopGenres.length === 0) return { minCount: 0, maxCount: 1 };

        const counts = allTopGenres.map(g => g.count || 0);
        return {
            minCount: Math.min(...counts),
            maxCount: Math.max(...counts),
        };
    }, [activeGenreNameSet]);

    const userAllRanks = useMemo(() => {
        if (!Array.isArray(user?.topSpotifyIds)) return new Map();

        const allMap = new Map();

        user.topSpotifyIds.forEach((id, index) => {
            allMap.set(id, index);
        });

        return allMap;
    }, [user]);

    const [artistNodesRaw, setArtistNodesRaw] = useState([]);
    const [allGenresRaw, setAllGenresRaw] = useState([]);
    const [rawLinks, setRawLinks] = useState([]);

    const graphScale = useMemo(() => {
        const artistCount = artistNodesRaw.length;
        const baseScale = 4500;
        const perArtist = 18;
        return Math.max(artistCount * perArtist, baseScale) / 20000;
    }, [artistNodesRaw.length]);

    const visibleLabelNameSet = useMemo(() => {
        if (!Array.isArray(allTopGenres) || allTopGenres.length === 0 || (artistNodesRaw && artistNodesRaw.length <= 100)) return new Set();

        const toggledGenres = allTopGenres.filter(g => g.toggled);
        const topLabels = generateGenreLabelNodes(toggledGenres, 10, graphScale);
        return new Set(topLabels.map(g => toTitleCase(g.name)));
    }, [allTopGenres]);

    const loadingText = useMemo(() => {
        switch (mode) {
            case "UserTop":
                return `Importing ${user?.display_name}'s top artists...`;
            case "UserCustom":
                return "Loading your custom artist graph...";
            case "Top1000":
                return "Loading the top 1000 artists...";
            case "AllArtists":
                return "Loading all artist data...";
            case "ArtistBased":
                return "Loading similar artists...";
            default:
                return "Loading artist data...";
        }
    }, [mode, user]);

    function handleZoom(factor) {
        if (!graphRef.current) return;
        const currentZoom = graphRef.current.zoom();
        graphRef.current.zoom(currentZoom * factor, 500);
    }

    // auto-open sidebar on mobile when a node is selected
    useEffect(() => {
        if (selectedNode && window.innerWidth < 768) {
            setIsSidebarOpen(true);
        }
    }, [selectedNode]);


    async function loadGraph() {
        hideTooltip();
        try {
            console.log("Loading graph data");
            setIsLoading(true);
            setHasTriedToFetchGraph(false);

            setArtistNodes([]);
            setGraphData({ nodes: [], links: [] });
            setAllTopGenres([]);
            setAllUsedGenres([]);
            setAllLinks([]);

            setSelectedNode(null);

            let artistNodesRaw = [];
            let rawLinks = [];
            let lastSync = null;

            if (mode === "Top1000") {
                let top1000Cache = getTop1000Cache();
                if (!top1000Cache || top1000Cache.artistNodesRaw.length === 0) {
                    console.log("[ArtistGraph] Fetching Top 1000 graph data");
                    await refreshTop1000Cache();
                    top1000Cache = getTop1000Cache();
                }

                console.log("[ArtistGraph] Using cached Top 1000 graph data");
                artistNodesRaw = top1000Cache.artistNodesRaw;
                rawLinks = top1000Cache.links;
                lastSync = top1000Cache.lastSync;

            } else if (mode === "UserCustom" && param) {
                const data = await fetchCustomArtistAndLinkData(1000, userId);
                artistNodesRaw = data.artistNodesRaw;
                rawLinks = data.links;
                lastSync = data.lastSync;

            } else if (mode === "ArtistBased" && param) {
                console.warn("[ArtistGraph] ArtistBased mode not implemented yet.");
            } else if (mode === "UserTop" && userId) {

                try {
                    const progressData = await fetchUserImportProgress(userId);
                    setProgressInfo(progressData);

                    if (progressData.progress >= 1.0 || progressData.totalCount === 0) {
                        const { nodes: rawNodesFromApi, links: rawLinksFromApi } = await fetchUserTopArtistGraph(userId);
                        artistNodesRaw = rawNodesFromApi;
                        rawLinks = rawLinksFromApi;
                    } else {
                        artistNodesRaw = [];
                        rawLinks = [];
                    }
                } catch (err) {
                    if (err.status === 404)
                        console.warn(`No artist data for ${user.display_name} found`);
                    else
                        console.warn("Failed to fetch UserTop graph:", err.message);

                    artistNodesRaw = [];
                    rawLinks = [];
                }
            } else if (mode === "AllArtists") {
                const data = await fetchAllArtistsData();
                artistNodesRaw = data.artistNodesRaw;
            }

            setLastSyncTime(parseLastSync(lastSync));
            setRawLinks(rawLinks);
            setArtistNodesRaw(artistNodesRaw);

        } catch (err) {
            console.error("[ArtistGraph] Failed to load graph data:", err);
        } finally {
            setHasTriedToFetchGraph(true);
        }
    }

    useEffect(() => {
        loadGraph();
    }, [mode, param]);

    useEffect(() => {
        async function loadGenres() {
            try {
                const fetchedAllGenres = await fetchAllGenres();
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
    }, []);

    useEffect(() => {
        function buildGraph() {
            if (allGenresRaw.length === 0 || artistNodesRaw.length === 0) {
                setArtistNodes([]);
                setGraphData({ nodes: [], links: [] });
                setAllTopGenres([]);
                setAllUsedGenres([]);
                setAllLinks([]);
                return;
            }
            console.log(`Building ${mode} Graph`);

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

                // Always calculate and store both radius types
                const popularityRadius = Math.pow(artist.popularity / 100, 4.5) * 70 + 5;

                const userRank = userAllRanks?.get(artist.id);
                const graphSizeOffsetFactor = (graphScale + ((1 - graphScale) * 0.6));
                const maxSize = 80 * graphSizeOffsetFactor;
                const minSize = 15 * graphSizeOffsetFactor;
                const normalizedRank = Math.min(userRank - 1, 99) / 99;

                let userRankRadius = maxSize - normalizedRank * (maxSize - minSize);
                if (userRank < 10) userRankRadius *= 1.25;

                // Save both for easy access later
                node.popularityRadius = popularityRadius;
                node.userRankRadius = userRankRadius;

                // Still assign one as the default so ForceGraph doesn't break
                node.radius = popularityRadius; // or userRankRadius depending on context

                node.x *= graphScale;
                node.y *= graphScale;

                return node;
            });

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
                    x: g.x * graphScale,
                    y: g.y * graphScale,
                    count: usedGenreUsageMap[g.name]
                }));

            const labelNodes = generateGenreLabelNodes(sortedUsedGenres, sortedUsedGenres.length, graphScale);

            setAllTopGenres(sortedTopGenres);
            setAllUsedGenres(sortedUsedGenres);
            setArtistNodes(artistNodes);
            setAllLinks(rawLinks);
            setGraphData({
                nodes: [...artistNodes, ...labelNodes],
                links: []
            });

            if (mode === "Top1000" && top1000ArtistRanks.size === 0) {
                reloadGlobalRankings()
            }

            setIsLoading(false);
        }

        buildGraph();
    }, [artistNodesRaw, allGenresRaw, rawLinks]);

    // endregion

    function reloadGlobalRankings() {
        if (mode === "Top1000") {
            const sorted = artistNodes
                .filter(n => !n.labelNode)
                .sort((a, b) => b.popularity - a.popularity);

            top1000ArtistRanks.clear();
            sorted.forEach((artist, index) => {
                top1000ArtistRanks.set(artist.id, index);
            });
        }
    }

    useEffect(() => {
        let interval;

        if (mode === "UserTop" && user?.id && progressInfo.progress < 1.0) {
            interval = setInterval(async () => {
                try {
                    const { foundCount, totalCount, progress, importingNow } = await fetchUserImportProgress(user.id);
                    setProgressInfo({ foundCount, totalCount, progress, importingNow });

                    if (progress >= 1.0 || totalCount === 0) {
                        clearInterval(interval);
                        await loadGraph();
                    }
                } catch (err) {
                    if (err.status === 404) {
                        clearInterval(interval);
                        setProgressInfo({ foundCount: 0, totalCount: 0, progress: 1, importingNow: null });
                        await loadGraph();
                    } else {
                        console.warn("Import polling failed:", err);
                    }
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [mode, user, progressInfo.progress]);

    // region Search bar functions
    function getNodeLabel(node) {
        const personalRank = userAllRanks.get(node.id);
        const globalRank = top1000ArtistRanks.get(node.id);

        let rankText = "";

        if (mode === "UserTop" && typeof personalRank === "number") {
            rankText = `\n(Personal rank #${personalRank + 1})`;
        } else if (typeof globalRank === "number") {
            rankText = `\n(Global rank #${globalRank + 1})`;
        }

        return `${node.name}${rankText}`;
    }


    function handleResultClick(node) {
        if (!node || !graphRef.current || zoomingRef.current) return;

        // Mobile
        if (window.innerWidth < 768) {
            setSelectedNode(withRelatedNodes(node, artistNodes, shouldFadeNode));
            setIsSidebarOpen(true);
            setSearchTerm("");
            setFilteredResults([]);
            return;
        }

        // Desktop
        zoomingRef.current = true;

        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(1.5, 1000);
        setSearchTerm("");
        setFilteredResults([]);
        setSelectedNode(null);

        setTimeout(() => {
            setSelectedNode(withRelatedNodes(node, artistNodes, shouldFadeNode));
            zoomingRef.current = false;
        }, 1050);
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

    function drawLinksAndLegend() {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (
            showLinks &&
            artistNodes.length > 0 &&
            filteredLinks.length > 0 &&
            graphRef.current
        ) {
            drawLinks(canvas, artistNodes, filteredLinks, graphRef.current, selectedNode);
        }

        if (showLegend) {
            drawLegend(canvas, graphRef.current, graphScale);
        }
    }

    useEffect(() => {
        // Build fade map for performance
        const fadeMap = new Map();
        for (const node of artistNodes) {
            fadeMap.set(node.id, shouldFadeNode(node));
        }

        if (!selectedNode) {
            // If no node is selected, only show links between visible nodes
            const visibleLinks = allLinks.filter(link => {
                return (
                    !fadeMap.get(link.source) &&
                    !fadeMap.get(link.target)
                );
            });

            setFilteredLinks(visibleLinks);
            return;
        }

        // First-degree & second-degree connection detection
        const firstDegree = new Set();
        const secondDegree = new Set();

        allLinks.forEach(link => {
            if (link.source === selectedNode.id) firstDegree.add(link.target);
            if (link.target === selectedNode.id) firstDegree.add(link.source);
        });

        allLinks.forEach(link => {
            if (firstDegree.has(link.source) || firstDegree.has(link.target)) {
                secondDegree.add(link.source);
                secondDegree.add(link.target);
            }
        });

        const newFilteredLinks = allLinks.filter(link => {
            const bothVisible =
                !fadeMap.get(link.source) &&
                !fadeMap.get(link.target);

            const isRelevantLink =
                link.source === selectedNode.id ||
                link.target === selectedNode.id ||
                firstDegree.has(link.source) ||
                firstDegree.has(link.target);

            return bothVisible && isRelevantLink;
        });

        setFilteredLinks(newFilteredLinks);
    }, [activeGenreNameSet, selectedNode, allLinks, artistNodes, mode, user]);


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
        setSelectedNode(withRelatedNodes(node, artistNodes, shouldFadeNode));
    }

    function resetZoom() {
        applyGraphCentering(graphRef, graphData.nodes, graphScale);
    }

    useGraphInit(graphRef, graphData.nodes, graphScale);

    useEffect(() => {
        if (graphRef.current && canvasRef.current) {
            drawLinksAndLegend();
        }
    }, [selectedNode, filteredLinks, showLinks, artistNodes, showLegend]);

    // region Renderers
    function renderLoadingState() {
        const isEmpty = hasTriedToFetchGraph && artistNodesRaw.length === 0;
        const progress = progressInfo.progress;

        return (
            <div style={graphStyles.emptyStateWrapper}>
                <div style={graphStyles.emptyStateBox}>
                    {isEmpty ? (
                        <div style={graphStyles.emptyStateText}>No artist data</div>
                    ) : (
                        <>
                            <div style={graphStyles.emptyStateText}>{loadingText}</div>
                            {mode === "UserTop" && progressInfo && progress < 1.0 && progressInfo.total > 0 && (
                                <>
                                    <div style={graphStyles.progressBarWrapper}>
                                        <div style={{
                                            ...graphStyles.progressBarFill,
                                            width: `${progress * 100}%`
                                        }} />
                                        <span style={graphStyles.progressTextCentered}>
                                            {progressInfo.foundCount} / {progressInfo.totalCount}
                                        </span>
                                    </div>
                                    {progressInfo.importingNow?.name && (
                                        <div style={{ ...graphStyles.emptyStateText, fontSize: "15px", paddingTop: "15px" }}>
                                            Currently importing: <b>{progressInfo.importingNow.name}</b>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    function renderGraphCanvas() {
        return (
            <div style={graphStyles.canvasWrapper}>
                <canvas
                    ref={canvasRef}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    style={graphStyles.canvas}
                />
                <ForceGraph2D
                    d3Force="none"
                    ref={graphRef}
                    minZoom={mode === "AllArtists" ? 40 / artistNodesRaw.length : 0.04}
                    maxZoom={2.5}
                    graphData={graphData}
                    nodeLabel={() => ""}
                    enableNodeDrag={false}
                    onNodeHover={(node) => {
                        const valid = node && !node.labelNode && !shouldFadeNode(node);
                        valid ? (setHoverNode(node), showTooltip(node)) : (setHoverNode(null), hideTooltip());
                    }}
                    nodePointerAreaPaint={(node, color, ctx) => {
                        const radius = mode === "UserTop" ? node.userRankRadius : node.popularityRadius;
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                        ctx.fill();
                    }}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        if (node.labelNode) {
                            if (!showTopGenres || !visibleLabelNameSet.has(toTitleCase(node.name))) return;
                            renderLabelNode(node, ctx, globalScale, minCount, maxCount, graphScale);
                        } else if (activeGenreNameSet.has(node.genres[0])) {
                            renderArtistNode(
                                node,
                                ctx,
                                globalScale,
                                hoverNode,
                                selectedNode,
                                shouldFadeNode(node),
                                mode
                            );
                        }
                    }}
                    onNodeClick={openSidebarForArtist}
                    onBackgroundClick={() => setSelectedNode(null)}
                    onZoom={drawLinksAndLegend}
                    onPan={drawLinksAndLegend}
                />
            </div>
        );
    }

    function renderSidebar() {
        return (
            <Sidebar
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
                mode={mode}
                reloadGraph={loadGraph}
                artistNodes={artistNodes}
                userTopRanks={userAllRanks}
                globalRanks={top1000ArtistRanks}
                shouldFadeNode={shouldFadeNode}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />
        );
    }
    // endregion

    return (
        <div id="graph-container" style={graphStyles.container}>
            <div id="tooltip" style={graphStyles.tooltip} />

            {isLoading ? renderLoadingState() : (
                <>
                    <div style={{ position: "relative", flex: 1 }}>
                        <ToggleButtons
                            showTopGenres={showTopGenres}
                            setShowTopGenres={setShowTopGenres}
                            showLinks={showLinks}
                            setShowLinks={setShowLinks}
                            showLegend={showLegend}
                            setShowLegend={setShowLegend}
                            mode={mode}
                            graphStyles={graphStyles}
                        />
                        {window.innerWidth >= 768 && (
                            <ZoomControls
                                handleZoom={handleZoom}
                                resetZoom={resetZoom}
                                graphStyles={graphStyles}
                            />
                        )}
                        {renderGraphCanvas()}
                        {mode === "Top1000" && lastSyncTime && (
                            <div style={graphStyles.lastSync}>
                                Last updated: {lastSyncTime}
                            </div>
                        )}
                    </div>
                    {!isSidebarOpen && window.innerWidth < 768 && (
                        <button
                            className="hamburger-button"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            ☰
                        </button>
                    )}
                    {renderSidebar()}
                </>
            )}
        </div>
    );

}


const zoomBase = {
    backgroundColor: "#1a1a1a",
    color: "white",
    border: "1px solid #444",
    fontSize: "18px",
    width: "36px",
    height: "36px",
    cursor: "pointer"
};

const graphStyles = {
    container: {
        display: "flex",
        flexDirection: "row",
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "#000"
    },
    canvasWrapper: {
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "black"
    },
    canvas: {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0.5
    },
    tooltip: {
        position: "absolute",
        pointerEvents: "none",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "8px",
        borderRadius: "6px",
        fontSize: "14px",
        display: "none",
        zIndex: 10
    },
    lastSync: {
        position: "absolute",
        top: 10,
        left: 10,
        background: "#1a1a1a",
        color: "white",
        padding: "6px 12px",
        fontSize: "13px",
        borderRadius: "6px",
        border: "1px solid #444, none",
        zIndex: 25
    },
    zoomButtonTop: {
        ...zoomBase,
        borderTopLeftRadius: "6px",
        borderTopRightRadius: "6px"
    },
    zoomButtonBottom: {
        ...zoomBase,
        borderBottomLeftRadius: "6px",
        borderBottomRightRadius: "6px"
    },
    zoomControls: {
        position: "absolute",
        bottom: 90,
        right: 310,
        display: "flex",
        flexDirection: "column",
        zIndex: 25
    },
    toggleButtonGroup: {
        position: "absolute",
        bottom: 90,
        left: 10,
        display: "flex",
        flexDirection: "column",
        width: "180px",
        zIndex: 25
    },
    toggleButton: {
        padding: "6px 12px",
        backgroundColor: "#1a1a1a",
        color: "white",
        border: "1px solid #444",
        borderRadius: "0",
        fontSize: "13px",
        cursor: "pointer",
        zIndex: 25,
        width: "100%",
        textAlign: "left",
        boxSizing: "border-box",
        lineHeight: "1.4",
        userSelect: "none",
        transform: "none"
    },
    buttonTop: {
        borderTopLeftRadius: "6px",
        borderTopRightRadius: "6px",
        borderTop: "1px solid #444",
        borderBottom: "1px solid #444"
    },
    buttonMiddle: {
        borderRadius: 0,
        borderTop: "none",
        borderBottom: "1px solid #444"
    },
    buttonBottom: {
        borderBottomLeftRadius: "6px",
        borderBottomRightRadius: "6px",
        borderTop: "None",
        borderBottom: "1px solid #444"
    },
    onlyButton: {
        borderRadius: "6px",
        border: "1px solid #444"
    },
    iconWrapper: (isVisible) => ({
        width: 22,
        height: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "8px",
        border: "1px solid #555",
        borderRadius: "4px",
        backgroundColor: "#2a2a2a",
        opacity: isVisible ? 1 : 0.6
    }),
    iconImage: {
        width: 16,
        height: 16,
        filter: "invert(1)"
    },
    emptyStateWrapper: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        zIndex: 1
    },
    emptyStateText: {
        color: "#ccc",
        fontSize: "18px",
        fontWeight: "500",
        opacity: 0.8,
        textAlign: "center"
    },
    spinner: {
        width: "24px",
        height: "24px",
        border: "3px solid #666",
        borderTop: "3px solid #fff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "12px"
    },
    emptyStateBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 24px",
        backgroundColor: "#111",
        border: "1px solid #333",
        borderRadius: "8px",
        boxShadow: "0 0 20px rgba(255,255,255,0.05)",
    },
    progressBarWrapper: {
        width: "100%",
        height: "22px",
        backgroundColor: "#222",
        border: "1px solid #444",
        borderRadius: "6px",
        overflow: "hidden",
        marginTop: "12px",
        position: "relative"
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#00ff99",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "width 0.3s ease"
    },
    progressTextInside: {
        color: "#000",
        fontWeight: "bold",
        fontSize: "13px",
        whiteSpace: "nowrap"
    },
    progressTextCentered: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: "13px",
        color: "#fff",
        pointerEvents: "none",
        textShadow: "0 0 2px rgba(0,0,0,0.8)"
    },
    zoomButtonReset: {
        ...zoomBase,
        borderRadius: 0,
        borderTop: "none"
    }
};
