import React, { useEffect, useRef, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import useTooltip from "./useTooltip.jsx";
import {toTitleCase} from "../../utils/textUtils.js";
import {renderNode} from "./artistNodeRenderer.js";
import ArtistPopup from "./artistPopup.jsx";



export default function ArtistGraph() {
    const { showTooltip, hideTooltip } = useTooltip();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [genreLabels, setGenreLabels] = useState([]);
    const graphRef = useRef(null);
    const [popupData, setPopupData] = useState(null);

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

                const links = [];
                const nameToId = new Map();
                artistNodes.forEach(n => nameToId.set(n.name.toLowerCase(), n.id));

                const linkSet = new Set();

                artists.forEach(artist => {
                    const sourceId = nameToId.get(artist.name.toLowerCase());
                    (artist.relatedArtists).forEach(relatedName => {
                        const targetId = nameToId.get(relatedName.toLowerCase());
                        if (sourceId && targetId && sourceId !== targetId) {
                            const key = [sourceId, targetId].sort().join("-");
                            if (!linkSet.has(key)) {
                                linkSet.add(key);
                                links.push({ source: sourceId, target: targetId });
                            }
                        }
                    });
                });

                setGraphData({
                    nodes: [...artistNodes, ...labelNodes],
                    links: links
                });

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
                        const zoom = graphRef.current ? graphRef.current.zoom() : 1;
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
                />
            </div>
        </div>
    );
}
