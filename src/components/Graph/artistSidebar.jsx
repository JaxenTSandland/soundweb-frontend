import React from "react";

export default function ArtistSidebar({ popupData }) {
    if (!popupData) {
        console.error(`Trying to render artist data but no artist is found!`);
        return null;
    }

    return (
        <div style={sidebarStyles.container}>
            {popupData.image && (
                <img
                    src={popupData.image}
                    alt={popupData.name}
                    style={sidebarStyles.image}
                />
            )}
            <div style={sidebarStyles.name}>{popupData.name}</div>
        </div>
    );
}

const sidebarStyles = {
    container: {
        position: "absolute",
        top: 0,
        right: 0,
        width: "300px",
        height: "100%",
        backgroundColor: "#fff",
        boxShadow: "-4px 0 12px rgba(0,0,0,0.3)",
        zIndex: 30,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        overflowY: "auto",
    },
    image: {
        width: "100%",
        height: "auto",
        borderRadius: "8px",
        objectFit: "cover",
        marginBottom: "12px",
    },
    name: {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#000",
        textAlign: "center",
    },
};
