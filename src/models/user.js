export class User {
    constructor({ id, display_name, email, images, topSpotifyIds }) {
        this.id = id;
        this.display_name = display_name;
        this.email = email;
        this.images = images;
        this.topSpotifyIds = topSpotifyIds;
        this.topIdSet = new Set(topSpotifyIds);
    }

    isTopArtist(spotifyId) {
        return this.topIdSet.has(spotifyId);
    }

    getImageUrl() {
        return this.images?.[0]?.url ?? null;
    }
}