import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../api/axios"; // your configured axios instance
import Loader from "../components/Loader"; // your loader component

const PencilSVG = (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
    <path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9.5 9.5a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.65-.65l1.5-4a.5.5 0 0 1 .11-.168l9.5-9.5zM11.207 2L3 10.207V13h2.793L14 4.793 11.207 2z" />
  </svg>
);
const TrashSVG = (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
    <path d="M5.5 5.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0v-8a.5.5 0 0 1 .5-.5zM8 5.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0v-8a.5.5 0 0 1 .5-.5zM10.5 5.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0v-8a.5.5 0 0 1 .5-.5z" />
    <path
      fillRule="evenodd"
      d="M14.5 3a1 1 0 0 1-1 1H13v9.5A2.5 2.5 0 0 1 10.5 16h-5A2.5 2.5 0 0 1 3 13.5V4h-.5a1 1 0 0 1 0-2H5V1.5A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5V2h2.5a1 1 0 0 1 1 1zm-9-1v1h5V2h-5z"
    />
  </svg>
);

export default function HomePage() {
  const roleName = useSelector((state) => state.auth.role); // e.g. "Admin"

  // Role permissions
  const [roleDoc, setRoleDoc] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // Quotes management
  const [quotes, setQuotes] = useState([]);
  const [newQuote, setNewQuote] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [errorQuotes, setErrorQuotes] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  // Derived permission flags for easier checks
  const canView = roleDoc?.permissions.some(
    (p) => p.name.toLowerCase() === "view"
  );
  const canCreate = roleDoc?.permissions.some(
    (p) => p.name.toLowerCase() === "create"
  );
  const canUpdate = roleDoc?.permissions.some(
    (p) => p.name.toLowerCase() === "update"
  );
  const canDelete = roleDoc?.permissions.some(
    (p) => p.name.toLowerCase() === "delete"
  );

  // Fetch role permissions
  useEffect(() => {
    if (!roleName) {
      setLoadingRole(false);
      setRoleDoc(null);
      return;
    }
    const fetchRole = async () => {
      setLoadingRole(true);
      try {
        const { data } = await axios.get(`/roles/${roleName}`);
        setRoleDoc(data);
      } catch (error) {
        console.error("Role fetch failed:", error.response?.data || error);
        setRoleDoc(null);
      } finally {
        setLoadingRole(false);
      }
    };
    fetchRole();
  }, [roleName]);

  // Fetch quotes only if user has view permission
  const fetchQuotes = async () => {
    if (!canView) {
      setQuotes([]);
      setLoadingQuotes(false);
      return;
    }
    try {
      setLoadingQuotes(true);
      const { data } = await axios.get("quotes/");
      setQuotes(data);
      setErrorQuotes("");
    } catch (err) {
      setErrorQuotes(err.response?.data?.message || "Failed to load quotes");
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [canView]);

  // Add new quote
  const addQuote = async () => {
    if (!newQuote.trim()) return;
    try {
      const { data } = await axios.post("quotes/", { text: newQuote });
      setQuotes((prev) => [data, ...prev]);
      setNewQuote("");
              window.location.reload();

    } catch (err) {
      alert(err.response?.data?.message || "Create failed");
    }
  };

  // Delete quote
  const deleteQuote = async (id) => {
    try {
      await axios.delete(`quotes/${id}`);
      setQuotes((q) => q.filter((e) => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setConfirmId(null);
    }
  };

  // Save edited quote
  const saveEdit = async () => {
    if (!editText.trim()) return;
    try {
      const { data } = await axios.post(`quotes/${editId}`, { text: editText });
      setQuotes((q) => q.map((e) => (e._id === editId ? data : e)));
      setEditId(null);
      setEditText("");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Role Permissions */}
      {loadingRole ? (
        <p>
          <Loader />
        </p>
      ) : !roleDoc ? (
        <p style={{ display: "none" }}>No permissions found.</p>
      ) : roleDoc.permissions && roleDoc.permissions.length > 0 ? (
        <ul style={{ marginBottom: "30px", display: "none" }}>
          {roleDoc.permissions.map((perm) => (
            <li key={perm._id}>{perm.name}</li>
          ))}
        </ul>
      ) : (
        <p>No permissions assigned.</p>
      )}

      {/* Delete Confirmation Modal */}
      {confirmId && canDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "25px 30px",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "350px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <p style={{ fontSize: "18px", marginBottom: "25px" }}>
              Delete this quote?
            </p>
            <button
              onClick={() => deleteQuote(confirmId)}
              style={{
                background: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "8px 20px",
                marginRight: "12px",
                cursor: "pointer",
              }}
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmId(null)}
              style={{
                background: "#6c757d",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "8px 20px",
                cursor: "pointer",
              }}
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Motivational Quotes Section */}
      <h2
        style={{ textAlign: "center", color: "#0d6efd", marginBottom: "30px" }}
      >
        Motivational Quotes
      </h2>

      {errorQuotes && (
        <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>
          {errorQuotes}
        </p>
      )}

      {/* Show quotes only if user can view */}
      {!canView ? (
        <p style={{ textAlign: "center", fontStyle: "italic" }}>
          You do not have permission to view quotes.
        </p>
      ) : loadingQuotes ? (
        <p style={{ textAlign: "center" }}>
          <Loader />
        </p>
      ) : (
        <ul
          style={{
            padding: "0",
            listStyle: "none",
            marginBottom: "30px",
            borderTop: "1px solid #ccc",
            borderBottom: "1px solid #ccc",
          }}
        >
          {quotes.length === 0 ? (
            <li
              style={{
                textAlign: "center",
                padding: "15px 0",
                fontStyle: "italic",
                color: "#666",
              }}
            >
              No quotes found.
            </li>
          ) : (
            quotes.map(({ _id, text }) => (
              <li
                key={_id}
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "14px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                {/* Quote Text or Edit Input */}
                {editId === _id && canUpdate ? (
                  <>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                      style={{
                        flexGrow: 1,
                        padding: "8px",
                        fontSize: "15px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        else if (e.key === "Escape") {
                          setEditId(null);
                          setEditText("");
                        }
                      }}
                    />
                    <button
                      onClick={saveEdit}
                      style={{
                        background: "#198754",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "8px 15px",
                        cursor: "pointer",
                      }}
                      title="Save"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditId(null);
                        setEditText("");
                      }}
                      style={{
                        background: "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "8px 15px",
                        cursor: "pointer",
                      }}
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <p
                      style={{
                        margin: 0,
                        flexGrow: 1,
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {text}
                    </p>
                    {/* Edit button only if update permission */}
                    {canUpdate && (
                      <button
                        onClick={() => {
                          setEditId(_id);
                          setEditText(text);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          marginLeft: "8px",
                          color: "#000",
                        }}
                        title="Edit"
                        aria-label={`Edit quote ${text}`}
                      >
                        {PencilSVG}
                      </button>
                    )}
                    {/* Delete button only if delete permission */}
                    {canDelete && (
                      <button
                        onClick={() => setConfirmId(_id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          marginLeft: "8px",
                          color: "#dc3545",
                        }}
                        title="Delete"
                        aria-label={`Delete quote ${text}`}
                      >
                        {TrashSVG}
                      </button>
                    )}
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      )}

      {/* Add new quote form if user can create */}
      {canCreate && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <input
            type="text"
            placeholder="Add new motivational quote..."
            value={newQuote}
            onChange={(e) => setNewQuote(e.target.value)}
            style={{
              flexGrow: 1,
              padding: "10px",
              fontSize: "16px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") addQuote();
            }}
          />
          <button
            onClick={addQuote}
            style={{
              background: "#0d6efd",
              color: "#fff",
              padding: "10px 25px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
            title="Add quote"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
