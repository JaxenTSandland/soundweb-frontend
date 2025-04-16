export async function fetchArtistAndGenreData() {
    try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL;

        const [genresRes, artistsRes] = await Promise.all([
            fetch(`${baseUrl}/api/genres/top?count=10`),
            fetch(`${baseUrl}/api/artists/graph`)
        ]);

        const genreLabels = await genresRes.json();
        const artistData = await artistsRes.json();

        console.log("genreLabels:", genreLabels); // should be an array
        console.log("artistData:", artistData);   // should have artistData.nodes and artistData.links

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

