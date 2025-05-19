import React, { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import Loader from "../components/Loader";

export default function AdminPage() {
  /* ───── Core state ───── */
  const [data, setData] = useState(null);   // Admins list
  const [err, setErr]   = useState(null);   // Error message
  const [busy, setBusy] = useState(false);  // Block buttons while working

  /* ───── Fetch once ───── */
  useEffect(() => {
    API.get("/users/admin")
      .then((r) => setData(r.data.data))
      .catch((e) =>
        setErr(e.response?.data?.message || "Access denied or error")
      );
  }, []);

  /* ───── Delete‑admin modal state ───── */
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

  /* ───── Delete admin handler ───── */
  const deleteAdmin = useCallback(async () => {
    const { id } = delModal;
    if (!id) return;

    setBusy(true);
    try {
      await API.delete(`/roles/deleteUser/${id}`);
      setData((prev) => prev.filter((adm) => (adm._id || adm.id) !== id));
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
        prev.map((user) =>
          (user._id || user.id) === userId
            ? { ...user, refreshTokens: res.data.sessions }
            : user
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
      <h1 className="text-center mb-4 text-bg-success">Admins</h1>

      <div className="m-auto w-75">
        {Array.isArray(data) && data.length > 0 ? (
          <ul className="list-group">
            {data.map((admin, index) => {
              const id       = admin?._id || admin?.id || null;
              const key      = id || index;
              const sessions = admin.refreshTokens || [];

              return (
                <li key={key} className="list-group-item">
                  {/* Admin row */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="w-50">{admin.username}</span>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={busy}
                      onClick={() =>
                        id ? openDelModal(id) : alert("Admin ID missing.")
                      }
                    >
                      Delete
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
          <p className="text-center">No admin users found.</p>
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
                  Are you sure you want to delete this admin?
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeDelModal} disabled={busy}>
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={deleteAdmin} disabled={busy}>
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
