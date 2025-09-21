import React, { useRef } from "react";
import useScrollArrows from "./useScrollArrows.js";
import {toTitleCase} from "../../../utils/textUtils.js";

export default function RelatedArtists({ related, handleResultClick }) {
    const ref = useRef();
    const [canScrollLeft, canScrollRight] = useScrollArrows(ref, [related]);

    const scroll = dir => {
        ref.current?.scrollBy({ left: dir * 155, behavior: "smooth" });
    };

    return (
        <div style={{ marginTop: "12px" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                {canScrollLeft && (
                    <div style={fadeArrowStyle("left")} onClick={() => scroll(-1)}>
                        &lt;
                    </div>
                )}
                <div ref={ref} style={scrollAreaStyle}>
                    {related.map(artist => (
                        <div key={artist.id} style={cardStyle}>
                            <a
                                onClick={(e) => {
                                    if (!artist.faded) handleResultClick(artist);
                                    e.preventDefault();
                                }}
                                style={{ cursor: artist.faded ? "default" : "pointer" }}
                            >
                                <div style={{ position: "relative", width: "100px", height: "100px" }}>
                                        <img
                                            src={artist.imageUrl}
                                            alt={artist.name}
                                            style={{
                                                ...circleImageStyle,
                                                borderColor: artist.color || "#888"
                                            }}
                                        />
                                    {artist.genres?.length > 0 && (
                                        <div
                                            style={{
                                                ...genreTagStyle,
                                                backgroundColor: artist.color || "#888"
                                            }}
                                        >
                                            {toTitleCase(artist.genres[0])}
                                        </div>
                                    )}
                                </div>
                                <div
                                    style={{
                                        ...nameStyle,
                                        color: artist.faded ? "#777" : "#ccc"
                                    }}
                                >
                                    {artist.name.length > 20 ? artist.name.slice(0, 17) + "..." : artist.name}
                                </div>
                            </a>
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
    borderRadius: "50px 50px 10px 10px",
    padding: "6px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
    transition: "transform 0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px"
};

const nameStyle = {
    marginTop: "3px",
    fontSize: "13px",
    color: "#DDD",
    height: "32px",
    lineHeight: "16px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0 4px"
};

const fadeArrowStyle = side => ({
    position: "absolute",
    [side]: 0,
    top: 0,
    fontFamily: "sans-serif",
    bottom: 0,
    width: "30px",
    background: side === "left"
        ? "linear-gradient(to right, #1a1a1a, transparent)"
        : "linear-gradient(to left, #1a1a1a, transparent)",
    display: "flex",
    alignItems: "center",
    justifyContent: side === "left" ? "flex-start" : "flex-end",
    cursor: "pointer",
    zIndex: 1
});

const circleImageStyle = {
    width: "88px",
    height: "88px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid",
    boxSizing: "border-box"
};

const genreTagStyle = {
    position: "absolute",
    bottom: "3px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "500",
    color: "#000",
    backgroundColor: "#aaa",
    whiteSpace: "nowrap",
    boxShadow: "0 1px 3px rgba(0,0,0,0.4)"
};