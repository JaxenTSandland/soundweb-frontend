import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback({ setUser }) {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSpotifyUser = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            const codeVerifier = localStorage.getItem("spotify_code_verifier");

            const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
            const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

            const body = new URLSearchParams({
                client_id: clientId,
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
                code_verifier: codeVerifier
            });

            const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body
            });

            const tokenJson = await tokenResponse.json();
            const accessToken = tokenJson.access_token;

            // Fetch user profile with access token
            const profileResponse = await fetch("https://api.spotify.com/v1/me", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            const userProfile = await profileResponse.json();

            setUser({
                id: userProfile.id,
                display_name: userProfile.display_name,
                email: userProfile.email,
                images: userProfile.images
            });

            navigate("/");
        };

        fetchSpotifyUser();
    }, [setUser, navigate]);

    return <div>Logging in with Spotify...</div>;
}