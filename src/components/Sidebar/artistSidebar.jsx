import React, { useEffect, useRef, useState } from "react";
import GenreTags from "./Components/genreTags.jsx";
import TopTracks from "./Components/topTracks.jsx";
import RecentReleases from "./Components/recentReleases.jsx";
import BioSection from "./Components/bioSection.jsx";
import {fetchExpandedArtistData} from "../../utils/dataFetcher.js";
import RelatedArtists from "./Components/relatedArtists.jsx";


export default function ArtistSidebar({ selectedNode, setSelectedNode, allUsedGenres, handleResultClick, user, userTopRanks, globalRanks }) {
    const [expandedData, setExpandedData] = useState(null);

    const releaseScrollRef = useRef(null);

    useEffect(() => {
        setExpandedData(null);
        if (releaseScrollRef.current) {
            releaseScrollRef.current.scrollTo({ left: 0 });
        }

        if (!selectedNode || selectedNode.labelNode) return;

        const loadExpanded = async () => {
            const data = await fetchExpandedArtistData(
                selectedNode.spotifyId,
                selectedNode.name,
                selectedNode.lastfmMBID
            );
            console.log(selectedNode);
            if (data) setExpandedData(data);
        };

        loadExpanded();
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
            <div style={styles.rankBadge}>
                {globalRanks?.has(selectedNode.id) && (
                    <div style={(user && userTopRanks?.has(selectedNode.id) ? styles.rankLine : styles.rankLineLast)}>
                        Global: #{globalRanks.get(selectedNode.id) + 1}
                    </div>
                )}
                {user && userTopRanks?.has(selectedNode.id) && (
                    <div style={(globalRanks?.has(selectedNode.id) ? styles.rankLineLast : styles.rankLine)}>
                        Personal: #{userTopRanks.get(selectedNode.id) + 1}
                    </div>
                )}
            </div>


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

                {expandedData ? (
                    <div style={styles.expanded}>

                        {/* Top Tracks Section */}
                        <div style={styles.sectionBlock}>
                            <div style={styles.sectionTitle}>Top Tracks</div>
                            <TopTracks tracks={expandedData.topTracks} />
                        </div>

                        {/* Recent Releases Section */}
                        <div style={styles.sectionBlock}>
                            <div style={styles.sectionTitle}>Recent Releases</div>
                            <RecentReleases releases={expandedData.recentReleases} scrollRef={releaseScrollRef} />
                        </div>

                        {/* Related Artists Section */}
                        {selectedNode.relatedNodes?.length > 0 && (
                            <div style={styles.sectionBlock}>
                                <div style={styles.sectionTitle}>Related Artists</div>
                                <RelatedArtists related={selectedNode.relatedNodes} handleResultClick={handleResultClick} />
                            </div>
                        )}

                        {/* About Section */}
                        {cleanedContent && cleanedContent.length > 0 && (
                            <div style={styles.sectionBlock}>
                                <div style={styles.sectionTitle}>About</div>
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
        overflowY: "scroll",
        scrollbarWidth: "none",
        msOverflowStyle: "none"
    },
    sectionTitle: {
        fontWeight: "bold",
        textAlign: "center",
        fontSize: "15px",
        marginBottom: "6px"
    },
    content: {
        padding: "0px 16px 45px 16px",
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
        marginBottom: "30px",
        paddingTop: "14px",
        borderTop: "1px solid #777",
        marginLeft: "-16px",
        marginRight: "-16px",
        paddingLeft: "16px",
        paddingRight: "16px"
    },
    closeButton: {
        position: "fixed",
        top: "62px",
        right: "262px",
        background: "#fff",
        opacity: "0.75",
        color: "#000",
        border: "none",
        borderRadius: "4px",
        padding: "2px 6px",
        fontSize: "14px",
        cursor: "pointer",
        zIndex: 999
    },
    rankBadge: {
        position: "absolute",
        top: "10px",
        right: "10px",
        display: "flex",
        flexDirection: "column",
        width: "fit-content",
        backgroundColor: "#1a1a1a",
        opacity: "0.6",
        border: "1px solid #444",
        borderRadius: "6px",
        overflow: "hidden",
        fontSize: "13px",
        zIndex: 40
    },
    rankLine: {
        padding: "4px 6px",
        color: "white",
        textAlign: "center",
        borderBottom: "1px solid #444"
    },
    rankLineLast: {
        padding: "4px 6px",
        color: "white",
        textAlign: "left"
    }
};