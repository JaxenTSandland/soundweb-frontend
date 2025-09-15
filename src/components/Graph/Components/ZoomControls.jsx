import React from "react";

export default function ZoomControls({ handleZoom, resetZoom, graphStyles }) {
    return (
        <div style={graphStyles.zoomControls}>
            <button
                onClick={() => handleZoom(1.65)}
                style={graphStyles.zoomButtonTop}
            >
                ＋
            </button>
            <button
                onClick={resetZoom}
                style={graphStyles.zoomButtonReset}
            >
                ⟳
            </button>
            <button
                onClick={() => handleZoom(0.45)}
                style={graphStyles.zoomButtonBottom}
            >
                −
            </button>
        </div>
    );
}