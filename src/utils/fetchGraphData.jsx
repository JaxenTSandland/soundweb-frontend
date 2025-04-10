import { toTitleCase } from "./textUtils.js";

export async function fetchArtistAndGenreData(setGraphData, setAllLinks, setGenreLabels) {
    try {
        const genresRes = await fetch("http://localhost:3000/api/genres/top?count=10");
        const genreLabels = await genresRes.json();
        setGenreLabels(genreLabels);

        const artistsRes = await fetch("http://localhost:3000/api/artists/all");
        const artists = await artistsRes.json();

        const artistNodes = artists.map(artist => ({
            id: artist.id,
            name: artist.name,
            radius: Math.pow(artist.popularity / 100, 4.5) * 70 + 5,
            genres: artist.genres,
            spotifyUrl: artist.spotifyId
                ? `https://open.spotify.com/artist/${artist.spotifyId}`
                : artist.spotifyUrl || "",
            color: artist.color,
            x: artist.x,
            y: artist.y,
            label: `${artist.name}\nGenre: ${artist.genres.join(", ")}\nPopularity: ${artist.popularity}/100`,
            labelNode: false
        }));

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

        const nameToId = new Map();
        artistNodes.forEach(n => nameToId.set(n.name.toLowerCase(), n.id));

        const linkSet = new Set();
        const links = [];

        const MAX_LINKS_PER_ARTIST = 10;
        artists.forEach(artist => {
            const sourceId = nameToId.get(artist.name.toLowerCase());
            if (!sourceId) return;

            let addedLinks = 0;

            for (const relatedName of artist.relatedArtists) {
                if (addedLinks >= MAX_LINKS_PER_ARTIST) break;

                const targetId = nameToId.get(relatedName.toLowerCase());
                if (!targetId || targetId === sourceId) continue;

                const key = [sourceId, targetId].sort().join("-");
                if (!linkSet.has(key)) {
                    linkSet.add(key);
                    links.push({ source: sourceId, target: targetId });
                    addedLinks++;
                }
            }
        });

        setGraphData({ nodes: [...artistNodes, ...labelNodes], links: [] });
        setAllLinks(links);

        return [...artistNodes, ...labelNodes];
    } catch (error) {
        console.error("Failed to load artist/genre data:", error);
    }
}
