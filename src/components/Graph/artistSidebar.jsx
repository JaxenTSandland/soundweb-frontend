import React from "react";

export default function ArtistSidebar({ selectedNode, allGenres }) {
    if (!selectedNode || selectedNode.labelNode) {
        console.error(`Trying to render artist data but no valid artist is selected!`);
        return null;
    }

    const getGenreColor = (genreName) => {
        const match = allGenres.find(g => g.genre === genreName);
        return match?.color || "#555";
    };

    return (
        <div style={sidebarStyles.container}>
            {selectedNode.imageUrl && (
                <img
                    src={selectedNode.imageUrl}
                    alt={selectedNode.name}
                    style={sidebarStyles.image}
                />
            )}

            <div style={sidebarStyles.nameRow}>
            {selectedNode.spotifyUrl ? (
                <a
                    href={selectedNode.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...sidebarStyles.name, textDecoration: "none" }}
                    title="Open on Spotify"
                >
                    {selectedNode.name}
                </a>
            ) : (
                <span style={sidebarStyles.name}>{selectedNode.name}</span>
            )}

            {selectedNode.spotifyUrl && (
                <a
                    href={selectedNode.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={sidebarStyles.spotifyLink}
                    title="Open on Spotify"
                >
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
                        alt="Spotify"
                        style={sidebarStyles.spotifyIcon}
                    />
                </a>
            )}
            </div>


            <div style={sidebarStyles.genreBoxContainer}>
                {selectedNode.genres.map((genre, i) => (
                    <span
                        key={i}
                        style={{
                            ...sidebarStyles.genreBox,
                            backgroundColor: getGenreColor(genre)
                        }}
                    >
                        {genre}
                    </span>
                ))}
            </div>
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
        backgroundColor: "#1a1a1a",
        color: "#fff",
        borderLeft: "1px solid #333",
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
        border: "1px solid #333"
    },
    genreBoxContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        justifyContent: "center",
        marginTop: "4px"
    },
    genreBox: {
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "500",
        color: "#000",
        backgroundColor: "#888"
    },
    nameRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        marginBottom: "6px"
    },
    name: {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },
    spotifyLink: {
        display: "inline-flex",
        alignItems: "center",
    },
    spotifyIcon: {
        height: "18px",
        width: "18px",
        marginTop: "1px"
    }
};
