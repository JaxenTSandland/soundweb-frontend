import defaultAvatar from "../../../assets/default-avatar.jpg";
import React from "react";

export default function TopBar({ user, onLoginClick, onLogoutClick, dropdownOpen, setDropdownOpen, menuButtonRef }) {
    return (
        <div style={styles.bar}>
            {user === null ? (
                <button style={styles.loginButton} onClick={onLoginClick}>
                    Log in with Spotify
                </button>
            ) : (
                <div
                    ref={menuButtonRef}
                    style={styles.userInfo}
                    onClick={() => setDropdownOpen(prev => !prev)}
                >
                    <img
                        src={user.images?.[0]?.url || defaultAvatar}
                        alt="avatar"
                        style={styles.userImage}
                    />
                    <span style={styles.userName}>{user.display_name}</span>
                    <span style={styles.caret}>▾</span>
                </div>
            )}

            <div style={styles.title}>Soundweb</div>
        </div>
    );
}



const styles = {
    bar: {
        width: "100%",
        height: "50px",
        backgroundColor: "#121212",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "0 10px",
        boxSizing: "border-box",
        borderBottom: "1px solid #333"
    },
    loginButton: {
        backgroundColor: "#1DB954",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: "4px",
        fontSize: "14px",
        cursor: "pointer"
    },
    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: "#ccc",
        fontSize: "14px"
    },
    userImage: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        objectFit: "cover"
    },
    username: {
        fontSize: "15px",
        fontWeight: "500"
    },
    title: {
        position: "absolute",
        right: "15px",
        color: "white",
        fontSize: "18px",
        fontWeight: "bold",
        letterSpacing: "1px"
    },
    userWrapper: {
        position: "relative",
        display: "inline-block",
        zIndex: 999,
    }
};
