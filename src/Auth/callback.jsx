import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSpotifyRedirectUrl } from "../utils/apiBase.js";

export default function Callback({ setUser }) {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSpotifyUser = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            const codeVerifier = localStorage.getItem("spotify_code_verifier");

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

            const tokenJson = await tokenResponse.json();
            const accessToken = tokenJson.access_token;

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
                    console.error("Failed to fetch top artists");
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
            //console.log(`USER INFO: ${userProfile.toString()}`)
            navigate("/");
        };

        fetchSpotifyUser();
    }, [setUser, navigate]);

    return <div>Logging in with Spotify...</div>;
}