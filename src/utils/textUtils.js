export function toTitleCase(str) {
    if (!str || str.length === 0) return str;
    try {
        return str
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    } catch (e) {
        console.error(`${str} did not parse: ${e}`);
    }
}