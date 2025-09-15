import React, {useEffect, useState} from "react";
import ArtistSidebar from "./artistSidebar.jsx";
import {toTitleCase} from "../../utils/textUtils.js";

export default function Sidebar({
                                        selectedNode,
                                        setSelectedNode,
                                        allTopGenres,
                                        allUsedGenres,
                                        toggleGenre,
                                        setAllGenres,
                                        sortMethod,
                                        cycleSortMethod,
                                        searchTerm,
                                        setSearchTerm,
                                        filteredResults,
                                        isSearchFocused,
                                        setIsSearchFocused,
                                        handleResultClick,
                                        mode,
                                        reloadGraph,
                                        artistNodes,
                                        userTopRanks,
                                        globalRanks,
                                        shouldFadeNode,
                                        isSidebarOpen,
                                        setIsSidebarOpen,
                                     }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const sortedGenres = [...allTopGenres].sort((a, b) =>
        sortMethod === "alphabetical" ? a.name.localeCompare(b.name) : b.count - a.count
    );

    const rankedNodes = Array.from(
        new Map(
            artistNodes
                .filter(n => !n.labelNode)
                .map(n => [n.id, n]) // de-duplicate by ID
        ).values()
    ).sort((a, b) => {
        if (mode === "UserTop") {
            const rankA = userTopRanks?.get?.(a.id);
            const rankB = userTopRanks?.get?.(b.id);
            const aValid = typeof rankA === "number";
            const bValid = typeof rankB === "number";

            if (aValid && bValid) return rankA - rankB;
            if (aValid) return -1;
            if (bValid) return 1;
            return 0;
        }
        return b.popularity - a.popularity;
    });

    return (
        <>
            {/* Toggle button visible only on mobile */}
            <div
                style={{
                    ...styles.container,
                    ...(isMobile
                        ? {
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            transform: isSidebarOpen ? "translateX(0)" : "translateX(100%)",
                        }
                        : {}),
                }}
            >
                {isMobile && (
                    <button onClick={() => setIsSidebarOpen(false)} style={styles.closeButton}>
                        ×
                    </button>
                )}
                {isMobile && (
                    <button onClick={() => setIsSidebarOpen(false)} style={styles.closeButton}>
                        ×
                    </button>
                )}
                {selectedNode ? (
                    <ArtistSidebar
                        selectedNode={selectedNode}
                        setSelectedNode={setSelectedNode}
                        setIsOpen={setIsSidebarOpen}
                        handleResultClick={handleResultClick}
                        allUsedGenres={allUsedGenres}
                        reloadGraph={reloadGraph}
                        userTopRanks={userTopRanks}
                        globalRanks={globalRanks}
                    />
                ) : (
                    <>
                        {/* Top: Search section */}
                        <div style={styles.searchSection}>
                            <div style={styles.searchBarRow}>
                                <button onClick={() => setIsSidebarOpen(false)} style={styles.inlineCloseButton}>
                                    ×
                                </button>
                                <input
                                    type="text"
                                    placeholder="Find artist in graph..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 100)}
                                    style={styles.searchInput}
                                />
                            </div>

                            {searchTerm && isSearchFocused && filteredResults.length > 0 && (
                                <div style={styles.searchResults}>
                                    {filteredResults.map((node) => (
                                        <div
                                            key={node.id}
                                            onClick={() => handleResultClick(node)}
                                            style={styles.resultItem}
                                        >
                                            {node.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                            {(mode === "Top1000" || mode === "UserTop") && (
                                <div style={styles.popularArtistSection}>
                                    <div style={styles.popularArtistHeader}>Top Ranked Artists</div>

                                    <div className="popularArtistList" style={styles.popularArtistList}>
                                        {rankedNodes.map((node, index) => {
                                            const faded = shouldFadeNode(node);
                                            const userRank = userTopRanks?.get?.(node.id);

                                            const displayRank =
                                                mode === "UserTop"
                                                    ? (typeof userRank === "number" ? `${userRank + 1}. ` : "")
                                                    : `${index + 1}. `;

                                            return (
                                                <div
                                                    key={`SidebarRankItem:${node.id}`}
                                                    onClick={faded ? undefined : () => handleResultClick(node)}
                                                    style={{
                                                        ...styles.popularArtistItem,
                                                        color: faded ? "#666" : "#EEE",
                                                        cursor: faded ? "default" : "pointer",
                                                        transition: "background 0.2s"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!faded) e.currentTarget.style.background = "#222";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!faded) e.currentTarget.style.background = "transparent";
                                                    }}
                                                >
                                                    {displayRank}{node.name}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        {/* Bottom: Genre section */}
                        <div className="genreSection" style={styles.genreSection}>
                            <div style={styles.genreHeader}>
                                <span style={styles.genreTitle}>Filter by Genre</span>
                                <button onClick={cycleSortMethod} style={styles.button}>
                                    Sort: {sortMethod === "alphabetical" ? "A–Z" : "Popularity"}
                                </button>
                            </div>

                            <div style={styles.genreControls}>
                                <button
                                    onClick={() => {
                                        const onCount = allTopGenres.filter(g => g.toggled).length;
                                        const selectAll = onCount / allTopGenres.length <= 0.5;
                                        setAllGenres(allTopGenres.map(g => ({ ...g, toggled: selectAll })));
                                    }}
                                    style={styles.button}
                                >
                                    {allTopGenres.filter(g => g.toggled).length / allTopGenres.length > 0.5
                                        ? "Deselect all"
                                        : "Select all"}
                                </button>
                            </div>

                            <div className={"genreList"} style={styles.genreList}>
                                {sortedGenres.map(({ name, count, toggled }) => (
                                    <label key={name} style={styles.genreItem}>
                                        <input
                                            type="checkbox"
                                            checked={toggled}
                                            onChange={() => toggleGenre(name)}
                                        />
                                        <span>{toTitleCase(name)} ({count})</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );

}

const styles = {
    container: {
        position: "absolute",
        top: 0,
        right: 0,
        width: "300px",
        height: "100vh",
        background: "#1a1a1a",
        color: "white",
        padding: "12px",
        borderLeft: "1px solid #333",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        transition: "transform 0.3s ease-in-out",
    },
    searchResults: {
        position: "absolute",
        top: "20px",
        left: "0",
        right: "0",
        paddingTop: "10px",
        background: "#222",
        border: "1px solid #444",
        borderTop: "none",
        borderBottomLeftRadius: "6px",
        borderBottomRightRadius: "6px",
        overflowY: "auto",
        maxHeight: "300px",
        zIndex: 998,
        boxShadow: "0 4px 6px rgba(0,0,0,0.5)"
    },
    resultItem: {
        padding: "6px 10px",
        cursor: "pointer",
        borderBottom: "1px solid #333"
    },
    genreControls: {
        display: "flex",
        gap: "8px",
        marginBottom: "8px"
    },
    button: {
        fontSize: "12px",
        padding: "4px 8px",
        background: "#333",
        color: "white",
        border: "1px solid #555",
        borderRadius: "4px",
        cursor: "pointer",
        marginLeft: "2px",
        marginRight: "2px",
        flex: 1
    },
    toggleButton: {
        position: "fixed",
        top: "12px",
        left: "12px",
        zIndex: 1100,
        background: "#333",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: "4px",
        cursor: "pointer",
    },
    closeButton: {
        position: "absolute",
        top: "12px",
        right: "12px",
        background: "transparent",
        border: "none",
        color: "white",
        fontSize: "24px",
        cursor: "pointer",
    },
    searchSection: {
        flex: "0 0 auto",
        position: "relative",
        marginBottom: "12px",
        display: "flex",
        flexDirection: "column",
        zIndex: 10
    },
    genreSection: {
        flex: "1 1 30%",
        paddingTop: "10px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
    },
    genreList: {
        overflowY: "auto",
        flex: 1,
        maxHeight: "76.5%",
        paddingRight: "6px",
    },
    genreItem: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "6px"
    },
    genreHeader: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "6px",
        marginBottom: "8px",
        textAlign: "center"
    },
    genreTitle: {
        fontWeight: "bold",
        fontSize: "16px"
    },
    popularArtistSection: {
        flex: "0 0 35%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#1a1a1a"
    },
    popularArtistHeader: {
        fontWeight: "bold",
        fontSize: "14px",
        paddingBottom: "6px",
        textAlign: "center",
        borderBottom: "1px solid #444",
        marginBottom: "6px"
    },
    popularArtistList: {
        flex: 1,
        overflowY: "auto",
        padding: "0 6px 6px 6px",
        background: "#111",
        borderRadius: "6px",
        border: "1px solid #333"
    },
    popularArtistItem: {
        fontSize: "13px",
        padding: "6px 4px",
        borderBottom: "1px solid #222",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    searchBarRow: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginBottom: "8px",
    },
    searchInput: {
        flex: 1,
        padding: "4px 8px",
        fontSize: "13px",
        borderRadius: "6px",
        border: "1px solid #444",
        background: "#111",
        color: "#fff",
        height: "28px",
    },
    inlineCloseButton: {
        background: "#333",
        border: "1px solid #555",
        borderRadius: "4px",
        color: "#fff",
        fontSize: "14px",
        width: "28px",
        height: "28px",
        lineHeight: "24px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }

};
