import { getBackendUrl, getIngestorUrl } from "./apiBase.js";
import {refreshTop1000Cache} from "../cache/top1000.js";

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
        const addArtistRes = await fetch(`${getIngestorUrl()}/api/custom-artist`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!addArtistRes.ok) throw new Error(`Server returned ${addArtistRes.status}`);

        const addArtistJson = await addArtistRes.json();

        const deleteCacheTopArtistRes = await fetch(`${getBackendUrl()}/api/cache?key=artistGraph:top:1000`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });
        if (!deleteCacheTopArtistRes.ok) {
            alert(`Something went wrong deleting the cache data of the top 1000 artists`)
        }

        const cacheUserClearRes = await fetch(`${getBackendUrl()}/api/cache?key=artists:by-usertag:${userId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (cacheUserClearRes.ok) {
            await refreshTop1000Cache();
            return addArtistJson;
        } else {
            alert("Artist added, but cache not cleared.");
        }


    } catch (err) {
        console.error("Failed to add artist:", err);
        alert("Failed to add artist to custom graph.");
    }
}

export async function removeArtistFromCustomGraph(selectedNode, userId) {
    try {
        const payload = {
            user_tag: userId,
            spotify_id: selectedNode.spotifyId
        };

        const removeArtistRes = await fetch(`${getIngestorUrl()}/api/remove-custom-artist-usertag`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!removeArtistRes.ok) {
            const errText = await removeArtistRes.text();
            throw new Error(`Server returned ${removeArtistRes.status}: ${errText}`);
        }

        const removeArtistJson = await removeArtistRes.json();

        const cacheClearRes = await fetch(`${getBackendUrl()}/api/cache?key=artists:by-usertag:${userId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (cacheClearRes.ok) {
            return removeArtistJson;
        } else {
            console.warn("Artist removed, but cache not cleared.");
            return {
                ...removeArtistJson,
                warning: "Artist removed, but cache not cleared."
            };
        }

    } catch (err) {
        console.error("Failed to remove artist:", err);
        alert("Failed to remove artist from custom graph.");
    }
}

export async function initializeUserIfNeeded(userId, topSpotifyIds) {
    if (!userId || !Array.isArray(topSpotifyIds) || topSpotifyIds.length === 0) {
        console.warn("Skipping user initialization: invalid input");
        return;
    }

    try {
        await fetch(`${getBackendUrl()}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_tag: userId,
                spotify_ids: topSpotifyIds
            })
        });
    } catch (err) {
        console.warn(`User init request failed for ${userId}:`, err.message);
    }
}

export async function fetchUserTopArtistGraph(userId, topSpotifyIds) {
    console.log(userId);
    console.log(topSpotifyIds);
    if (!userId || !Array.isArray(topSpotifyIds) || topSpotifyIds.length === 0) {
        throw new Error("Invalid input for fetchUserTopArtistGraph");
    }

    const response = await fetch(`${getBackendUrl()}/api/graph/user/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotify_ids: topSpotifyIds })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user top graph: ${response.status} - ${errorText}`);
    }

    return await response.json(); // { nodes, links, foundCount, totalCount, progress }
}
