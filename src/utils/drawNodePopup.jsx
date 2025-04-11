import drawRoundedRect from "./drawRoundedRect.jsx";

const imageCache = new Map();
const maxZoomSizing = 1.3;

export default function drawNodePopup(ctx, node, popupData, globalScale) {
    const rawScale = globalScale || 1;
    const cappedScale = Math.min(rawScale, maxZoomSizing);
    const scale = 1 / cappedScale;

    const nameFontSize = 16 * scale;
    const genreFontSize = 14 * scale;
    const padding = 10;
    const boxWidth = 220 * scale;
    const boxHeight = 300 * scale;
    const imageHeight = 176 * scale;
    const artistNameTextY = 130 * scale;

    const textColor = "#000";
    const labelColor = "#666";
    const bgColor = "white";

    const offsetX = node.radius + 10;
    const boxX = node.x + offsetX;
    const boxY = node.y - boxHeight / 2;

    ctx.save();
    ctx.beginPath();
    const edgeRadius = 10 * scale;
    drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, edgeRadius, true); // true = don't fill/stroke inside
    ctx.clip();

    // Draw popup background
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, edgeRadius);

    // Draw artist image at the top
    const imageUrl = popupData.image;
    console.log(imageUrl);
    if (imageUrl) {
        let img = imageCache.get(imageUrl);

        if (!img) {
            img = new Image();
            img.crossOrigin = "anonymous";
            img.src = imageUrl;

            img.onload = () => {
                console.log("[popup] image loaded:", imageUrl);
                imageCache.set(imageUrl, img);

                // Force re-draw on next frame
                if (popupData && popupData.node) {
                    popupData.node.imageDirty = true; // you could track this if needed
                }
            };

            imageCache.set(imageUrl, img);
        }
        if (img.complete && img.naturalWidth > 0) {
            const cropY = img.naturalHeight * 0.1;
            const cropHeight = img.naturalHeight * 0.8;

            ctx.drawImage(
                img,
                0, cropY,
                img.naturalWidth, cropHeight,
                boxX, boxY,
                boxWidth, imageHeight
            );

            // Add fade to bottom 1/3 of image
            const fadeStartY = boxY + imageHeight * (2 / 3);
            const fadeEndY = boxY + imageHeight;


            const gradient = ctx.createLinearGradient(0, fadeStartY, 0, fadeEndY);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
            gradient.addColorStop(1, bgColor); // match popup background

            ctx.fillStyle = gradient;
            ctx.fillRect(boxX, fadeStartY, boxWidth, fadeEndY - fadeStartY);

            // Safety fill at the bottom to prevent tiny edge bleed
            ctx.fillStyle = bgColor;
            const minFillHeight = 2;
            const zoomCompensatedHeight = Math.max(minFillHeight, 6 / rawScale);
            ctx.fillRect(boxX, fadeEndY - zoomCompensatedHeight / 2, boxWidth, zoomCompensatedHeight);
        } else {
            // Optional placeholder background
            ctx.fillStyle = bgColor;
            ctx.fillRect(boxX, boxY, boxWidth, imageHeight);
        }
    }

    // Draw artist name
    ctx.fillStyle = textColor;
    ctx.font = `bold ${nameFontSize}px Sans-Serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(popupData.name, boxX + padding, boxY + artistNameTextY);

    // Draw genres (single line, truncated if needed)
    ctx.font = `${genreFontSize}px Sans-Serif`;
    ctx.fillStyle = labelColor;

    const fullGenreText = popupData.label;
    const genreY = boxY + artistNameTextY + nameFontSize + 8;
    const maxTextWidth = boxWidth - padding * 2;

    let truncatedText = fullGenreText;
    let textWidth = ctx.measureText(truncatedText).width;

    if (textWidth > maxTextWidth) {
        const ellipsis = "...";
        let trimmed = fullGenreText;
        while (ctx.measureText(trimmed + ellipsis).width > maxTextWidth && trimmed.length > 0) {
            trimmed = trimmed.slice(0, -1);
        }
        truncatedText = trimmed + ellipsis;
    }

    ctx.fillText(truncatedText, boxX + padding, genreY);

    ctx.restore();
}