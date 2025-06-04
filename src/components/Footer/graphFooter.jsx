import React from "react";

export default function GraphFooter({ activeTab, switchToTop1000, switchToAllArtists, switchToUserTop, user }) {
    const globalIcon = "/assets/global-symbol.png";
    const trophyIcon = "/assets/trophy-symbol.png";
    const userIcon = "/assets/user-symbol.png";

    return (
        <div className="graph-footer">
            <button
                className={activeTab.mode === "AllArtists" ? "active" : ""}
                onClick={switchToAllArtists}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
                <img
                    src={globalIcon}
                    alt="Global icon"
                    style={{
                        width: "14px",
                        height: "14px",
                        filter: "invert(1)"
                    }}
                />
                All Soundweb Artists
            </button>

            <button
                className={activeTab.mode === "Top1000" ? "active" : ""}
                onClick={switchToTop1000}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
                <img
                    src={trophyIcon}
                    alt="Trophy icon"
                    style={{
                        width: "14px",
                        height: "14px",
                        filter: "invert(1)"
                    }}
                />
                Top 1000
            </button>

            {user && (

                <button
                    className={activeTab.mode === "UserTop" ? "active" : ""}
                    onClick={switchToUserTop}
                >
                    <img
                        src={userIcon}
                        alt="User icon"
                        style={{
                            width: "14px",
                            height: "14px",
                            filter: "invert(1)",
                            marginRight: "6px"
                        }}
                    />
                    My Spotify Graph
                </button>
            )}

        </div>
    );
}
