export default function TopTracks({ tracks }) {
    if (!tracks?.length) return null;

    return (
        <div style={{ marginTop: "12px" }}>
            <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>Top Tracks</div>
            <ul style={{ paddingLeft: "16px", marginTop: "4px", lineHeight: "1.5" }}>
                {tracks.slice(0, 5).map(track => (
                    <li key={track.id}>{track.name}</li>
                ))}
            </ul>
        </div>
    );
}
