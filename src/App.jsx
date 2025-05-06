import React, { useState } from "react";
import './App.css';
import ArtistGraph from "./components/Graph/artistGraph.jsx";
import GraphFooter from "./components/Footer/graphFooter.jsx";
import TopBar from "./components/TopBar/topBar.jsx";

function App() {
    const [activeTab, setActiveTab] = useState({ mode: "Top1000", param: null });
    const [user, setUser] = useState(null);

    function switchToTop1000() {
        setActiveTab({ mode: "Top1000", param: null });
    }

    function switchToArtistBased(spotifyId) {
        setActiveTab({ mode: "ArtistBased", param: spotifyId });
    }

    function switchToUserCustom(userId) {
        setActiveTab({ mode: "UserCustom", param: userId });
    }

    function handleLogin() {
        // Placeholder: replace with real Spotify auth later
        setUser({
            id: "7717",
            display_name: "Jaxen Sandland",
            email: "jaxensandland8@gmail.com",
            images: [{ url: null }],
        });
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
