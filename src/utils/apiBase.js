export function getBaseUrl() {
    if (import.meta.env.DEV) {
        return "http://localhost:3000"; // backend dev port
    } else {
        return import.meta.env.VITE_BACKEND_URL;
    }

    return "";
}