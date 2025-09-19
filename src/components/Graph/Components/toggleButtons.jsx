import React from "react";

export default function ToggleButtons({
                                          showTopGenres,
                                          setShowTopGenres,
                                          showLinks,
                                          setShowLinks,
                                          showLegend,
                                          setShowLegend,
                                          mode,
                                          graphStyles,
                                      }) {
    const hiddenSymbol = "/assets/hidden-symbol.png";
    const showingSymbol = "/assets/shown-symbol.png";

    const renderIcon = (isVisible) => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                marginRight: "8px",
            }}
        >
            <img
                src={isVisible ? showingSymbol : hiddenSymbol}
                alt={isVisible ? "Shown" : "Hidden"}
                style={{
                    width: 16,
                    height: 16,
                    filter: "invert(1)",
                    opacity: isVisible ? 1 : 0.6,
                }}
            />
            <div
                style={{
                    width: "1px",
                    height: "16px",
                    backgroundColor: "#DDD",
                    marginLeft: "8px",
                }}
            />
        </div>
    );

    const labelStyle = (isVisible) => ({
        display: "flex",
        alignItems: "center",
        color: isVisible ? "#fff" : "#aaa",
        opacity: isVisible ? 1 : 0.6,
    });

    return (
        <div style={graphStyles.toggleButtonGroup}>
            <button
                onClick={() => setShowTopGenres((prev) => !prev)}
                style={{ ...graphStyles.toggleButton, ...graphStyles.buttonTop }}
            >
        <span style={labelStyle(showTopGenres)}>
          {renderIcon(showTopGenres)}
            Genre Labels
        </span>
            </button>

            {mode !== "AllArtists" && (
                <button
                    onClick={() => setShowLinks((prev) => !prev)}
                    style={{ ...graphStyles.toggleButton, ...graphStyles.buttonMiddle }}
                >
          <span style={labelStyle(showLinks)}>
            {renderIcon(showLinks)}
              Relationships
          </span>
                </button>
            )}

            <button
                onClick={() => setShowLegend((prev) => !prev)}
                style={{ ...graphStyles.toggleButton, ...graphStyles.buttonBottom }}
            >
        <span style={labelStyle(showLegend)}>
          {renderIcon(showLegend)}
            Legend
        </span>
            </button>
        </div>
    );
}