// layouts/tables/data/usersTableData.js
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

// MUI + Material Dashboard components
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import MDButton from "components/MDButton";

// Avatar (placeholder)

const API_URL = "https://sharia-base-three.vercel.app/user";

// Safely read type in case backend returns `typeofuser` or `typeOfUser`
const getType = (u) => u?.typeOfUser ?? u?.typeofuser ?? "person";

export default function usersTableData() {
  // raw users list
  const [users, setUsers] = useState([]);

  // add mode
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    job_title: "",
    typeOfUser: "person",
    business_name: "",
    business_sector: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // edit mode
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    job_title: "",
    typeOfUser: "person",
    business_name: "",
    business_sector: "",
    phone: "",
    // password fields omitted for edit (usually not edited inline)
  });

  // --- API helpers ---
  const fetchUsers = async () => {
    const { data } = await axios.get(API_URL);
    const list = Array.isArray(data) ? data : data?.data ?? [];
    setUsers(list);
  };

  const handleAdd = async () => {
    // simple client-side check to mirror your payload
    if (addForm.password !== addForm.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    await axios.post(API_URL, addForm);
    setAdding(false);
    setAddForm({
      name: "",
      email: "",
      job_title: "",
      typeOfUser: "person",
      business_name: "",
      business_sector: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    fetchUsers();
  };

  const startEdit = (u) => {
    setEditingId(u.user_id);
    setEditForm({
      name: u.name || "",
      email: u.email || "",
      job_title: u.job_title || "",
      typeOfUser: getType(u),
      business_name: u.business_name || "",
      business_sector: u.business_sector || "",
      phone: u.phone || "",
    });
  };

  const saveEdit = async (id) => {
    const payload = { ...editForm };
    // don’t send empty optional fields as null accidentally; leave as strings
    await axios.patch(`${API_URL}/${id}`, payload);
    setEditingId(null);
    fetchUsers();
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await axios.delete(`${API_URL}/${id}`);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Derived table rows (recompute whenever users / forms / modes change) ---
  const rows = useMemo(() => {
    const baseRows = users.map((u) => {
      const isEditing = editingId === u.user_id;
      const typeVal = isEditing ? editForm.typeOfUser : getType(u);

      return {
        author: isEditing ? (
          <MDBox display="flex" flexDirection="column" gap={1}>
            <TextField
              label="Name"
              size="small"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Email"
              size="small"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
            />
          </MDBox>
        ) : (
          <MDBox display="flex" alignItems="center" lineHeight={1}>
            <MDBox ml={0} lineHeight={1}>
              <MDTypography display="block" variant="button" fontWeight="medium">
                {u.name}
              </MDTypography>
              <MDTypography variant="caption">{u.email}</MDTypography>
            </MDBox>
          </MDBox>
        ),

        function: isEditing ? (
          <MDBox display="flex" flexDirection="column" gap={1}>
            <TextField
              label="Job Title"
              size="small"
              value={editForm.job_title}
              onChange={(e) => setEditForm((f) => ({ ...f, job_title: e.target.value }))}
            />
            <TextField
              select
              label="Type"
              size="small"
              value={editForm.typeOfUser}
              onChange={(e) => setEditForm((f) => ({ ...f, typeOfUser: e.target.value }))}
            >
              <MenuItem value="person">Person</MenuItem>
              <MenuItem value="business">Business</MenuItem>
            </TextField>
          </MDBox>
        ) : (
          <MDBox lineHeight={1} textAlign="left">
            <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
              {u.job_title || "—"}
            </MDTypography>
            <MDTypography variant="caption">{typeVal}</MDTypography>
          </MDBox>
        ),

        status: isEditing ? (
          <MDBox display="flex" flexDirection="column" gap={1}>
            <TextField
              label="Business Name"
              size="small"
              value={editForm.business_name}
              onChange={(e) => setEditForm((f) => ({ ...f, business_name: e.target.value }))}
            />
            <TextField
              label="Business Sector"
              size="small"
              value={editForm.business_sector}
              onChange={(e) => setEditForm((f) => ({ ...f, business_sector: e.target.value }))}
            />
          </MDBox>
        ) : (
          <MDBox ml={-1}>
            <MDBadge
              badgeContent={typeVal === "person" ? "person" : "business"}
              color={typeVal === "business" ? "info" : "success"}
              variant="gradient"
              size="sm"
            />
          </MDBox>
        ),

        phone: isEditing ? (
          <TextField
            label="Phone"
            size="small"
            value={editForm.phone}
            onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
          />
        ) : (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {u.phone || "—"}
          </MDTypography>
        ),

        action: isEditing ? (
          <MDBox display="flex" gap={1} flexWrap="wrap">
            <MDButton
              variant="gradient"
              color="success"
              size="small"
              onClick={() => saveEdit(u.user_id)}
            >
              Save
            </MDButton>
            <MDButton variant="outlined" color="secondary" size="small" onClick={cancelEdit}>
              Cancel
            </MDButton>
          </MDBox>
        ) : (
          <MDBox display="flex" gap={1} flexWrap="wrap">
            <MDButton variant="text" color="info" size="small" onClick={() => startEdit(u)}>
              Edit
            </MDButton>
            <MDButton
              variant="text"
              color="error"
              size="small"
              onClick={() => handleDelete(u.user_id)}
            >
              Delete
            </MDButton>
          </MDBox>
        ),
      };
    });

    // Prepend the Add row when adding
    if (adding) {
      baseRows.unshift({
        author: (
          <MDBox display="flex" flexDirection="column" gap={1}>
            <TextField
              label="Name"
              size="small"
              value={addForm.name}
              onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Email"
              size="small"
              value={addForm.email}
              onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
            />
          </MDBox>
        ),
        function: (
          <MDBox display="flex" flexDirection="column" gap={1}>
            <TextField
              label="Job Title"
              size="small"
              value={addForm.job_title}
              onChange={(e) => setAddForm((f) => ({ ...f, job_title: e.target.value }))}
            />
            <TextField
              select
              label="Type"
              size="small"
              value={addForm.typeOfUser}
              onChange={(e) => setAddForm((f) => ({ ...f, typeOfUser: e.target.value }))}
            >
              <MenuItem value="person">Person</MenuItem>
              <MenuItem value="business">Business</MenuItem>
            </TextField>
          </MDBox>
        ),
        status: (
          <MDBox display="flex" flexDirection="column" gap={1}>
            <TextField
              label="Business Name"
              size="small"
              value={addForm.business_name}
              onChange={(e) => setAddForm((f) => ({ ...f, business_name: e.target.value }))}
            />
            <TextField
              label="Business Sector"
              size="small"
              value={addForm.business_sector}
              onChange={(e) => setAddForm((f) => ({ ...f, business_sector: e.target.value }))}
            />
          </MDBox>
        ),
        phone: (
          <TextField
            label="Phone"
            size="small"
            value={addForm.phone}
            onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
          />
        ),
        action: (
          <MDBox display="flex" gap={1} flexWrap="wrap">
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
  }, [users, adding, addForm, editingId, editForm]);

  // Button to open Add row (render it in the card header)
  const addButton = (
    <MDButton
      variant="gradient"
      color="info"
      onClick={() => {
        setEditingId(null); // prevent collision with edit mode
        setAdding(true);
      }}
    >
      + Add User
    </MDButton>
  );

  return {
    columns: [
      { Header: "author", accessor: "author", width: "30%", align: "left" },
      { Header: "function", accessor: "function", align: "left" },
      { Header: "status", accessor: "status", align: "center" },
      { Header: "phone", accessor: "phone", align: "center" },
      { Header: "action", accessor: "action", align: "center" },
    ],
    rows,
    addButton,
  };
}
