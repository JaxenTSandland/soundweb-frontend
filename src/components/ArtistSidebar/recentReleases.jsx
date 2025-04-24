import React, { useRef } from "react";
import useScrollArrows from "./useScrollArrows";

export default function RecentReleases({ releases }) {
    const ref = useRef();
    const [canScrollLeft, canScrollRight] = useScrollArrows(ref, [releases]);

    const scroll = dir => {
        ref.current?.scrollBy({ left: dir * 150, behavior: "smooth" });
    };

    return (
        <div style={{ marginTop: "12px" }}>
            <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>Recent Releases</div>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                {canScrollLeft && (
                    <div style={{ ...fadeArrowStyle("left") }} onClick={() => scroll(-1)}>◀</div>
                )}
                <div ref={ref} style={scrollAreaStyle}>
                    {releases.map(rel => (
                        <div key={rel.id} style={{ minWidth: "100px", maxWidth: "100px", textAlign: "center", flexShrink: 0 }}>
                            <div style={{ fontSize: "12px", color: "#ccc", marginBottom: "4px", height: "30px", lineHeight: "14px", overflow: "hidden" }}>{rel.name}</div>
                            <a href={rel.spotifyUrl} target="_blank" rel="noreferrer">
                                <img src={rel.imageUrl} alt={rel.name} style={imageStyle} />
                            </a>
                        </div>
                    ))}
                </div>
                {canScrollRight && (
                    <div style={{ ...fadeArrowStyle("right") }} onClick={() => scroll(1)}>▶</div>
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

const imageStyle = {
    width: "100px",
    height: "100px",
    borderRadius: "6px",
    objectFit: "cover",
    border: "1px solid #444"
};

const fadeArrowStyle = side => ({
    position: "absolute",
    [side]: 0,
    top: 0,
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
