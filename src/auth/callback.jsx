import {useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import {getBackendUrl} from "../utils/apiBase.js";
import {User} from "../models/user.js";
import {initializeUserIfNeeded} from "../utils/dataFetcher.js";

export default function Callback({ setUser }) {
    const hasFetchedRef = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        const fetchSpotifyUser = async () => {
            const params = new URLSearchParams(window.location.search);

            const code = params.get("code");
            if (!code) {
                console.error("Missing authorization code from URL.");
                navigate("/");
                return;
            }
            const codeVerifier = localStorage.getItem("spotify_code_verifier");

            if (!codeVerifier) {
                console.error("Missing code_verifier");
                return;
            }

            const backendUrl = getBackendUrl();

            const backendResponse = await fetch(`${backendUrl}/api/spotify/callback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, code_verifier: codeVerifier })
            });

            if (!backendResponse.ok) {
                console.error("Spotify login failed:", await backendResponse.text());
                navigate("/");
                return;
            }

            const rawData = await backendResponse.json();
            const user = new User(rawData);
            setUser(user);
            navigate("/");

            initializeUserIfNeeded(user.id, user.topSpotifyIds);
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