export default function ArtistAddOrRemoveButton({ userId, selectedNode, isAdding, isRemoving, onAdd, onRemove }) {
    if (!userId) return null;
    if (isAdding) return <div style={buttonStyles.adding}>Adding artist...</div>;
    if (isRemoving) return <div style={buttonStyles.adding}>Removing artist...</div>;

    const isTagged = selectedNode.userTags?.includes(userId);

    return (
        <button
            onClick={isTagged ? onRemove : onAdd}
            style={isTagged ? buttonStyles.remove : buttonStyles.add}
        >
            {isTagged ? "Remove" : "Add"}
        </button>
    );
}

const baseButtonStyle = {
    marginTop: "6px",
    marginBottom: "8px",
    fontSize: "13px",
    border: "1px solid #555",
    padding: "6px 10px",
    borderRadius: "4px",
    textAlign: "center"
};

const buttonStyles = {
    add: {
        ...baseButtonStyle,
        backgroundColor: "#2a2a2a",
        color: "#fff",
        cursor: "pointer"
    },
    remove: {
        ...baseButtonStyle,
        backgroundColor: "#502a2a",
        color: "#fff",
        cursor: "pointer"
    },
    adding: {
        ...baseButtonStyle,
        backgroundColor: "#444",
        color: "#ccc"
    }
};