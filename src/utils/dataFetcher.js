import {getBaseUrl} from "./apiBase.js";

export default class DataFetcher {
    constructor(baseUrl = getBaseUrl()) {
        this.baseUrl = baseUrl;
    }

    async fetchTopArtistAndGenreData() {
        try {
            const [topGenresRes, artistsRes] = await Promise.all([
                fetch(`${this.baseUrl}/api/genres/top?count=10`),
                fetch(`${this.baseUrl}/api/artists/top?max=1000`)
            ]);

            const topGenres = await topGenresRes.json();
            const artistData = await artistsRes.json();

            return {
                artistNodesRaw: artistData.nodes || [],
                genreLabels: Array.isArray(topGenres) ? topGenres : [],
                links: artistData.links || [],
                lastSync: artistData.lastSync || null
            };
        } catch (error) {
            console.error("Failed to load artist/genre data:", error);
            return { artistNodesRaw: [], genreLabels: [], links: [], lastSync: null };
        }
    }

    async fetchCustomArtistAndLinkData(max = 1000) {
        try {
            const res = await fetch(`${this.baseUrl}/api/artists/custom?max=${max}`);
            const artistData = await res.json();

            return {
                artistNodesRaw: artistData.nodes || [],
                links: artistData.links || [],
                lastSync: artistData.lastSync || null
            };
        } catch (error) {
            console.error("Failed to load custom artist/link data:", error);
            return { artistNodesRaw: [], links: [], lastSync: null };
        }
    }

    async fetchLastSync() {
        try {
            const res = await fetch(`${this.baseUrl}/api/metadata/last-sync`);
            const json = await res.json();
            return json.lastSync || null;
        } catch (error) {
            console.error("Failed to fetch lastSync metadata:", error);
            return null;
        }
    }
}
