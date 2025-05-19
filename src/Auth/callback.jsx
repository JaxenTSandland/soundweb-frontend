import {useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import { getSpotifyRedirectUrl } from "../utils/apiBase.js";

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

            const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
            const redirectUri = getSpotifyRedirectUrl();

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

            if (!tokenResponse.ok) {
                console.error("Failed to exchange code for token:", await tokenResponse.text());
                navigate("/");
                return;
            }

            const tokenJson = await tokenResponse.json();
            localStorage.removeItem("spotify_code_verifier");
            const accessToken = tokenJson.access_token;

            if (!accessToken) {
                console.error("Access token missing:", tokenJson);
                return;
            }
            const profileResponse = await fetch("https://api.spotify.com/v1/me", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!profileResponse.ok) {
                console.error("Failed to fetch user profile");
                navigate("/");
                return;
            }

            const userProfile = await profileResponse.json();

            const topArtistIds = [];
            let offset = 0;
            const limit = 50;
            let hasMore = true;

            while (hasMore) {
                const topArtistsRes = await fetch(
                    `https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=${limit}&offset=${offset}`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    }
                );

                if (!topArtistsRes.ok) {
                    console.error("Failed to fetch top artists from user");
                    break;
                }

                const topArtistsJson = await topArtistsRes.json();
                const items = topArtistsJson.items || [];

                for (const artist of items) {
                    topArtistIds.push(artist.id);
                }

                if (items.length < limit) {
                    hasMore = false;
                } else {
                    offset += limit;
                }
            }

            setUser({
                id: userProfile.id,
                display_name: userProfile.display_name,
                email: userProfile.email,
                images: userProfile.images,
                topSpotifyIds: topArtistIds
            });
            navigate("/");
            window.history.replaceState({}, document.title, "/");
        };

        fetchSpotifyUser();
    }, [setUser, navigate]);

    return <div>Logging in with Spotify...</div>;
}