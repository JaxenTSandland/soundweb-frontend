import React, { useState } from "react";
import ArtistGraph from "./components/Graph/artistGraph.jsx";

function App() {
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

    return (
        <div className="App">

            <ArtistGraph mode={activeTab.mode} param={activeTab.param} />
            <div style={{ position: "fixed", bottom: 0, width: "100%", display: "flex", backgroundColor: "#222" }}>
                <button onClick={switchToTop1000}>Top 1000</button>
                <button onClick={() => switchToArtistBased("6eUKZXaKkcviH0Ku9w2n3V")}>Ed Sheeran Graph</button>
                <button onClick={() => switchToUserCustom("user123")}>My Custom Graph</button>
            </div>
        </div>
    );
}

export default App;