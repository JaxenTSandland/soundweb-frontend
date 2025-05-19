import { useEffect } from "react";

export default function useTooltip(getNodeLabel) {
    useEffect(() => {
        const tooltip = document.getElementById("tooltip");

        const handleMouseMove = (e) => {
            if (tooltip) {
                tooltip.style.left = `${e.clientX + 10}px`;
                tooltip.style.top = `${e.clientY - 35}px`;
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const showTooltip = (node) => {
        const tooltip = document.getElementById("tooltip");
        if (!node) return;

        const label = getNodeLabel(node);
        tooltip.innerHTML = label.replaceAll("\n", "<br>");
        tooltip.style.display = "block";
    };

    const hideTooltip = () => {
        const tooltip = document.getElementById("tooltip");
        tooltip.style.display = "none";
    };

    return { showTooltip, hideTooltip };
}
