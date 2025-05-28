import {refreshTop1000Cache} from "../cache/top1000.js";

export async function fetchTopArtistData() {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/artists/top?max=1000`);
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

export async function fetchAllArtistsData() {
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${backendUrl}/api/artists/all`);
        const artistData = await res.json();
        return {
            artistNodesRaw: artistData.nodes || []
        };
    } catch (error) {
        console.error("Failed to load all artist data:", error);
        return { artistNodesRaw: [] };
    }
}

export async function fetchCustomArtistAndLinkData(max = 1000, user_id = null) {
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(user_id
            ? `${backendUrl}/api/artists/by-usertag/${user_id}`
            : `${backendUrl}/api/artists/custom?max=${max}`
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
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/metadata/last-sync`);
        const json = await res.json();
        return json.lastSync || null;
    } catch (error) {
        console.error("Failed to fetch lastSync metadata:", error);
        return null;
    }
}

export async function fetchAllGenres() {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/genres/all`);
    return res.json();
}

export async function refreshCustomArtistData(user_tag) {
    try {
        const res = await fetch(`${import.meta.env.VITE_INGESTOR_API_URL}/api/refresh-custom-artists`, {
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
        const addArtistRes = await fetch(`${import.meta.env.VITE_INGESTOR_API_URL}/api/custom-artist`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!addArtistRes.ok) throw new Error(`Server returned ${addArtistRes.status}`);

        const addArtistJson = await addArtistRes.json();

        const deleteCacheTopArtistRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cache?key=artistGraph:top:1000`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });
        if (!deleteCacheTopArtistRes.ok) {
            alert(`Something went wrong deleting the cache data of the top 1000 artists`)
        }

        const cacheUserClearRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cache?key=artists:by-usertag:${userId}`, {
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

        const removeArtistRes = await fetch(`${import.meta.env.VITE_INGESTOR_API_URL}/api/remove-custom-artist-usertag`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!removeArtistRes.ok) {
            const errText = await removeArtistRes.text();
            throw new Error(`Server returned ${removeArtistRes.status}: ${errText}`);
        }

        const removeArtistJson = await removeArtistRes.json();

        const cacheClearRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cache?key=artists:by-usertag:${userId}`, {
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

export async function fetchUserTopArtistGraph(userId) {
    if (!userId) throw new Error("Missing user ID");

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/graph/user/${userId}`);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user top graph: ${response.status} - ${errorText}`);
    }

    return await response.json(); // { nodes, links }
}

export async function fetchUserImportProgress(userId) {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/progress/user/${userId}`);

    if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`Failed to fetch import progress: ${response.status} - ${errorText}`);
        error.status = response.status;
        throw error;
    }

    return await response.json(); // { foundCount, totalCount, progress }
}

export async function fetchUserMissingArtistIds(userTag, spotifyIds) {
    if (!userTag || !Array.isArray(spotifyIds) || spotifyIds.length === 0) {
        throw new Error("Invalid input for fetchUserMissingArtistIds");
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/debug/user/${userTag}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotify_ids: spotifyIds })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch debug info: ${response.status} - ${errorText}`);
    }

    return await response.json(); // { summary, ingestedIds, missingIds }
}

export async function pingUser(userId) {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_tag: userId })
    });

    if (!res.ok) {
        const errorText = await res.text();
        const error = new Error(errorText);
        error.status = res.status;
        throw error;
    }

    return await res.json();
}

export async function handleSpotifyAuthCallback(code, codeVerifier) {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/spotify/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, code_verifier: codeVerifier })
    });

    if (!res.ok) {
        const errorText = await res.text();
        const error = new Error(errorText);
        error.status = res.status;
        throw error;
    }

    return await res.json();
}