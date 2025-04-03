import React from "react";
import { ForceGraph2D } from "react-force-graph";
import artists from "./data/artistData.jsx";

// Dummy links (in a real case, you'd generate based on similarity)
const links = [
    { source: "1", target: "2" },
    { source: "2", target: "4" },
    { source: "3", target: "5" },
    { source: "6", target: "4" },
    { source: "7", target: "5" },
    { source: "8", target: "7" },
    { source: "9", target: "10" },
    { source: "10", target: "3" },
    { source: "2", target: "10" }
];

const graphData = {
    nodes: artists.map(artist => ({
        id: artist.id,
        name: artist.name,
        pop: artist.popularity / 10,
        genres: artist.genres,
        spotifyUrl: artist.spotifyUrl,
        color: artist.color
    })),
    links
};

export default function ArtistGraph() {
    return (
        <div id="graph-container">
            <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'black' }}>
                <ForceGraph2D
                    graphData={graphData}
                    nodeLabel={node => `{${node.id}} ${node.name} (${node.genres.join(", ")})`}
                    nodePointerAreaPaint={(node, color, ctx) => {
                        const radius = node.pop * 2;
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }}
                    enableNodeDrag={false}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.name;
                        const fontSize = 5 * (node.pop / 10);
                        ctx.font = `${fontSize}px Sans-Serif`;

                        // Draw border circle
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, node.pop * 2 + 1, 0, 2 * Math.PI, false);
                        ctx.fillStyle = "#FFF"; // border color
                        ctx.fill();

                        // Draw node with custom color
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, node.pop * 2, 0, 2 * Math.PI, false);
                        ctx.fillStyle = node.color || "#FFF";
                        ctx.fill();

                        // Only draw text if zoomed in close enough
                        if (globalScale > 1.5) {
                            ctx.fillStyle = "#000";
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            ctx.fillText(label, node.x, node.y);
                        }
                    }}
                    onNodeClick={node => window.open(node.spotifyUrl, '_blank')}
                />
            </div>
        </div>
    );
}