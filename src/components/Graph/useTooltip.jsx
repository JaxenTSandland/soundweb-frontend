import { useEffect } from "react";

export default function useTooltip() {
    useEffect(() => {
        const tooltip = document.getElementById("tooltip");

        const handleMouseMove = (e) => {
            if (tooltip && tooltip.style.display === "block") {
                tooltip.style.left = `${e.clientX + 10}px`;
                tooltip.style.top = `${e.clientY + 10}px`;
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const showTooltip = (node) => {
        const tooltip = document.getElementById("tooltip");
        if (node) {
            tooltip.style.display = "block";
            tooltip.innerHTML = `
                <strong>${node.name}</strong><br />
                Genres: ${node.genres.join(", ")}<br />
                Popularity: ${node.popularity}/100
            `;
        }
    };

    const hideTooltip = () => {
        const tooltip = document.getElementById("tooltip");
        tooltip.style.display = "none";
    };

    return { showTooltip, hideTooltip };
}
