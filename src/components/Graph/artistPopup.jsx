import React from "react";

export default function ArtistPopup({ x, y, name, label }) {
    return (
        <div
            style={{
                position: "absolute",
                top: y,
                left: x,
                background: "#fff",
                color: "#000",
                padding: "10px",
                borderRadius: "6px",
                zIndex: 20,
                boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                maxWidth: "200px"
            }}
        >
            <div style={{ fontWeight: "bold" }}>{name}</div>
            <div style={{ marginTop: "5px", fontSize: "12px", opacity: 0.6 }}>{label}</div>
        </div>
    );
}