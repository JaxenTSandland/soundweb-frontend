import {getBackendUrl, getIngestorUrl} from "./apiBase.js";

export default class DataFetcher {
    constructor(backendUrl = getBackendUrl(), ingestorUrl = getIngestorUrl()) {
        this.backendUrl = backendUrl;
        this.ingestorUrl = ingestorUrl;
    }

    async fetchTopArtistData() {
        try {
            const [artistsRes] = await Promise.all([
                fetch(`${this.backendUrl}/api/artists/top?max=1000`)
            ]);

            const artistData = await artistsRes.json();

            return {
                artistNodesRaw: artistData.nodes || [],
                links: artistData.links || [],
                lastSync: artistData.lastSync || null
            };
        } catch (error) {
            console.error("Failed to load artist/genre data:", error);
            return { artistNodesRaw: [], links: [], lastSync: null };
        }
    }

    async fetchCustomArtistAndLinkData(max = 1000, user_id = null) {
        try {
            let res = null;
            if (user_id) {
                res = await fetch(`${this.backendUrl}/api/artists/by-usertag/${user_id}`);
            } else {
                res = await fetch(`${this.backendUrl}/api/artists/custom?max=${max}`);
            }
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
            const res = await fetch(`${this.backendUrl}/api/metadata/last-sync`);
            const json = await res.json();
            return json.lastSync || null;
        } catch (error) {
            console.error("Failed to fetch lastSync metadata:", error);
            return null;
        }
    }

    async fetchAllGenres() {
        const res = await fetch(`${this.backendUrl}/api/genres/all`);
        const allGenres = await res.json();
        return allGenres;
    }

    async refreshCustomArtistData(user_tag) {
        try {
            const res = await fetch(`${this.ingestorUrl}/api/refresh-custom-artists`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user_tag })
            });
            console.log(res);
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Failed to refresh data: ${res.status} - ${errText}`);
            }

            const result = await res.json();
            console.log("Success:", result);
            return result;
        } catch (error) {
            console.error("Failed to refresh custom artist data:", error);
            throw error;
        }
    }

    async addArtistToCustomGraph(selectedNode, userId) {
        try {
            const payload = {
                user_tag: userId,
                spotify_id: selectedNode.spotifyId
            };

            console.log("Sending payload:", payload);

            const res = await fetch(`${getIngestorUrl()}/api/add-custom-artist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error(`Server returned ${res.status}`);
            } else {
                const clearCacheRes = await fetch(`${getBackendUrl()}/api/cache?key=artists:by-usertag:${userId}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" }
                });
                if (clearCacheRes.ok && res.ok)
                    alert("Artist added to your custom graph and cache cleared!");
                else
                    alert("Artist added to your custom graph and cache did not clear :(");
            }

        } catch (err) {
            console.error("Failed to add artist:", err);
            alert("Failed to add artist to custom graph.");
        }
    };


}

export function getUser() {
    return {
        id: "7717",
        name: "Jaxen Sandland",
        email: "jaxen@example.com"
    };
}
