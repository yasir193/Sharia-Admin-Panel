// layouts/tables/data/adminsTableData.js
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import MDButton from "components/MDButton";

const API_URL_ADMINS = "https://sharia-base-three.vercel.app/admin";

export default function adminsTableData() {
  const [admins, setAdmins] = useState([]);

  // Add mode
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "admin", // default role
  });

  // Edit mode
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "admin",
  });

  // --- API helpers ---
  const fetchAdmins = async () => {
    const { data } = await axios.get(API_URL_ADMINS);
    const list = Array.isArray(data) ? data : data?.data ?? [];
    setAdmins(list);
  };

  const handleAdd = async () => {
    try {
      await axios.post(API_URL_ADMINS, addForm);
      setAdding(false);
      setAddForm({ name: "", email: "", phone: "", password: "", role: "admin" });
      fetchAdmins();
    } catch (err) {
      console.error("Add admin failed:", err);
      alert("Failed to add admin", err);
    }
  };

  const startEdit = (a) => {
    setEditingId(a.admin_id);
    setEditForm({
      name: a.name || "",
      email: a.email || "",
      phone: a.phone || "",
      role: a.role || "admin",
    });
  };

  const saveEdit = async (id) => {
    await axios.patch(`${API_URL_ADMINS}/${id}`, editForm);
    setEditingId(null);
    fetchAdmins();
  };

  const cancelEdit = () => setEditingId(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admin?")) return;
    await axios.delete(`${API_URL_ADMINS}/${id}`);
    fetchAdmins();
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // --- Rows ---
  const rows = useMemo(() => {
    const baseRows = admins.map((a) => {
      const isEditing = editingId === a.admin_id;

      return {
        name: isEditing ? (
          <TextField
            label="Name"
            size="small"
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
          />
        ) : (
          <MDTypography variant="button" fontWeight="medium">
            {a.name}
          </MDTypography>
        ),

        email: isEditing ? (
          <TextField
            label="Email"
            size="small"
            value={editForm.email}
            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
          />
        ) : (
          <MDTypography variant="caption" color="success">
            {a.email}
          </MDTypography>
        ),

        phone: isEditing ? (
          <TextField
            label="Phone"
            size="small"
            value={editForm.phone}
            onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
          />
        ) : (
          <MDTypography variant="caption">{a.phone || "—"}</MDTypography>
        ),

        role: isEditing ? (
          <TextField
            select
            label="Role"
            size="small"
            value={editForm.role}
            onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="super">Super</MenuItem>
          </TextField>
        ) : (
          <MDBadge
            badgeContent={a.role}
            color={a.role === "super" ? "info" : "success"}
            variant="gradient"
            size="sm"
          />
        ),

        action: isEditing ? (
          <MDBox display="flex" gap={1}>
            <MDButton
              variant="gradient"
              color="success"
              size="small"
              onClick={() => saveEdit(a.admin_id)}
            >
              Save
            </MDButton>
            <MDButton variant="outlined" color="secondary" size="small" onClick={cancelEdit}>
              Cancel
            </MDButton>
          </MDBox>
        ) : (
          <MDBox display="flex" gap={1}>
            <MDButton variant="text" color="info" size="small" onClick={() => startEdit(a)}>
              Edit
            </MDButton>
            <MDButton
              variant="text"
              color="error"
              size="small"
              onClick={() => handleDelete(a.admin_id)}
            >
              Delete
            </MDButton>
          </MDBox>
        ),
      };
    });

    // Add row
    if (adding) {
      baseRows.unshift({
        name: (
          <TextField
            label="Name"
            size="small"
            value={addForm.name}
            onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
          />
        ),
        email: (
          <TextField
            label="Email"
            size="small"
            value={addForm.email}
            onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
          />
        ),
        phone: (
          <TextField
            label="Phone"
            size="small"
            value={addForm.phone}
            onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
          />
        ),
        role: (
          <TextField
            select
            label="Role"
            size="small"
            value={addForm.role}
            onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="super">Super</MenuItem>
          </TextField>
        ),
        action: (
          <MDBox display="flex" gap={1}>
            <MDButton variant="gradient" color="success" size="small" onClick={handleAdd}>
              Save
            </MDButton>
            <MDButton
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => setAdding(false)}
            >
              Cancel
            </MDButton>
          </MDBox>
        ),
      });
    }

    return baseRows;
  }, [admins, adding, addForm, editingId, editForm]);

  const addButton = (
    <MDButton
      variant="gradient"
      color="success"
      onClick={() => {
        setEditingId(null);
        setAdding(true);
      }}
    >
      + Add Admin
    </MDButton>
  );

  return {
    columns: [
      { Header: "Name", accessor: "name", width: "20%", align: "left" },
      { Header: "Email", accessor: "email", width: "25%", align: "left" },
      { Header: "Phone", accessor: "phone", width: "20%", align: "center" },
      { Header: "Role", accessor: "role", width: "15%", align: "center" },
      { Header: "Action", accessor: "action", width: "20%", align: "center" },
    ],
    rows,
    addButton,
  };
}
