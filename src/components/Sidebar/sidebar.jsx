import React, {useEffect, useState} from "react";
import ArtistSidebar from "./artistSidebar.jsx";
import {toTitleCase} from "../../utils/textUtils.js";
import "./sidebar.css"
import "./artistSidebar.css"
import "./sidebarSeach.css"
import "./sidebarGenres.css"
import "./sidebarArtists.css"

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
                className={`sidebar-container ${isMobile && isSidebarOpen ? "open" : ""}`}
            >

                {isMobile && (
                    <button onClick={() => setIsSidebarOpen(false)} className="sidebar-close">
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
                        <div className="search-section">
                            <div className="search-bar-row">
                                <button onClick={() => setIsSidebarOpen(false)} className="inline-close">
                                    ×
                                </button>
                                <input
                                    type="text"
                                    placeholder="Find artist in graph..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 100)}
                                    className="search-input"
                                />
                            </div>

                            {searchTerm && isSearchFocused && filteredResults.length > 0 && (
                                <div className="search-results">
                                    {filteredResults.map((node) => (
                                        <div
                                            key={node.id}
                                            onClick={() => handleResultClick(node)}
                                            className="search-result-item"
                                        >
                                            {node.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                            {(mode === "Top1000" || mode === "UserTop") && (
                                <div className="popular-artist-section">
                                    <div className="popular-artist-header">Top Ranked Artists</div>

                                    <div className="popularArtistList">
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
                                                    className={`popular-artist-item ${faded ? "faded" : ""}`}
                                                >
                                                    {displayRank}{node.name}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        {/* Bottom: Genre section */}
                        <div className="genre-section">
                            <div className="genre-header">
                                <span className="genre-title">Filter by Genre</span>
                                <div className="genre-controls">
                                    <button onClick={cycleSortMethod}>
                                        Sort: {sortMethod === "alphabetical" ? "A–Z" : "Popularity"}
                                    </button>
                                </div>
                            </div>

                            <div className="genre-controls">
                                <button
                                    onClick={() => {
                                        const onCount = allTopGenres.filter(g => g.toggled).length;
                                        const selectAll = onCount / allTopGenres.length <= 0.5;
                                        setAllGenres(allTopGenres.map(g => ({ ...g, toggled: selectAll })));
                                    }}
                                >
                                    {allTopGenres.filter(g => g.toggled).length / allTopGenres.length > 0.5
                                        ? "Deselect all"
                                        : "Select all"}
                                </button>
                            </div>

                            <div className="genreList">
                                {sortedGenres.map(({ name, count, toggled }) => (
                                    <label key={name} className="genre-item">
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
};
