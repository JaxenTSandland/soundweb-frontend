import React, { useRef } from "react";
import useScrollArrows from "./useScrollArrows.js";
import { toTitleCase } from "../../../utils/textUtils.js";
import "./sharedStyles.css";

export default function RelatedArtists({ related, handleResultClick }) {
    const ref = useRef();
    const [canScrollLeft, canScrollRight] = useScrollArrows(ref, [related]);

    const scroll = (dir) => {
        ref.current?.scrollBy({ left: dir * 155, behavior: "smooth" });
    };

    return (
        <div className="container">
            <div className="row">
                {canScrollLeft && (
                    <div className="fade-arrow left" onClick={() => scroll(-1)}>
                        &lt;
                    </div>
                )}

                <div ref={ref} className="scroll-area">
                    {related.map((artist) => (
                        <div key={artist.id} className="card-base card-circle">
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
                                            borderColor: artist.color || "#888",
                                        }}
                                    />
                                    {artist.genres?.length > 0 && (
                                        <div
                                            style={{
                                                ...genreTagStyle,
                                                backgroundColor: artist.color || "#888",
                                            }}
                                        >
                                            {toTitleCase(artist.genres[0])}
                                        </div>
                                    )}
                                </div>
                                <div
                                    style={{
                                        ...nameStyle,
                                        color: artist.faded ? "#777" : "#ccc",
                                    }}
                                >
                                    {artist.name.length > 20
                                        ? artist.name.slice(0, 17) + "..."
                                        : artist.name}
                                </div>
                            </a>
                        </div>
                    ))}
                </div>

                {canScrollRight && (
                    <div className="fade-arrow right" onClick={() => scroll(1)}>
                        &gt;
                    </div>
                )}
            </div>
        </div>
    );
}

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
    padding: "0 4px",
};

const circleImageStyle = {
    width: "88px",
    height: "88px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid",
    boxSizing: "border-box",
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
    boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
};