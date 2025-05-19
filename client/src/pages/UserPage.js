import React, { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import Loader from "../components/Loader";

export default function UserPage() {
  /* ───── Core state ───── */
  const [data, setData] = useState(null); // Users list
  const [err, setErr]   = useState(null);
  const [busy, setBusy] = useState(false);

  /* ───── Fetch once ───── */
  useEffect(() => {
    API.get("/users/user")
      .then((res) => setData(res.data.data))
      .catch((e) => setErr(e.response?.data?.message || "Access denied or error"));
  }, []);

  /* ───── Delete‑user modal state ───── */
  const [delModal, setDelModal] = useState({ show: false, id: null });
  const openDelModal  = (id) => setDelModal({ show: true, id });
  const closeDelModal = ()    => setDelModal({ show: false, id: null });

  /* ───── Revoke‑session modal state ───── */
  const [revModal, setRevModal] = useState({
    show: false,
    userId: null,
    sessionId: null,
  });
  const openRevModal  = (userId, sessionId) =>
    setRevModal({ show: true, userId, sessionId });
  const closeRevModal = () =>
    setRevModal({ show: false, userId: null, sessionId: null });

  /* ───── Delete user handler ───── */
  const deleteUser = useCallback(async () => {
    const { id } = delModal;
    if (!id) return;

    setBusy(true);
    try {
      await API.delete(`/roles/deleteUser/${id}`);
      setData((prev) => prev.filter((u) => (u._id || u.id) !== id));
    } catch (e) {
      alert(e.response?.data?.message || "Error deleting user.");
    } finally {
      setBusy(false);
      closeDelModal();
    }
  }, [delModal]);

  /* ───── Revoke session handler ───── */
  const handleRevokeSession = async () => {
    const { userId, sessionId } = revModal;
    if (!userId || !sessionId) return;

    setBusy(true);
    try {
      const res = await API.post("/roles/revoke-session", { userId, sessionId });
      setData((prev) =>
        prev.map((u) =>
          (u._id || u.id) === userId
            ? { ...u, refreshTokens: res.data.sessions }
            : u
        )
      );
    } catch (e) {
      alert(e.response?.data?.message || "Error revoking session.");
    } finally {
      setBusy(false);
      closeRevModal();
    }
  };

  /* ───── Render ───── */
  if (!data && !err) return <Loader />;
  if (err) return <p className="text-danger text-center mt-5">{err}</p>;

  return (
    <div className="container">
      <h1 className="text-center mb-4 text-bg-success">Users</h1>

      <div className="m-auto w-75">
        {Array.isArray(data) && data.length > 0 ? (
          <ul className="list-group">
            {data.map((user, index) => {
              const id       = user?._id || user?.id || null;
              const key      = id || index;
              const sessions = user.refreshTokens || [];

              return (
                <li key={key} className="list-group-item">
                  {/* User row */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="w-50">{user.username}</span>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={busy}
                      onClick={() =>
                        id ? openDelModal(id) : alert("User ID missing.")
                      }
                    >
                      Delete User
                    </button>
                  </div>

                  {/* Sessions list */}
                  {sessions.length > 0 ? (
                    <ul className="list-group">
                      {sessions.map(
                        ({ sessionId, userAgent, ipAddress, expiresAt }) => (
                          <li
                            key={sessionId}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <strong>Agent:</strong> {userAgent} <br />
                              <small>
                                <strong>IP:</strong> {ipAddress} |{" "}
                                <strong>Expires:</strong>{" "}
                                {new Date(expiresAt).toLocaleString()}
                              </small>
                            </div>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              disabled={busy}
                              onClick={() => openRevModal(id, sessionId)}
                            >
                              Revoke Session
                            </button>
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <small>No active sessions</small>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center">No users found.</p>
        )}
      </div>

      {/* ───── Delete Confirmation Modal ───── */}
      {delModal.show && (
        <>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <button type="button" className="btn-close" onClick={closeDelModal} />
                </div>
                <div className="modal-body">
                  Are you sure you want to delete this user?
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeDelModal} disabled={busy}>
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={deleteUser} disabled={busy}>
                    {busy ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={closeDelModal} />
        </>
      )}

      {/* ───── Revoke Confirmation Modal ───── */}
      {revModal.show && (
        <>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Session Revoke</h5>
                  <button type="button" className="btn-close" onClick={closeRevModal} />
                </div>
                <div className="modal-body">
                  Are you sure you want to revoke this session?
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeRevModal} disabled={busy}>
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={handleRevokeSession} disabled={busy}>
                    {busy ? "Revoking…" : "Revoke"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={closeRevModal} />
        </>
      )}
    </div>
  );
}
