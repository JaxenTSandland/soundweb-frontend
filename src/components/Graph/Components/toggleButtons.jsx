import React from "react";
import "./toggleButtons.css";

export default function ToggleButtons({
                                          showTopGenres,
                                          setShowTopGenres,
                                          showLinks,
                                          setShowLinks,
                                          showLegend,
                                          setShowLegend,
                                          mode,
                                      }) {
    const hiddenSymbol = "/assets/hidden-symbol.png";
    const showingSymbol = "/assets/shown-symbol.png";

    const renderIcon = (isVisible) => (
        <div className="toggle-icon">
            <img
                src={isVisible ? showingSymbol : hiddenSymbol}
                alt={isVisible ? "Shown" : "Hidden"}
                className={`toggle-img ${isVisible ? "visible" : "hidden"}`}
            />
            <div className="toggle-divider" />
        </div>
    );

    return (
        <div className="toggle-button-group">
            <button onClick={() => setShowTopGenres((prev) => !prev)} className="toggle-button top">
        <span className={`toggle-label ${showTopGenres ? "active" : ""}`}>
          {renderIcon(showTopGenres)}
            Genre Labels
        </span>
            </button>

            {mode !== "AllArtists" && (
                <button onClick={() => setShowLinks((prev) => !prev)} className="toggle-button middle">
          <span className={`toggle-label ${showLinks ? "active" : ""}`}>
            {renderIcon(showLinks)}
              Relationships
          </span>
                </button>
            )}

            <button onClick={() => setShowLegend((prev) => !prev)} className="toggle-button bottom">
        <span className={`toggle-label ${showLegend ? "active" : ""}`}>
          {renderIcon(showLegend)}
            Legend
        </span>
            </button>
        </div>
    );
}
