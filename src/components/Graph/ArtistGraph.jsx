import React, { useEffect, useRef, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import useTooltip from "./useTooltip.jsx";
import wrapText from "./wrapText.jsx";

function toTitleCase(str) {
    return str
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default function ArtistGraph() {
    const { showTooltip, hideTooltip } = useTooltip();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [genreLabels, setGenreLabels] = useState([]);
    const graphRef = useRef(null);

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
                console.log(artistNodes);

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

                //const links = [];

                // artists.forEach(artist => {
                //     const sourceId = nameToId.get(artist.name.toLowerCase());
                //     (artist.relatedArtists).forEach(relatedName => {
                //         const targetId = nameToId.get(relatedName.toLowerCase());
                //         if (sourceId && targetId && sourceId !== targetId) {
                //             links.push({ source: sourceId, target: targetId });
                //         }
                //     });
                // });

                setGraphData({
                    nodes: [...artistNodes, ...labelNodes],
                    links: []
                });

                setTimeout(() => {
                    if (graphRef.current) {
                        const allNodes = [...artistNodes, ...labelNodes];
                        const avgX = allNodes.reduce((sum, n) => sum + n.x, 0) / allNodes.length;

                        const yValues = allNodes.map(n => n.y);
                        const minY = Math.min(...yValues);
                        const maxY = Math.max(...yValues);
                        const centerY = (minY + maxY) / 2;

                        graphRef.current.centerAt(avgX, centerY, 0); // center on X + vertical midpoint
                        graphRef.current.zoom(0.04, 1000);
                    }
                }, 100);

            })
            .catch(err => console.error("Failed to load artist data:", err));
    }, [genreLabels]);

    return (
        <div id="graph-container">
            <div id="tooltip" style={{
                position: "absolute",
                pointerEvents: "none",
                background: "rgba(0,0,0,0.8)",
                color: "white",
                padding: "8px",
                borderRadius: "6px",
                fontSize: "14px",
                display: "none",
                zIndex: 10
            }} />
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    overflow: "hidden",
                    background: "black"
                }}
            >
                <ForceGraph2D
                    ref={graphRef}
                    minZoom={0.04}
                    maxZoom={2.5}
                    graphData={graphData}
                    nodeLabel={() => ""}
                    enableNodeDrag={false}
                    linkColor={() => "white"}
                    linkWidth={() => 1}
                    d3Force={(fg) => {
                        fg.d3Force("link").strength(0);
                    }}
                    onNodeHover={(node) => {
                        if (node) showTooltip(node);
                        else hideTooltip();
                    }}
                    nodePointerAreaPaint={(node, color, ctx) => {
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const labelNodesOnly = graphData.nodes.filter(n => n.labelNode);
                        const counts = labelNodesOnly.map(n => n.count || 0);
                        const maxCount = Math.max(...counts);
                        const minCount = Math.min(...counts);
                        const label = node.name;

                        // Genre label rendering
                        if (node.labelNode) {
                            let fadeStart = 0.2;
                            let fadeEnd = 0.4;

                            if (globalScale > fadeEnd) return;

                            let alpha = 1;
                            if (globalScale > fadeStart) {
                                alpha = Math.max(0, 1 - (globalScale - fadeStart) / (fadeEnd - fadeStart));
                            }

                            const maxFontSize = 600;
                            const minFontSize = maxFontSize * 0.4;

                            const popularityScale = maxCount !== minCount
                                ? (node.count - minCount) / (maxCount - minCount)
                                : 1;

                            const fontSize = minFontSize + (maxFontSize - minFontSize) * popularityScale;

                            ctx.save();
                            ctx.globalAlpha = alpha;
                            ctx.font = `${fontSize}px Sans-Serif`;
                            ctx.fillStyle = "#fff";
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            ctx.strokeStyle = "#000";
                            ctx.lineWidth = 3;

                            ctx.strokeText(label, node.x, node.y);
                            ctx.fillText(label, node.x, node.y);
                            ctx.restore();
                            return;
                        }

                        // Artist node rendering
                        const radius = node.radius;
                        const fontSize = Math.max(5, radius / 3);
                        const maxTextWidth = radius * 1.5;

                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.textAlign = "center";
                        ctx.textBaseline = "alphabetic";

                        // Border
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, radius + 1, 0, 2 * Math.PI);
                        ctx.fillStyle = "#FFF";
                        ctx.fill();

                        // Node fill
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                        ctx.fillStyle = node.color || "#FFF";
                        ctx.fill();

                        // Only show artist name if zoomed in enough
                        if (globalScale > 1.1 / (radius / 13)) {
                            ctx.fillStyle = "#000";

                            const lines = wrapText(ctx, label, maxTextWidth);
                            const lineHeight = fontSize * 1.15;
                            const totalHeight = lines.length * lineHeight;
                            const startY = node.y - totalHeight / 2 + lineHeight * 0.8;

                            lines.forEach((line, i) => {
                                ctx.fillText(line, node.x, startY + i * lineHeight);
                            });
                        }
                    }}

                    onNodeClick={(node) =>
                        node.spotifyUrl && window.open(node.spotifyUrl, "_blank")
                    }
                />
            </div>
        </div>
    );
}
