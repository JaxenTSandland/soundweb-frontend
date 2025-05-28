import React, { useRef, useEffect, useState } from "react";
import './App.css';
import ArtistGraph from "./components/Graph/artistGraph.jsx";
import GraphFooter from "./components/Footer/graphFooter.jsx";
import TopBar from "./components/TopBar/topBar.jsx";
import { generateCodeChallenge, generateRandomString } from "./utils/pkceUtils.js";
import {User} from "./models/user.js";
import {pingUser} from "./utils/dataFetcher.js";

function App({ user, setUser }) {
    const [activeTab, setActiveTab] = useState({ mode: "Top1000", param: null });
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const hasPingedRef = useRef(false);
    // const [showAddArtistModal, setShowAddArtistModal] = useState(false);
    // const [addArtistSearch, setAddArtistSearch] = useState("");
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

    useEffect(() => {
        const savedUser = localStorage.getItem("soundweb_user");
        if (!savedUser || hasPingedRef.current) {
            return;
        }

        const parsed = JSON.parse(savedUser);
        const userObj = new User(parsed);
        setUser(userObj);
        hasPingedRef.current = true;

        setTimeout(() => {
            pingUser(userObj.id)
                .then(result => {
                    if (result?.spotify_ids) {
                        userObj.topSpotifyIds = result.spotify_ids;
                        setUser(userObj);
                        localStorage.setItem("soundweb_user", JSON.stringify(userObj));
                    }
                })
                .catch(err => {
                    console.warn("Ping failed:", err);

                    if (err.status === 401 || err.status === 400) {
                        alert("Your Spotify session has expired. Please log in again.");
                        localStorage.removeItem("soundweb_user");
                        setUser(null);
                        window.location.href = import.meta.env.VITE_SOUNDWEB_HOMEPAGE;
                    } else if (err.status === 404) {

                    }
                });
        }, 250);

    }, []);

    // Navigation
    function switchToTop1000() {
        setActiveTab({ mode: "Top1000", param: null });
    }
    function switchToArtistBased(spotifyId) {
        setActiveTab({ mode: "ArtistBased", param: spotifyId });
    }
    function switchToAllArtists() {
        setActiveTab({ mode: "AllArtists", param: null });
    }
    function switchToUserTop() {
        if (!user) return;
        setActiveTab({ mode: "UserTop", param: user.id });
    }

    // Auth
    async function handleLogin() {
        const spotifyClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
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
            scope: spotifyScope,
            prompt: "consent"
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    async function handleLogout() {
        setDropdownOpen(false);
        localStorage.removeItem("spotify_access_token");
        setUser(null);
        localStorage.removeItem("soundweb_user");
        window.location.href = import.meta.env.VITE_SOUNDWEB_HOMEPAGE;
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

            {/*/!* Add artist stuff *!/*/}
            {/*{activeTab.mode !== "Top1000" && (*/}
            {/*    <>*/}
            {/*        <button onClick={() => setShowAddArtistModal(true)} style={styles.addArtistButton}>*/}
            {/*            + Add Artist*/}
            {/*        </button>*/}

            {/*        {showAddArtistModal && (*/}
            {/*            <AddArtistModal*/}
            {/*                searchTerm={addArtistSearch}*/}
            {/*                setSearchTerm={setAddArtistSearch}*/}
            {/*                onClose={() => setShowAddArtistModal(false)}*/}
            {/*            />*/}
            {/*        )}*/}
            {/*    </>*/}
            {/*)}*/}


            <ArtistGraph mode={activeTab.mode} param={activeTab.param} user={user} />

            <GraphFooter
                activeTab={activeTab}
                switchToTop1000={switchToTop1000}
                switchToArtistBased={switchToArtistBased}
                switchToAllArtists={switchToAllArtists}
                switchToUserTop={switchToUserTop}
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
    },
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 50
    },
    modal: {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#1e1e1e",
        borderRadius: "10px",
        padding: "24px",
        zIndex: 100,
        color: "white",
        minWidth: "300px",
        maxWidth: "90vw",
        boxShadow: "0 0 20px rgba(0,0,0,0.4)"
    },
    modalInner: {
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    }
};

export default App;
