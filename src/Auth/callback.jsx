import {useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import {getBackendUrl, getSpotifyRedirectUrl} from "../utils/apiBase.js";

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

            const userData = await backendResponse.json();
            setUser(userData);
            navigate("/");
        };

        fetchSpotifyUser();
    }, [setUser, navigate]);

    return <div>Logging in with Spotify...</div>;
}