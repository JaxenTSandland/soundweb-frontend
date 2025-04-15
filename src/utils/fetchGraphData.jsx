import { toTitleCase } from "./textUtils.js";

export async function fetchArtistAndGenreData(setGraphData, setAllLinks, setGenreLabels) {
    try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL;

        // Fetch genre labels
        const genresRes = await fetch(`${baseUrl}/api/genres/top?count=10`);
        const genreLabels = await genresRes.json();
        setGenreLabels(genreLabels);

        // Fetch artist nodes and links from backend
        const res = await fetch(`${baseUrl}/api/artists/graph`);
        const { nodes: artistNodesRaw, links } = await res.json();

        // Build artist nodes
        const artistNodes = artistNodesRaw.map(artist => ({
            id: artist.id,
            name: artist.name,
            radius: Math.pow(artist.popularity / 100, 4.5) * 70 + 5,
            genres: artist.genres,
            spotifyUrl: artist.spotifyId
                ? `https://open.spotify.com/artist/${artist.spotifyId}`
                : artist.spotifyUrl || "",
            imageUrl: artist.imageUrl,
            color: artist.color,
            x: artist.x,
            y: artist.y,
            label: `${artist.name}\nGenre: ${artist.genres.join(", ")}\nPopularity: ${artist.popularity}/100`,
            labelNode: false
        }));

        // Build genre label nodes
        const labelNodes = genreLabels.map((genre, i) => ({
            id: `genre-${i}`,
            name: toTitleCase(genre.name),
            x: genre.x,
            y: genre.y,
            radius: 1,
            color: "transparent",
            labelNode: true,
            count: genre.count
        }));

        // Set graph data
        setGraphData({
            nodes: [...artistNodes, ...labelNodes],
            links: [] // No links in graphData directly
        });

        setAllLinks(links);

        return [...artistNodes, ...labelNodes];
    } catch (error) {
        console.error("Failed to load artist/genre data:", error);
    }
}
