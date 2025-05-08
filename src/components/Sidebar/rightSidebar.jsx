import React from "react";
import ArtistSidebar from "./artistSidebar.jsx";
import {toTitleCase} from "../../utils/textUtils.js";

export default function RightSidebar({
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
                                        user,
                                        removeNodeFromGraph,
                                        mode,
                                        reloadGraph
                                     }) {

    const sortedGenres = [...allTopGenres].sort((a, b) =>
        sortMethod === "alphabetical" ? a.name.localeCompare(b.name) : b.count - a.count
    );

    return (
        <div style={styles.container}>
            {selectedNode ? (
                <ArtistSidebar
                    selectedNode={selectedNode}
                    setSelectedNode={setSelectedNode}
                    allUsedGenres={allUsedGenres}
                    user={user}
                    mode={mode}
                    removeNodeFromGraph={removeNodeFromGraph}
                    reloadGraph={reloadGraph}
                />
            ) : (
                <>
                    {/* Top: Search section */}
                    <div style={styles.searchSection}>
                        <input
                            type="text"
                            placeholder="Search artist..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 100)}
                            style={styles.searchInput}
                        />

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

                    {/* Bottom: Genre section */}
                    <div style={styles.genreSection}>
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

                        <div style={styles.genreList}>
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
        overflowY: "auto",
        borderLeft: "1px solid #333",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999
    },
    searchInput: {
        padding: "6px 10px",
        fontSize: "14px",
        borderRadius: "6px",
        border: "1px solid #444",
        background: "#111",
        color: "#fff",
        marginBottom: "12px"
    },
    searchResults: {
        background: "#222",
        borderRadius: "6px",
        border: "1px solid #444",
        marginBottom: "12px"
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
    searchSection: {
        flex: "0 0 40%",
        display: "flex",
        flexDirection: "column",
        marginBottom: "12px"
    },
    genreSection: {
        flex: "1 1 60%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
    },
    genreList: {
        overflowY: "auto",
        flex: 1
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
    }
};
