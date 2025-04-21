export default class DataFetcher {
    constructor(baseUrl = import.meta.env.VITE_BACKEND_URL) {
        this.baseUrl = baseUrl;
    }

    async fetchArtistAndGenreData() {
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL;

            const [genresRes, artistsRes] = await Promise.all([
                fetch(`${baseUrl}/api/genres/top?count=10`),
                fetch(`${baseUrl}/api/artists/graph`)
            ]);

            const genreLabels = await genresRes.json();
            const artistData = await artistsRes.json();

            // console.log("genreLabels:", genreLabels); // should be an array
            // console.log("artistData:", artistData);   // should have artistData.nodes and artistData.links

            return {
                artistNodesRaw: artistData.nodes || [],
                genreLabels: Array.isArray(genreLabels) ? genreLabels : [],
                links: artistData.links || []
            };
        } catch (error) {
            console.error("Failed to load artist/genre data:", error);
            return { artistNodesRaw: [], genreLabels: [], links: [] };
        }
    }

    async fetchLastSync() {
        try {
            const res = await fetch(`${this.baseUrl}/api/metadata/last-sync`);
            const json = await res.json();
            const lastSync = json.lastSync;
            console.log(`Last sync: ${lastSync}`);
            return json.lastSync || null;
        } catch (error) {
            console.error("Failed to fetch lastSync metadata:", error);
            return null;
        }
    }
}