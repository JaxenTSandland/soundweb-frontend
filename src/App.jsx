import React, { useState } from "react";
import './App.css';
import ArtistGraph from "./components/Graph/artistGraph.jsx";
import GraphFooter from "./components/Footer/graphFooter.jsx";
import TopBar from "./components/TopBar/topBar.jsx";
import {generateCodeChallenge, generateRandomString} from "./utils/pkceUtils.js";

function App({ user, setUser }) {
    const [activeTab, setActiveTab] = useState({ mode: "Top1000", param: null });

    function switchToTop1000() {
        setActiveTab({ mode: "Top1000", param: null });
    }

    function switchToArtistBased(spotifyId) {
        setActiveTab({ mode: "ArtistBased", param: spotifyId });
    }

    function switchToUserCustom(userId) {
        setActiveTab({ mode: "UserCustom", param: userId });
    }

    async function handleLogin() {
        const spotifyClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
        const spotifyScope = "user-read-email user-read-private";

        const codeVerifier = generateRandomString(128);
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        localStorage.setItem("spotify_code_verifier", codeVerifier);

        const params = new URLSearchParams({
            client_id: spotifyClientId,
            response_type: "code",
            redirect_uri: redirectUri,
            code_challenge_method: "S256",
            code_challenge: codeChallenge,
            scope: spotifyScope
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    return (
        <div className="App">
            <TopBar user={user} onLoginClick={handleLogin} />

            <ArtistGraph mode={activeTab.mode} param={activeTab.param} user={user} />

            <GraphFooter
                activeTab={activeTab}
                switchToTop1000={switchToTop1000}
                switchToArtistBased={switchToArtistBased}
                switchToUserCustom={switchToUserCustom}
                user={user}
            />
        </div>
    );
}

export default App;
