import React, { useEffect, useRef, useState } from "react";
import { getBackendUrl } from "../../utils/apiBase.js";
import GenreTags from "./genreTags.jsx";
import TopTracks from "./topTracks.jsx";
import RecentReleases from "./recentReleases.jsx";
import BioSection from "./bioSection.jsx";
import { addArtistToCustomGraph } from "../../utils/dataFetcher.js";
import {addUserTagToTop1000Node, getTop1000Cache, refreshTop1000Cache} from "../../cache/top1000.js";

export default function ArtistSidebar({ selectedNode, setSelectedNode, allUsedGenres, user }) {
    const [expandedData, setExpandedData] = useState(null);
    const baseUrl = getBackendUrl();
    const userId = user?.id;
    const [isAddingArtist, setIsAddingArtist] = useState(false);
    const addArtistToCustomGraphVar = async () => {
        setIsAddingArtist(true);
        const addArtistJson = await addArtistToCustomGraph(selectedNode, userId);
        setIsAddingArtist(false);

        const updatedNode = addArtistJson?.data?.artistNode || selectedNode.appendUserTag(user.id);

        if (updatedNode) {
            addUserTagToTop1000Node(selectedNode.spotifyId, user.id)
            setSelectedNode(updatedNode);
        }
    };
    const removeArtistFromCustomGraphVar = async () => {

    };

    const releaseScrollRef = useRef(null);

    useEffect(() => {
        setExpandedData(null);
        if (releaseScrollRef.current) {
            releaseScrollRef.current.scrollTo({ left: 0 });
        }

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
        return null;
    }

    const getGenreColor = (genreName) => {
        const match = allUsedGenres.find(g => g.name === genreName);
        return match?.color || "#555";
    };

    const cleanedContent = expandedData?.bio?.content
        ?.split("Read more on Last.fm")[0]
        ?.replace(/\[\d+\]/g, "")
        ?.trim()
        ?.replace(/\n\n/g, "<br /><br />");

    const date = new Date(selectedNode.lastUpdated);
    const lastUpdatedTime = date.toLocaleTimeString();
    const lastUpdatedDate = date.toLocaleDateString();

    return (
        <div style={styles.container}>
            <button onClick={() => setSelectedNode(null)} style={styles.closeButton}>
                ×
            </button>
            {selectedNode.imageUrl && (
                <div style={styles.imageWrapper}>
                    <img
                        src={selectedNode.imageUrl}
                        alt={selectedNode.name}
                        style={styles.image}
                    />
                    <div style={styles.imageFade} />
                </div>
            )}

            <div style={styles.content}>

                <div style={styles.nameRow}>
                    {selectedNode.spotifyUrl ? (
                        <a
                            href={selectedNode.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ ...styles.name, textDecoration: "none" }}
                            title="Open on Spotify"
                        >
                            {selectedNode.name}
                        </a>
                    ) : (
                        <span style={styles.name}>{selectedNode.name}</span>
                    )}

                    {selectedNode.spotifyUrl && (
                        <a
                            href={selectedNode.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.spotifyLink}
                            title="Open on Spotify"
                        >
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
                                alt="Spotify"
                                style={styles.spotifyIcon}
                            />
                        </a>
                    )}
                </div>

                <GenreTags genres={selectedNode.genres} getGenreColor={getGenreColor} />

                {userId && (
                    isAddingArtist ? (
                        <div style={buttonStyles.adding}>
                            Adding artist...
                        </div>
                    ) : (
                        <button
                            onClick={
                                selectedNode.userTags?.includes(userId)
                                    ? removeArtistFromCustomGraphVar
                                    : addArtistToCustomGraphVar
                            }
                            style={
                                selectedNode.userTags?.includes(userId)
                                    ? buttonStyles.remove
                                    : buttonStyles.add
                            }
                        >
                            {selectedNode.userTags?.includes(userId) ? "Remove" : "Add"}
                        </button>
                    )
                )}


                {expandedData ? (
                    <div style={styles.expanded}>
                        <div style={styles.sectionBlock}>
                            <TopTracks tracks={expandedData.topTracks} />
                        </div>
                        <div style={styles.sectionBlock}>
                            <RecentReleases releases={expandedData.recentReleases} scrollRef={releaseScrollRef} />
                        </div>
                        {cleanedContent && cleanedContent.length > 0 && (
                            <div style={styles.sectionBlock}>
                                <BioSection html={cleanedContent} />
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ marginTop: "12px", fontSize: "13px", opacity: 0.6 }}>
                        Loading artist data...
                    </div>
                )}

                {/* Last updated text */}
                {selectedNode.lastUpdated && (
                    <div style={{ padding: "0 16px 12px", fontSize: "11px", color: "#888", textAlign: "center" }}>
                        Last updated: {lastUpdatedDate} at {lastUpdatedTime}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
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

        // Hide the scrollbar
        overflowY: "scroll",
        scrollbarWidth: "none",
        msOverflowStyle: "none"
    },
    content: {
        padding: "0px 16px 16px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
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
    expanded: {
        width: "100%",
        fontSize: "14px",
        marginTop: "6px"
    },
    imageWrapper: {
        position: "relative",
        width: "100%",
        height: "300px",
        marginBottom: "12px",
        overflow: "hidden"
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block"
    },
    imageFade: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "80px",
        background: "linear-gradient(to top, #1a1a1a, transparent)"
    },
    sectionBlock: {
        marginBottom: "30px"
    },
    closeButton: {
        position: "absolute",
        top: "10px",
        left: "10px",
        background: "#fff",
        opacity: "0.75",
        color: "#000",
        border: "none",
        borderRadius: "4px",
        padding: "2px 6px",
        fontSize: "14px",
        cursor: "pointer",
        zIndex: 40
    }
};

const baseButtonStyle = {
    marginTop: "6px",
    marginBottom: "8px",
    fontSize: "13px",
    border: "1px solid #555",
    padding: "6px 10px",
    borderRadius: "4px",
    textAlign: "center"
};

const buttonStyles = {
    add: {
        ...baseButtonStyle,
        backgroundColor: "#2a2a2a",
        color: "#fff",
        cursor: "pointer"
    },
    remove: {
        ...baseButtonStyle,
        backgroundColor: "#502a2a",
        color: "#fff",
        cursor: "pointer"
    },
    adding: {
        ...baseButtonStyle,
        backgroundColor: "#444",
        color: "#ccc"
    }
};