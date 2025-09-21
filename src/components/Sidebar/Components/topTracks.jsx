import React, { useRef } from "react";
import useScrollArrows from "./useScrollArrows.js";

export default function TopTracks({ tracks }) {
    const ref = useRef();
    const [canScrollLeft, canScrollRight] = useScrollArrows(ref, [tracks]);

    const scroll = dir => {
        ref.current?.scrollBy({ left: dir * 155, behavior: "smooth" });
    };

    const slicedTracks = tracks?.slice(0, 5) ?? [];
    if (slicedTracks.length === 0) return null;

    const MAX_NAME_CASE = 23;
    const MAX_UPPERCASE_NAME_CASE = 16;
    const formatTitle = (name) => {
        const isAllCaps = name.slice(0, MAX_UPPERCASE_NAME_CASE).toUpperCase() === name.slice(0, MAX_UPPERCASE_NAME_CASE);
        const limit = isAllCaps ? MAX_UPPERCASE_NAME_CASE : MAX_NAME_CASE;
        const trimLimit = limit - 3;
        return name.length > limit ? name.slice(0, trimLimit).trim() + "..." : name;
    };

    return (
        <div style={containerStyle}>
            <div style={rowStyle}>
                {canScrollLeft && (
                    <div style={fadeArrowStyle("left")} onClick={() => scroll(-1)}>
                        &lt;
                    </div>
                )}
                <div ref={ref} style={scrollAreaStyle}>
                    {tracks.map((track, index) => (
                        <div key={track.id || index} style={cardStyle}>
                            <div style={titleWrapperStyle}>
                                <div style={titleTextStyle}>{formatTitle(track.name)}</div>
                            </div>
                            <div style={imageWrapperStyle}>
                                <a href={track.spotifyUrl} target="_blank" rel="noreferrer">
                                    <img
                                        src={track.album?.imageUrl}
                                        alt={track.album?.name}
                                        style={imageStyle}
                                    />
                                    <div style={dateOverlayStyle}>
                                        <div style={{ opacity: 0.8 }}>
                                            #{index + 1} { track.album?.release_date && (`(${track.album?.release_date.split("-")[0]})`)}
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
                {canScrollRight && (
                    <div style={fadeArrowStyle("right")} onClick={() => scroll(1)}>
                        &gt;
                    </div>
                )}
            </div>
        </div>
    );
}

const containerStyle = {
    marginTop: "12px"
};

const rowStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center"
};

const scrollAreaStyle = {
    display: "flex",
    gap: "12px",
    overflowX: "auto",
    scrollBehavior: "smooth",
    padding: "4px 12px",
    flex: 1,
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    overflowY: "hidden"
};

const cardStyle = {
    minWidth: "100px",
    maxWidth: "100px",
    textAlign: "center",
    flexShrink: 0,
    backgroundColor: "#292929",
    borderRadius: "10px",
    paddingTop: "6px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.5)"
};

const titleWrapperStyle = {
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "4px"
};

const titleTextStyle = {
    fontSize: "12px",
    color: "#DDD",
    lineHeight: "14px",
    overflow: "hidden",
    textAlign: "center",
    padding: "0 6px",
};

const imageWrapperStyle = {
    position: "relative",
    width: "100px",
    height: "100px"
};

const imageStyle = {
    width: "100px",
    height: "100px",
    borderRadius: "6px",
    objectFit: "cover",
    border: "1px solid #444"
};

const dateOverlayStyle = {
    position: "absolute",
    bottom: "0px",
    left: "0px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    fontSize: "10px",
    lineHeight: "1.2",
    padding: "4px 6px",
    borderRadius: "0px 6px 0px 6px",
    textAlign: "left",
    whiteSpace: "nowrap"
};

const fadeArrowStyle = side => ({
    position: "absolute",
    [side]: 0,
    top: 0,
    bottom: 0,
    width: "30px",
    fontFamily: "sans-serif",
    fontSize: "20px",
    background: side === "left"
        ? "linear-gradient(to right, #1a1a1a, transparent)"
        : "linear-gradient(to left, #1a1a1a, transparent)",
    display: "flex",
    alignItems: "center",
    justifyContent: side === "left" ? "flex-start" : "flex-end",
    cursor: "pointer",
    zIndex: 1
});
