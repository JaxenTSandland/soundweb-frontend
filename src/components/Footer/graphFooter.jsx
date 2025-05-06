import React from "react";

export default function GraphFooter({ activeTab, switchToTop1000, switchToArtistBased, switchToUserCustom, user }) {
    return (
        <div className="graph-footer">
            <button
                className={activeTab.mode === "Top1000" ? "active" : ""}
                onClick={switchToTop1000}
            >
                Top 1000
            </button>

            <button
                className={activeTab.mode === "ArtistBased" ? "active" : ""}
                onClick={() => switchToArtistBased("06HL4z0CvFAxyc27GXpf02")}
            >
                Taylor Swift Graph
            </button>

            { user &&
                <button
                    className={activeTab.mode === "UserCustom" ? "active" : ""}
                    onClick={() => switchToUserCustom("7717")}
                    >
                    Custom Graph
                </button>
            }

        </div>
    );
}
