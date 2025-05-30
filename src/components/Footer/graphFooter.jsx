import React from "react";
import globalIcon from "../../../assets/global-symbol.png";
import trophyIcon from "../../../assets/trophy-symbol.png";
import userIcon from "../../../assets/user-symbol.png";

export default function GraphFooter({ activeTab, switchToTop1000, switchToArtistBased, switchToAllArtists, switchToUserTop, user }) {
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

            {/*<button*/}
            {/*    className={activeTab.mode === "ArtistBased" ? "active" : ""}*/}
            {/*    onClick={() => switchToArtistBased("06HL4z0CvFAxyc27GXpf02")}*/}
            {/*>*/}
            {/*    Taylor Swift Graph*/}
            {/*</button>*/}

            {/*{ user &&*/}
            {/*    <button*/}
            {/*        className={activeTab.mode === "UserCustom" ? "active" : ""}*/}
            {/*        onClick={() => switchToUserCustom()}*/}
            {/*        >*/}
            {/*        Custom Graph*/}
            {/*    </button>*/}
            {/*}*/}

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
