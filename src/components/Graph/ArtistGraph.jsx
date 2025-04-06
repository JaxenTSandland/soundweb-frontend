import React, { useEffect, useState } from "react";
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

    useEffect(() => {
        fetch("http://localhost:3000/api/genres/top")
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

                const labelNodes = genreLabels.map((genre, i) => ({
                    id: `genre-${i}`,
                    name: toTitleCase(genre.name),
                    x: genre.x,
                    y: genre.y,
                    radius: 1,
                    color: "transparent",
                    labelNode: true
                }));

                const allNodes = [...artistNodes, ...labelNodes];
                setGraphData({ nodes: allNodes, links: [] });
            })
            .catch(err => console.error("Failed to load artist data:", err));
    }, [genreLabels]);


    useEffect(() => {
        fetch("http://localhost:3000/api/artists/all")
            .then(res => res.json())
            .then(artists => {
                const nodes = artists.map(artist => ({
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
                }));

                const nameToId = new Map();
                nodes.forEach(n => nameToId.set(n.name.toLowerCase(), n.id));

                const links = [];

                // artists.forEach(artist => {
                //     const sourceId = nameToId.get(artist.name.toLowerCase());
                //     (artist.relatedArtists).forEach(relatedName => {
                //         const targetId = nameToId.get(relatedName.toLowerCase());
                //         if (sourceId && targetId && sourceId !== targetId) {
                //             links.push({ source: sourceId, target: targetId });
                //         }
                //     });
                // });

                setGraphData({ nodes, links });

            })
            .catch(err => console.error("Failed to load artist data:", err));
    }, []);

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
                    minZoom={0.03}
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

                            ctx.save();
                            ctx.globalAlpha = alpha;
                            const fontSize = 500;
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
