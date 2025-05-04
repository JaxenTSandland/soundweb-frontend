import React, { useState } from "react";
import './App.css';
import ArtistGraph from "./components/Graph/artistGraph.jsx";

function App() {
    const [activeTab, setActiveTab] = useState({ mode: "Top1000", param: null });
    const [user, setUser] = useState({
        id: "7717",
        display_name: "Jaxen Sandland",
        email: "jaxensandland8@gmail.com",
        images: [{ url: null }],
    });

    function switchToTop1000() {
        setActiveTab({ mode: "Top1000", param: null });
    }

    function switchToArtistBased(spotifyId) {
        setActiveTab({ mode: "ArtistBased", param: spotifyId });
    }

    function switchToUserCustom(userId) {
        setActiveTab({ mode: "UserCustom", param: userId });
    }

    return (
        <div className="App">
            <ArtistGraph mode={activeTab.mode} param={activeTab.param} user={user} />

            <div className="graph-footer">
                <button
                    className={activeTab.mode === "Top1000" ? "active" : ""}
                    onClick={switchToTop1000}
                >
                    Top 1000
                </button>

                <button
                    className={activeTab.mode === "ArtistBased" ? "active" : ""}
                    onClick={() => switchToArtistBased("06HL4z0CvFAxyc27GXpf02")}
                >
                    Taylor Swift Graph
                </button>

                <button
                    className={activeTab.mode === "UserCustom" ? "active" : ""}
                    onClick={() => switchToUserCustom("7717")}
                >
                    My Custom Graph
                </button>
            </div>
        </div>
    );
}

export default App;