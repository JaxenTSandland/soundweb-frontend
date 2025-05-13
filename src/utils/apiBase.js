export function getBackendUrl() {
    if (import.meta.env.DEV) {
        return "http://localhost:3000"; // backend dev port
    } else {
        return import.meta.env.VITE_BACKEND_URL;
    }
}
export function getIngestorUrl() {
    if (import.meta.env.DEV) {
        return "http://localhost:8000"; // ingestor dev port
    } else {
        return import.meta.env.VITE_INGESTOR_API_URL;
    }
}
export function getSpotifyRedirectUrl() {
    if (import.meta.env.DEV) {
        return "http://localhost:5173/callback"; // spotify redirect dev port
    } else {
        return import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
    }
}
