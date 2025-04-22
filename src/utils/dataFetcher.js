export default class DataFetcher {
    constructor(baseUrl = import.meta.env.VITE_BACKEND_URL) {
        this.baseUrl = baseUrl;
    }

    async fetchArtistAndGenreData() {
        try {
            const [topGenresRes, allGenresRes, artistsRes] = await Promise.all([
                fetch(`${this.baseUrl}/api/genres/top?count=10`),
                fetch(`${this.baseUrl}/api/genres/all`),
                fetch(`${this.baseUrl}/api/artists/graph`)
            ]);

            const topGenres = await topGenresRes.json();
            const allGenres = await allGenresRes.json();
            const artistData = await artistsRes.json();

            return {
                artistNodesRaw: artistData.nodes || [],
                genreLabels: Array.isArray(topGenres) ? topGenres : [],
                allGenres: Array.isArray(allGenres) ? allGenres : [],
                links: artistData.links || []
            };
        } catch (error) {
            console.error("Failed to load artist/genre data:", error);
            return { artistNodesRaw: [], genreLabels: [], allGenres: [], links: [] };
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
