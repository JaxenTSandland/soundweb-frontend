import {useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import {User} from "../models/user.js";
import {handleSpotifyAuthCallback, pingUser} from "../utils/dataFetcher.js";

export default function Callback({ setUser }) {
    const hasFetchedRef = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        const fetchSpotifyUser = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            const codeVerifier = localStorage.getItem("spotify_code_verifier");

            if (!code || !codeVerifier) {
                console.error("Missing auth info");
                navigate("/");
                return;
            }

            try {
                const baseData = await handleSpotifyAuthCallback(code, codeVerifier);
                const user = new User(baseData);

                const pingResult = await pingUser(user.id);
                if (pingResult?.spotify_ids) {
                    user.topSpotifyIds = pingResult.spotify_ids;
                }

                setUser(user);
                localStorage.setItem("soundweb_user", JSON.stringify(user));
                navigate("/");
            } catch (err) {
                console.error("Login or sync failed:", err);

                if (err.status === 401 || err.message?.includes("re-login")) {
                    alert("[CALLBACK.jsx] Session expired or sync failed. Please log in again.");
                } else {
                    alert("Something went wrong during login. Try again.");
                }

                localStorage.removeItem("soundweb_user");
                setUser(null);
                navigate("/");
            }
        };

        fetchSpotifyUser();
    }, [setUser, navigate]);

    return (
        <div style={styles.wrapper}>
            <div style={styles.box}>
                <div style={styles.spinner} />
                <div style={styles.text}>Logging you in with Spotify...</div>
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        minHeight: "100vh",
        width: "100vw"
    },
    box: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 24px",
        backgroundColor: "#111",
        border: "1px solid #333",
        borderRadius: "8px",
        boxShadow: "0 0 20px rgba(255,255,255,0.05)"
    },
    spinner: {
        width: "24px",
        height: "24px",
        border: "3px solid #666",
        borderTop: "3px solid #fff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "12px"
    },
    text: {
        color: "#ccc",
        fontSize: "16px",
        fontWeight: "500",
        opacity: 0.8,
        textAlign: "center"
    }
};