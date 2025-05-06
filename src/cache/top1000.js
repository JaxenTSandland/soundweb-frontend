import { fetchTopArtistData } from "../utils/dataFetcher.js";

let top1000Cache = null;

export function getTop1000Cache() {
    return top1000Cache;
}

export function setTop1000Cache(data) {
    top1000Cache = data;
}

export async function refreshTop1000Cache() {
    const data = await fetchTopArtistData();

    const artistNodesRaw = data.artistNodesRaw;
    const links = data.links;
    const lastSync = data.lastSync;

    setTop1000Cache({
        artistNodesRaw,
        links,
        lastSync
    });
}

export function addUserTagToTop1000Node(artistId, userId) {
    if (!top1000Cache || !Array.isArray(top1000Cache.artistNodesRaw)) return;

    const node = top1000Cache.artistNodesRaw.find(n => n.id === artistId);
    if (!node) return;

    if (!node.userTags) {
        node.userTags = [userId];
    } else if (!node.userTags.includes(userId)) {
        node.userTags.push(userId);
    }
}

