import React, { useEffect, useState } from "react";
import { getBaseUrl } from "../../utils/apiBase.js";

export default function ArtistSidebar({ selectedNode, allGenres }) {
    const [expandedData, setExpandedData] = useState(null);
    const baseUrl = getBaseUrl();

    useEffect(() => {
        if (!selectedNode || selectedNode.labelNode) return;

        const fetchExpanded = async () => {
            try {
                const res = await fetch(
                    `${baseUrl}/api/artists/${selectedNode.spotifyId}/expanded?name=${encodeURIComponent(selectedNode.name)}&mbid=${selectedNode.lastfmMBID}&market=us`
                );
                const data = await res.json();
                setExpandedData(data);
            } catch (err) {
                console.error("Failed to fetch expanded artist info:", err);
            }
        };

        fetchExpanded();
    }, [selectedNode]);

    if (!selectedNode || selectedNode.labelNode) {
        console.error(`Trying to render artist data but no valid artist is selected!`);
        return null;
    }

    const getGenreColor = (genreName) => {
        const match = allGenres.find(g => g.genre === genreName);
        return match?.color || "#555";
    };

    return (
        <div style={sidebarStyles.container}>
            {selectedNode.imageUrl && (
                <img
                    src={selectedNode.imageUrl}
                    alt={selectedNode.name}
                    style={sidebarStyles.image}
                />
            )}

            <div style={sidebarStyles.nameRow}>
                {selectedNode.spotifyUrl ? (
                    <a
                        href={selectedNode.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...sidebarStyles.name, textDecoration: "none" }}
                        title="Open on Spotify"
                    >
                        {selectedNode.name}
                    </a>
                ) : (
                    <span style={sidebarStyles.name}>{selectedNode.name}</span>
                )}

                {selectedNode.spotifyUrl && (
                    <a
                        href={selectedNode.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={sidebarStyles.spotifyLink}
                        title="Open on Spotify"
                    >
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
                            alt="Spotify"
                            style={sidebarStyles.spotifyIcon}
                        />
                    </a>
                )}
            </div>

            <div style={sidebarStyles.genreBoxContainer}>
                {selectedNode.genres.map((genre, i) => (
                    <span
                        key={i}
                        style={{
                            ...sidebarStyles.genreBox,
                            backgroundColor: getGenreColor(genre)
                        }}
                    >
                        {genre}
                    </span>
                ))}
            </div>

            {/* Expanded Data Section */}
            {expandedData ? (
                <div style={sidebarStyles.expanded}>
                    {expandedData.topTracks?.length > 0 && (
                        <div>
                            <div style={sidebarStyles.sectionTitle}>Top Tracks</div>
                            <ul style={sidebarStyles.itemList}>
                                {expandedData.topTracks.slice(0, 5).map(track => (
                                    <li key={track.id}>{track.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {expandedData.recentReleases?.length > 0 && (
                        <div style={{ marginTop: "12px" }}>
                            <div style={sidebarStyles.sectionTitle}>Recent Releases</div>
                            <ul style={sidebarStyles.itemList}>
                                {expandedData.recentReleases.slice(0, 3).map(rel => (
                                    <li key={rel.id}>{rel.name} ({rel.release_date})</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {expandedData.bio?.content && (
                        <div style={{ marginTop: "12px" }}>
                            <div style={sidebarStyles.sectionTitle}>About</div>
                            <div
                                style={{ fontSize: "13px", opacity: 0.85 }}
                                dangerouslySetInnerHTML={{ __html: expandedData.bio.content.split(/<a[^>]*>Read more on Last\.fm<\/a>/)[0].trim() }}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ marginTop: "12px", fontSize: "13px", opacity: 0.6 }}>
                    Loading more info...
                </div>
            )}
        </div>
    );
}

const sidebarStyles = {
    container: {
        position: "absolute",
        top: 0,
        right: 0,
        width: "300px",
        height: "100%",
        backgroundColor: "#1a1a1a",
        color: "#fff",
        borderLeft: "1px solid #333",
        zIndex: 30,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        overflowY: "auto",
    },
    image: {
        width: "100%",
        height: "auto",
        borderRadius: "8px",
        objectFit: "cover",
        marginBottom: "12px",
        border: "1px solid #333"
    },
    nameRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        marginBottom: "6px"
    },
    name: {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },
    spotifyLink: {
        display: "inline-flex",
        alignItems: "center",
    },
    spotifyIcon: {
        height: "18px",
        width: "18px",
        marginTop: "1px"
    },
    genreBoxContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        justifyContent: "center",
        marginTop: "4px",
        marginBottom: "10px"
    },
    genreBox: {
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "500",
        color: "#000",
        backgroundColor: "#888"
    },
    expanded: {
        width: "100%",
        fontSize: "14px",
        marginTop: "6px"
    },
    sectionTitle: {
        fontWeight: "bold",
        fontSize: "15px",
        marginBottom: "4px"
    },
    itemList: {
        paddingLeft: "16px",
        marginTop: "4px",
        lineHeight: "1.5"
    }
};
