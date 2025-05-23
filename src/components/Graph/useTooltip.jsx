import { useEffect } from "react";

export default function useTooltip(getNodeLabel) {
    useEffect(() => {
        const tooltip = document.getElementById("tooltip");

        const handleMouseMove = (e) => {
            if (tooltip && tooltip.style.display === "block") {
                tooltip.style.left = `${e.clientX + 10}px`;
                tooltip.style.top = `${e.clientY - 35}px`;
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const showTooltip = (node) => {
        const tooltip = document.getElementById("tooltip");
        if (!node || !tooltip) return;

        const label = getNodeLabel(node);
        if (!label) return;

        tooltip.innerHTML = label.replaceAll("\n", "<br>");
        tooltip.style.display = "block";
    };

    const hideTooltip = () => {
        const tooltip = document.getElementById("tooltip");
        if (!tooltip) return;
        tooltip.style.display = "none";
    };

    return { showTooltip, hideTooltip };
}
