export default function wrapText(ctx, text, maxWidth) {
    const lines = [];

    const paragraphs = text.split("\n");

    for (const paragraph of paragraphs) {
        const words = paragraph.split(" ");
        let line = "";

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            const testWidth = ctx.measureText(testLine).width;

            if (testWidth > maxWidth && n > 0) {
                lines.push(line.trim());
                line = words[n] + " ";
            } else {
                line = testLine;
            }
        }

        if (line.trim() !== "") {
            lines.push(line.trim());
        }
    }

    return lines;
}
