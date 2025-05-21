import React from "react";
import lockedIcon from "../../../assets/locked-symbol.png";

export default function GraphFooter({ activeTab, switchToTop1000, switchToArtistBased, switchToUserCustom, switchToUserTop, user }) {
    return (
        <div className="graph-footer">
            <button
                className={activeTab.mode === "Top1000" ? "active" : ""}
                onClick={switchToTop1000}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
                <img
                    src={lockedIcon}
                    alt="locked"
                    style={{
                        width: "14px",
                        height: "14px",
                        filter: "invert(1)", // inverts black to white
                        marginBottom: "1px"
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

            { user &&
                <button
                    className={activeTab.mode === "UserTop" ? "active" : ""}
                    onClick={() => switchToUserTop()}
                    >
                    My Spotify Graph
                </button>
            }

        </div>
    );
}
