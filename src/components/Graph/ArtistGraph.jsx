import React, { useEffect, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import useTooltip from "./useTooltip.jsx";
import wrapText from "./wrapText.jsx";

export default function ArtistGraph() {
    const { showTooltip, hideTooltip } = useTooltip();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });

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
                    label: `${artist.name}\nGenre: ${artist.genres.join(", ")}\nPopularity: ${artist.popularity}/100`
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
                        fg.d3Force("link").strength(0); // <== make links visually show but not pull
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
