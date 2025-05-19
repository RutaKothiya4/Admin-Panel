// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Dashboard.css";
import Loader from "../components/Loader";

// toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [newRole, setNewRole] = useState("");
  const [newPermission, setNewPermission] = useState("");

  // modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: "", id: "" });

  /* --------------------------- initial fetch --------------------------- */
  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        API.get("/roles"),
        API.get("/permissions"),
      ]);
      setRoles(rolesRes.data.data || []);
      setPermissions(permsRes.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch roles or permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ----------------------- toggle permission UI ------------------------ */
  const togglePermission = (roleIdx, permissionId) => {
    setRoles((prev) =>
      prev.map((role, idx) => {
        if (idx !== roleIdx) return role;
        const has = role.permissions?.some((p) => p._id === permissionId);
        const newPerms = has
          ? role.permissions.filter((p) => p._id !== permissionId)
          : [
              ...(role.permissions || []),
              permissions.find((p) => p._id === permissionId),
            ];
        return { ...role, permissions: newPerms };
      })
    );
  };

  /* ----------------------- save to backend ----------------------------- */
  const saveChanges = async () => {
    setSaving(true);
    try {
      for (const role of roles) {
        await API.post("/roles/assign-permissions", {
          roleId: role._id,
          permissions: role.permissions.map((p) => p._id),
        });
      }
      toast.success("Permissions updated ✅", { autoClose: 3000 });
      await fetchData(); // sync UI with DB
    } catch (err) {
      console.error(err);
      toast.error("Failed to update permissions", { autoClose: 3000 });
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------- add / delete helpers ------------------------ */
  const handleAddRole = async () => {
    if (!newRole.trim()) return;
    try {
      const res = await API.post("/roles", { name: newRole });
      setRoles((prev) => [...prev, res.data.data]);
      setNewRole("");
    } catch {
      toast.error("Failed to create role");
    }
  };

  const handleAddPermission = async () => {
    if (!newPermission.trim()) return;
    try {
      const res = await API.post("/permissions", { name: newPermission });
      setPermissions((prev) => [...prev, res.data.data]);
      setNewPermission("");
    } catch {
      toast.error("Failed to create permission");
    }
  };

  const confirmDelete = (type, id) => {
    setDeleteTarget({ type, id });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    const { type, id } = deleteTarget;
    setShowDeleteModal(false);
    try {
      if (type === "role") {
        await API.delete(`/roles/${id}`);
        setRoles((prev) => prev.filter((r) => r._id !== id));
        toast.success("Role deleted", { autoClose: 3000 });
      } else {
        await API.delete(`/permissions/${id}`);
        setPermissions((prev) => prev.filter((p) => p._id !== id));
        setRoles((prev) =>
          prev.map((role) => ({
            ...role,
            permissions: role.permissions?.filter((p) => p._id !== id) || [],
          }))
        );
        toast.success("Permission deleted", { autoClose: 3000 });
      }
    } catch {
      toast.error(`Failed to delete ${type}`, { autoClose: 3000 });
    }
  };

  /* --------------------------- render ---------------------------------- */
  if (loading)
    return (
      <div className="p-4">
        <Loader />
      </div>
    );
  if (error) return <div className="p-4 text-danger">{error}</div>;

  return (
    <div className="container py-5 dashboard-container">
      {/* TOASTS */}
      <ToastContainer position="top-right" hideProgressBar autoClose={3000} />

      {/* MAIN CARD */}
      <div className="card shadow rounded-lg">
        <div className="card-header bg-primary text-white text-center rounded-top">
          <h3 className="mb-0 fw-bold">Role‑Based Access Dashboard</h3>
        </div>

        <div className="card-body">
          {/* inputs */}
          <div className="row mb-4 gx-3 gy-3">
            <div className="col-md-6 d-flex gap-2">
              <input
                className="form-control formControl"
                placeholder="New Role Name"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddRole()}
              />
              <button
                className="btn btn-success btn-md"
                onClick={handleAddRole}
              >
                Add Role
              </button>
            </div>
            <div className="col-md-6 d-flex gap-2">
              <input
                className="form-control formControl"
                placeholder="New Permission Name"
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPermission()}
              />
              <button
                className="btn btn-warning btn-md"
                onClick={handleAddPermission}
              >
                Add Permission
              </button>
            </div>
          </div>

          {/* table */}
          <div className="table-responsive table-container">
            <table className="table table-bordered table-hover align-middle text-center">
              <thead className="table-light sticky-top">
                <tr>
                  <th className="role-col">Role</th>
                  {permissions.map((perm) => (
                    <th key={perm._id} className="permission-col">
                      <div className="d-flex justify-content-center align-items-center">
                        <span className="permission-name">{perm.name}</span>
                        <button
                          className="btn btn-sm ms-2 px-2 delete-perm-btn"
                          onClick={() => confirmDelete("permission", perm._id)}
                          title="Delete Permission"
                        >
                          &times;
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((role, rIdx) => (
                  <tr key={role._id}>
                    <td className="fw-semibold d-flex justify-content-between align-items-center role-name-col">
                      {role.name}
                      <button
                        className="btn btn-sm delete-role-btn"
                        onClick={() => confirmDelete("role", role._id)}
                        title="Delete Role"
                      >
                        &times;
                      </button>
                    </td>

                    {permissions.map((perm) => {
                      const has = role.permissions?.some(
                        (p) => p._id === perm._id
                      );
                      return (
                        <td key={perm._id}>
                          <div className="form-check d-flex justify-content-center align-items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={has}
                              onChange={() => togglePermission(rIdx, perm._id)}
                              id={`chk_${role._id}_${perm._id}`}
                            />
                            <label
                              htmlFor={`chk_${role._id}_${perm._id}`}
                              className={`badge rounded-pill permission-badge ${
                                has ? "bg-success" : "bg-secondary"
                              }`}
                            >
                              {has ? "Allowed" : "Denied"}
                            </label>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* save button */}
          <div className="text-end mt-4">
            <button
              className="btn btn-success px-5 fw-semibold"
              onClick={saveChanges}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* delete modal */}
      <div
        className={`modal fade ${showDeleteModal ? "show d-block" : ""}`}
        tabIndex="-1"
        aria-hidden={!showDeleteModal}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDeleteModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this {deleteTarget.type}?
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteConfirmed}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
