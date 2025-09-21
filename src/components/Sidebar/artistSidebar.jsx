import React, {useEffect, useMemo, useRef, useState} from "react";
import GenreTags from "./Components/genreTags.jsx";
import TopTracks from "./Components/topTracks.jsx";
import RecentReleases from "./Components/recentReleases.jsx";
import BioSection from "./Components/bioSection.jsx";
import {fetchExpandedArtistData} from "../../utils/dataFetcher.js";
import RelatedArtists from "./Components/relatedArtists.jsx";
import "./artistSidebar.css";


export default function ArtistSidebar({ selectedNode, setSelectedNode, setIsOpen, allUsedGenres, handleResultClick, user, userTopRanks, globalRanks }) {
    const userRank = useMemo(() => (
        selectedNode && userTopRanks?.has(selectedNode.spotifyId)
            ? userTopRanks.get(selectedNode.spotifyId)
            : null
    ), [selectedNode, userTopRanks]);

    const globalRank = useMemo(() => (
        selectedNode && globalRanks?.has(selectedNode.spotifyId)
            ? globalRanks.get(selectedNode.spotifyId)
            : null
    ), [selectedNode, globalRanks]);
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
            //console.log(selectedNode);
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
        <div className="artist-sidebar">
            <button
                onClick={() => {
                    setSelectedNode(null);
                    if (window.innerWidth < 768 && setIsOpen) {
                        setIsOpen(false); // also collapse the sidebar overlay
                    }
                }}
                className="close-button"
            >
                ×
            </button>
            {(userRank !== null || globalRank !== null) && (
                <div className="rank-badge">
                    {globalRank !== null && (
                        <div className={userRank !== null ? "rank-line" : "rank-line-last"}>
                            Global: #{globalRank + 1}
                        </div>
                    )}
                    {userRank !== null && (
                        <div style={globalRank !== null ? "rank-line-last" : "rank-line"}>
                            Personal: #{userRank + 1}
                        </div>
                    )}
                </div>
            )}


            {selectedNode.imageUrl && (
                <div className="image-wrapper">
                    <img
                        src={selectedNode.imageUrl}
                        alt={selectedNode.name}
                        className="image"
                    />
                    <div className="image-fade" />
                </div>
            )}

            <div className="content">

                <div className="name-row">
                    {selectedNode.spotifyUrl ? (
                        <a
                            href={selectedNode.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="name name-link"
                            title="Open on Spotify"
                        >
                            {selectedNode.name}
                        </a>
                    ) : (
                        <span className="name">{selectedNode.name}</span>
                    )}

                    {selectedNode.spotifyUrl && (
                        <a
                            href={selectedNode.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="spotify-link"
                            title="Open on Spotify"
                        >
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
                                alt="Spotify"
                                className="spotify-icon"
                            />
                        </a>
                    )}
                </div>

                <GenreTags genres={selectedNode.genres} getGenreColor={getGenreColor} />

                {expandedData ? (
                    <div className="expanded">

                        {/* Top Tracks Section */}
                        <div className="section-block">
                            <div className="section-title">Popular Tracks</div>
                            <TopTracks tracks={expandedData.topTracks} />
                        </div>

                        {/* Recent Releases Section */}
                        <div className="section-block">
                            <div className="section-title">Recent Releases</div>
                            <RecentReleases releases={expandedData.recentReleases} scrollRef={releaseScrollRef} />
                        </div>

                        {/* Related Artists Section */}
                        {selectedNode.relatedNodes?.length > 0 && (
                            <div className="section-block">
                                <div className="section-title">Related Artists</div>
                                <RelatedArtists related={selectedNode.relatedNodes} handleResultClick={handleResultClick} />
                            </div>
                        )}
                        {/* TODO: Add loading screen to sidebar between clicking related artists on mobile (So it doesn't show the orignal sidebar while switching */}

                        {/* About Section */}
                        {cleanedContent && cleanedContent.length > 0 && (
                            <div className="section-block">
                                <div className="section-title">About</div>
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