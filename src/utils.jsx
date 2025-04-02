import CryptoJS from 'crypto-js';

// Function to hash artist names and generate unique, consistent IDs
const generateArtistId = (artistName) => {
    // Generate a SHA-256 hash of the artist name and return as a Base64 string
    return CryptoJS.SHA256(artistName).toString(CryptoJS.enc.Base64);
};

export default generateArtistId;
