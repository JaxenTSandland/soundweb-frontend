import React, { useRef, useEffect, useState } from "react";
import './App.css';
import ArtistGraph from "./components/Graph/artistGraph.jsx";
import GraphFooter from "./components/Footer/graphFooter.jsx";
import TopBar from "./components/TopBar/topBar.jsx";
import { generateCodeChallenge, generateRandomString } from "./utils/pkceUtils.js";
import {getHomePageLink, getSpotifyRedirectUrl} from "./utils/apiBase.js";

function App({ user, setUser }) {
    const [activeTab, setActiveTab] = useState({ mode: "Top1000", param: null });
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef();
    const menuButtonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownOpen &&
                !dropdownRef.current?.contains(e.target) &&
                !menuButtonRef.current?.contains(e.target)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside, true);
        return () => document.removeEventListener("mousedown", handleClickOutside, true);
    }, [dropdownOpen]);


    // Navigation
    function switchToTop1000() {
        setActiveTab({ mode: "Top1000", param: null });
    }
    function switchToArtistBased(spotifyId) {
        setActiveTab({ mode: "ArtistBased", param: spotifyId });
    }
    function switchToUserCustom(userId) {
        setActiveTab({ mode: "UserCustom", param: userId });
    }

    // Auth
    async function handleLogin() {
        const spotifyClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
        const redirectUri = getSpotifyRedirectUrl();
        const spotifyScope = "user-read-email user-read-private user-top-read";

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

    async function handleLogout() {
        setDropdownOpen(false);
        setUser(null);
        window.location.href = getHomePageLink();
    }

    return (
        <div className="App">
            <TopBar
                user={user}
                onLoginClick={handleLogin}
                onLogoutClick={handleLogout}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                menuButtonRef={menuButtonRef}
            />

            {dropdownOpen && (
                <div ref={dropdownRef} style={styles.dropdownMenu}>
                    <button onClick={handleLogout} style={styles.logoutButton}>Log Out</button>
                </div>
            )}

            {/* Add artist button */}
            { activeTab.mode !== "Top1000" &&
                <button onClick={() => []} style={styles.addArtistButton}>
                    + Add Artist
                </button>
            }


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

const styles = {
    dropdownMenu: {
        position: "absolute",
        top: 52,
        left: 10,
        backgroundColor: "#1e1e1e",
        border: "1px solid #444",
        borderRadius: "6px",
        padding: "8px 0",
        boxShadow: "0 0 6px rgba(0,0,0,0.3)",
        zIndex: 1000,
        minWidth: "178px"
    },
    logoutButton: {
        width: "100%",
        padding: "8px 12px",
        textAlign: "left",
        background: "none",
        border: "none",
        color: "#F00",
        fontSize: "14px",
        cursor: "pointer"
    },
    addArtistButton: {
        position: "absolute",
        top: "60px",
        right: "310px",
        zIndex: 30,
        padding: "6px 12px",
        backgroundColor: "#1db954",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "13px",
        cursor: "pointer"
    }
};

export default App;
