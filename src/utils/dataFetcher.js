import { getBackendUrl, getIngestorUrl } from "./apiBase.js";

export async function fetchTopArtistData() {
    try {
        const res = await fetch(`${getBackendUrl()}/api/artists/top?max=1000`);
        const artistData = await res.json();
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

export async function fetchCustomArtistAndLinkData(max = 1000, user_id = null) {
    try {
        const res = await fetch(user_id
            ? `${getBackendUrl()}/api/artists/by-usertag/${user_id}`
            : `${getBackendUrl()}/api/artists/custom?max=${max}`
        );
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

export async function fetchLastSync() {
    try {
        const res = await fetch(`${getBackendUrl()}/api/metadata/last-sync`);
        const json = await res.json();
        return json.lastSync || null;
    } catch (error) {
        console.error("Failed to fetch lastSync metadata:", error);
        return null;
    }
}

export async function fetchAllGenres() {
    const res = await fetch(`${getBackendUrl()}/api/genres/all`);
    return res.json();
}

export async function refreshCustomArtistData(user_tag) {
    try {
        const res = await fetch(`${getIngestorUrl()}/api/refresh-custom-artists`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_tag })
        });
        if (!res.ok) throw new Error(`Failed: ${res.status} - ${await res.text()}`);
        return await res.json();
    } catch (error) {
        console.error("Failed to refresh custom artist data:", error);
        throw error;
    }
}

export async function addArtistToCustomGraph(selectedNode, userId) {
    try {
        const payload = {
            user_tag: userId,
            spotify_id: selectedNode.spotifyId
        };
        const res = await fetch(`${getIngestorUrl()}/api/add-custom-artist`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`Server returned ${res.status}`);
        }

        const cacheClearRes = await fetch(`${getBackendUrl()}/api/cache?key=artists:by-usertag:${userId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (cacheClearRes.ok) {
            alert("Artist added and cache cleared!");
        } else {
            alert("Artist added, but cache not cleared.");
        }

    } catch (err) {
        console.error("Failed to add artist:", err);
        alert("Failed to add artist to custom graph.");
    }
}
