import React, { useEffect, useRef, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import useTooltip from "./useTooltip.jsx";
import {toTitleCase} from "../../utils/textUtils.js";
import {renderNode} from "./artistNodeRenderer.js";
import ArtistPopup from "./artistPopup.jsx";

const MAX_LINKS_PER_ARTIST = 3;



export default function ArtistGraph() {
    const { showTooltip, hideTooltip } = useTooltip();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [genreLabels, setGenreLabels] = useState([]);
    const [hoverNode, setHoverNode] = useState(null);
    const graphRef = useRef(null);
    const canvasRef = useRef(null);
    const [popupData, setPopupData] = useState(null);
    const [allLinks, setAllLinks] = useState([]);

    function openPopupForNode(node) {
        if (!node || node.labelNode) return;

        setPopupData({
            x: 0,
            y: 0,
            name: node.name,
            label: node.genres.join(", "),
            node
        });
    }

    function drawLinks(nodes, links) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 1;

        links.forEach(link => {
            const source = nodes.find(n => n.id === link.source);
            const target = nodes.find(n => n.id === link.target);
            if (!source || !target) {
                console.error("No node with id " + link.id + " found.");
                return;
            }
            ctx.beginPath();
            const screenSource = graphRef.current.graph2ScreenCoords(source.x, source.y);
            const screenTarget = graphRef.current.graph2ScreenCoords(target.x, target.y);
            console.log("Source:", screenSource.x, ",", screenSource.y + "/ Target:" + screenTarget.x, ",", screenTarget.y);
            ctx.strokeStyle = "#FFF";
            ctx.lineWidth = 1;
            ctx.moveTo(screenSource.x, screenSource.y);
            ctx.lineTo(screenTarget.x, screenTarget.y);
            ctx.stroke();
        });
        console.log(links[0]);

    }

    useEffect(() => {
        fetch("http://localhost:3000/api/genres/top?count=10")
            .then(res => res.json())
            .then(setGenreLabels)
            .catch(err => console.error("Failed to load genre labels:", err));
    }, []);


    useEffect(() => {
        if (genreLabels.length === 0) return;

        fetch("http://localhost:3000/api/artists/all")
            .then(res => res.json())
            .then(artists => {
                const artistNodes = artists.map(artist => ({
                    id: artist.id,
                    name: artist.name,
                    radius: Math.pow(artist.popularity / 100, 4.5) * 70 + 5,
                    genres: artist.genres,
                    spotifyUrl: artist.spotifyId
                        ? `https://open.spotify.com/artist/${artist.spotifyId}`
                        : artist.spotifyUrl || "",
                    color: artist.color,
                    x: artist.x,
                    y: artist.y,
                    label: `${artist.name}\nGenre: ${artist.genres.join(", ")}\nPopularity: ${artist.popularity}/100`,
                    labelNode: false
                }));
                //console.log(artistNodes);

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

                const allNodes = [...artistNodes, ...labelNodes];

                const nameToId = new Map();
                artistNodes.forEach(n => nameToId.set(n.name.toLowerCase(), n.id));

                const linkSet = new Set();
                const links = [];

                artists.forEach(artist => {
                    const sourceId = nameToId.get(artist.name.toLowerCase());
                    if (!sourceId) return;

                    let addedLinks = 0;

                    for (const relatedName of artist.relatedArtists) {
                        if (addedLinks >= MAX_LINKS_PER_ARTIST) break;

                        const targetId = nameToId.get(relatedName.toLowerCase());
                        if (!targetId || targetId === sourceId) continue;

                        const key = [sourceId, targetId].sort().join("-");
                        if (!linkSet.has(key)) {
                            linkSet.add(key);
                            links.push({ source: sourceId, target: targetId });
                            addedLinks++;
                        }
                    }
                });


                setGraphData({
                    nodes: [...artistNodes, ...labelNodes],
                    links: []
                });
                setAllLinks(links);

                drawLinks([...artistNodes, ...labelNodes], links);

                setTimeout(() => {
                    if (graphRef.current) {
                        const allNodes = [...artistNodes, ...labelNodes];
                        const avgX = allNodes.reduce((sum, n) => sum + n.x, 0) / allNodes.length;

                        const yValues = allNodes.map(n => n.y);
                        const minY = Math.min(...yValues);
                        const maxY = Math.max(...yValues);
                        const centerY = (minY + maxY) / 2;

                        graphRef.current.centerAt(avgX, centerY, 0);
                        graphRef.current.zoom(0.04, 1000);
                    }
                }, 100);

            })
            .catch(err => console.error("Failed to load artist data:", err));
    }, [genreLabels]);

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

                    // linkColor={(link) =>
                    //     hoverNode &&
                    //     (link.source.id === hoverNode.id || link.target.id === hoverNode.id)
                    //         ? "#00f"
                    //         : "white"
                    // }
                    // linkWidth={(link) =>
                    //     hoverNode &&
                    //     (link.source.id === hoverNode.id || link.target.id === hoverNode.id)
                    //         ? 2.5
                    //         : 0.5
                    // }
                    onNodeHover={(node) => {
                        setHoverNode(node && !node.labelNode ? node : null);
                        if (node) showTooltip(node);
                        else hideTooltip();
                    }}
                    nodePointerAreaPaint={(node, color, ctx) => {
                        const adjustedRadius = node.radius / 1;
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, adjustedRadius, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }}
                    nodeCanvasObject={(node, ctx, globalScale) =>
                        renderNode(node, ctx, globalScale, graphData)

                    }

                    onNodeClick={openPopupForNode}
                    onZoom={() => drawLinks(graphData.nodes, allLinks)}
                    onPan={() => drawLinks(graphData.nodes, allLinks)}
                />
            </div>
        </div>
    );
}
