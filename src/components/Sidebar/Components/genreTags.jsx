import {toTitleCase} from "../../../utils/textUtils.js";

export default function GenreTags({ genres, getGenreColor }) {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", marginBottom: "10px" }}>
            {genres.map((genre, i) => (
                <span
                    key={i}
                    style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#000",
                        backgroundColor: getGenreColor(genre)
                    }}
                >
                    {toTitleCase(genre)}
                </span>
            ))}
        </div>
    );
}
