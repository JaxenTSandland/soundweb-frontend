import React from "react";

export default function AddArtistModal({ searchTerm, setSearchTerm, onClose }) {
    return (
        <>
            <div style={styles.overlay} onClick={onClose} />
            <div style={styles.modal}>
                <button onClick={onClose} style={styles.closeButton}>×</button>
                <div style={styles.modalInner}>
                    <h2 style={styles.modalTitle}>Add Artist</h2>
                    <input
                        type="text"
                        placeholder="Search for an artist..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
            </div>
        </>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 99999
    },
    searchInput: {
        padding: "6px 10px",
        fontSize: "14px",
        borderRadius: "6px",
        border: "1px solid #444",
        background: "#111",
        color: "#fff",
        marginBottom: "4px"
    },
    modalHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "12px"
    },
    modal: {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#1e1e1e",
        borderRadius: "10px",
        padding: "16px 20px 20px 20px",
        zIndex: 999999,
        color: "white",
        minWidth: "300px",
        maxWidth: "90vw",
        boxShadow: "0 0 20px rgba(0,0,0,0.4)"
    },
    modalInner: {
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },
    modalTitle: {
        fontSize: "18px",
        fontWeight: "bold",
        marginTop: "16px",
        margin: 0,
        textAlign: "center"
    },
    closeButton: {
        position: "absolute",
        top: "12px",
        left: "15px",
        background: "none",
        border: "none",
        color: "#aaa",
        fontSize: "20px",
        cursor: "pointer",
        lineHeight: 1,
        padding: 0
    }
};