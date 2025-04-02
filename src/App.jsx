import React, { useState, useEffect } from "react";
import { ForceGraph2D } from "react-force-graph";
import generateArtistId from './utils.jsx';

// Mock import of artist and connection data
import artistsData from './data/artistsData';
import connectionsData from './data/connectionsData';


const App = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });

    useEffect(() => {
        const artistsMap = new Map();

        // Process artist data into nodes
        const nodes = artistsData.map((artist) => {
            const artistId = generateArtistId(artist.name);
            artistsMap.set(artistId, artist);
            return {
                id: artistId,
                name: artist.name,
                genre: artist.genre,
                popularity: artist.popularity,
                spotify_url: artist.spotify_url,
                size: artist.popularity / 10,
                color: artist.genre === "Rock" ? "red" : artist.genre === "Pop" ? "blue" : "green",
                position: artist.position,
            };
        });

        // Process connection data into links
        const links = connectionsData.map((connection) => ({
            source: artistsMap.get(generateArtistId(connection.source)),
            target: artistsMap.get(generateArtistId(connection.target)),
            weight: connection.weight || 2, // Default weight if not provided
            relationship: connection.relationship,
        }));

        setGraphData({ nodes, links });
    }, []);

    return (
        <div
            id="graph-container"
            style={{
                width: "100vw",
                height: "100vh",
                overflow: "hidden", // Prevent scrolling
                position: "fixed", // Locks it to the viewport
                top: 0,
                left: 0,
            }}
        >
            <ForceGraph2D
                graphData={graphData}
                nodeAutoColorBy="group"
                nodeLabel="name"
                enableNodeDrag={false} // Disable dragging
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const radius = node.size || 8;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color || "gray";
                    ctx.fill();
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 0.5;
                    ctx.stroke();

                    const label = node.name;
                    const fontSize = globalScale > 2 ? 4 : 0;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.fillStyle = "black";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(label, node.x, node.y);
                }}
                linkCanvasObject={(link, ctx) => {
                    const start = link.source;
                    const end = link.target;

                    if (!start || !end) return;

                    const thickness = link.weight || 2;

                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
                    ctx.lineWidth = thickness;
                    ctx.stroke();
                }}
            />
        </div>
    );
};

export default App;