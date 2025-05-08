import React, { useState } from "react";

export default function BioSection({ html }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={styles.container}>
            <div style={styles.sectionTitle}>About</div>

            <div
                style={{
                    ...styles.bio,
                    ...(expanded ? {} : styles.collapsed)
                }}
            >
                <div
                    dangerouslySetInnerHTML={{ __html: html }}
                />
                {!expanded && <div style={styles.fadeOverlay} />}
            </div>

            {!expanded && (
                <button onClick={() => setExpanded(true)} style={styles.button}>
                    See more
                </button>
            )}
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
        marginBottom: "4px"
    },
    bio: {
        fontSize: "13px",
        lineHeight: "1.6",
        color: "#ddd",
        position: "relative",
        overflow: "hidden"
    },
    collapsed: {
        maxHeight: "120px"
    },
    fadeOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "40px",
        background: "linear-gradient(to top, #1a1a1a, transparent)"
    },
    button: {
        marginTop: "8px",
        fontSize: "12px",
        color: "#fff",
        background: "#333",
        border: "1px solid #555",
        padding: "4px 8px",
        borderRadius: "4px",
        cursor: "pointer"
    }
};
