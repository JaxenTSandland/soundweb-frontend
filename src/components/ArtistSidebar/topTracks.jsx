import React from "react";

export default function TopTracks({ tracks }) {
    if (!tracks?.length) return null;

    const slicedTracks = tracks.slice(0, 5);

    return (
        <div style={styles.container}>
            <div style={styles.sectionTitle}>Top Tracks</div>
            <div style={styles.trackList}>
                {slicedTracks.map((track, index) => (
                    <React.Fragment key={track.id}>
                        {index > 0 && <div style={styles.divider} />}
                        <div style={styles.trackRow}>
                            {track.spotifyUrl ? (
                                <a
                                    href={track.spotifyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ ...styles.trackName, textDecoration: "none", color: "inherit" }}
                                >
                                    {track.name}
                                </a>
                            ) : (
                                <div style={styles.trackName}>{track.name}</div>
                            )}
                        </div>
                        {index === slicedTracks.length - 1 && <div style={styles.divider} />}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: {
        marginTop: "12px",
        width: "100%"
    },
    sectionTitle: {
        fontWeight: "bold",
        fontSize: "15px",
        marginBottom: "6px"
    },
    trackList: {
        display: "flex",
        flexDirection: "column"
    },
    trackRow: {
        display: "flex",
        padding: "6px 0",
        alignItems: "center"
    },
    trackName: {
        fontSize: "14px",
        color: "#eee",
        paddingLeft: "4px",
        flex: 1
    },
    divider: {
        height: "1px",
        width: "100%",
        backgroundColor: "#333"
    }
};

