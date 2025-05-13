import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {getSpotifyRedirectUrl} from "../../utils/apiBase.js";

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
            //console.log("Token request body:", body.toString());
            const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body
            });

            const tokenJson = await tokenResponse.json();
            const accessToken = tokenJson.access_token;
            //console.log("Token JSON:", tokenJson);

            // Fetch user profile with access token
            const profileResponse = await fetch("https://api.spotify.com/v1/me", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (profileResponse.status === 200) {
                const userProfile = await profileResponse.json();
                //console.log(userProfile);

                setUser({
                    id: userProfile.id,
                    display_name: userProfile.display_name,
                    email: userProfile.email,
                    images: userProfile.images
                });
            }


            navigate("/");
        };

        fetchSpotifyUser();
    }, [setUser, navigate]);

    return <div>Logging in with Spotify...</div>;
}