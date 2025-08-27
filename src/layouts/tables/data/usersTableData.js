// layouts/tables/data/usersTableData.js
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../ontracts/contracts.css";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import MDButton from "components/MDButton";

const API_URL_USERS = "https://sharia-base-three.vercel.app/user";
const API_URL_PLANS = "https://sharia-base-three.vercel.app/plan";

// Safely read type in case backend returns `typeofuser` or `typeOfUser`
const getType = (u) => u?.typeOfUser ?? u?.typeofuser ?? "person";

export default function usersTableData() {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);

  // Add mode
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
    fk_plan_id: "",
  });

  // Edit mode
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    job_title: "",
    typeOfUser: "person",
    business_name: "",
    business_sector: "",
    phone: "",
    fk_plan_id: "",
  });

  // --- API helpers ---
  const fetchUsers = async () => {
    const { data } = await axios.get(API_URL_USERS);
    const list = Array.isArray(data) ? data : data?.data ?? [];
    setUsers(list);
  };

  const fetchPlans = async () => {
    const { data } = await axios.get(API_URL_PLANS);
    const list = Array.isArray(data) ? data : data?.data ?? [];
    setPlans(list);
  };

  const handleAdd = async () => {
    try {
      const res = await axios.post(API_URL_USERS, addForm);
      alert(res.data.message || "User added successfully");
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
        fk_plan_id: "",
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add user");
      console.error("Add user failed:", err);
    }
  };

  const saveEdit = async (id) => {
    try {
      const res = await axios.patch(`${API_URL_USERS}/${id}`, editForm);
      alert(res.data.message || "User updated successfully");
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update user");
      console.error("Edit user failed:", err);
    }
  };
  const cancelEdit = () => setEditingId(null);
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const res = await axios.delete(`${API_URL_USERS}/${id}`);
      alert(res.data.message || "User deleted successfully");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete user");
      console.error("Delete user failed:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, []);

  // --- Rows ---
  const rows = useMemo(() => {
    const baseRows = users.map((u) => {
      const isEditing = editingId === u.user_id;
      const typeVal = isEditing ? editForm.typeOfUser : getType(u);

      const planName =
        plans.find((p) => p.plan_id === (isEditing ? editForm.fk_plan_id : u.plan_id))?.plan_name ||
        "—";

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
          <MDBox display="flex" flexDirection="column" lineHeight={1}>
            <MDTypography variant="button" fontWeight="medium">
              {u.name}
            </MDTypography>
            <MDTypography variant="caption" color="success">
              {u.email}
            </MDTypography>
          </MDBox>
        ),

        plan: isEditing ? (
          <TextField
            select
            className="wi"
            label="Plan"
            size="medium"
            value={plans.find((p) => p.plan_id === editForm.fk_plan_id)?.plan_name || ""}
            onChange={(e) => {
              const selectedPlan = plans.find((p) => p.plan_name === e.target.value);
              setEditForm((f) => ({
                ...f,
                fk_plan_id: selectedPlan?.plan_id || "",
              }));
            }}
          >
            {plans.map((p) => (
              <MenuItem key={p.plan_id} value={p.plan_name}>
                {p.plan_name}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <MDTypography variant="caption">{planName}</MDTypography>
        ),

        job_title: isEditing ? (
          <TextField
            label="Job Title"
            size="small"
            value={editForm.job_title}
            onChange={(e) => setEditForm((f) => ({ ...f, job_title: e.target.value }))}
          />
        ) : (
          <MDTypography variant="caption">{u.job_title}</MDTypography>
        ),

        typeOfUser: isEditing ? (
          <MDBox display="flex" flexDirection="column" gap={1}>
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

            {editForm.typeOfUser === "business" && (
              <>
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
              </>
            )}
          </MDBox>
        ) : (
          <MDBadge
            badgeContent={typeVal === "person" ? "person" : "business"}
            color={typeVal === "business" ? "info" : "success"}
            variant="gradient"
            size="sm"
          />
        ),

        phone: isEditing ? (
          <TextField
            label="Phone"
            size="small"
            value={editForm.phone}
            onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
          />
        ) : (
          <MDTypography variant="caption">{u.phone || "—"}</MDTypography>
        ),

        action: isEditing ? (
          <MDBox display="flex" gap={1}>
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
          <MDBox display="flex" gap={1}>
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

    // Add row
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
            <TextField
              label="Password"
              type="password"
              size="small"
              value={addForm.password}
              onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
            />
          </MDBox>
        ),

        plan: (
          <TextField
            select
            label="Plan"
            size="small"
            value={plans.find((p) => p.plan_id === addForm.fk_plan_id)?.plan_name || ""}
            onChange={(e) => {
              const selectedPlan = plans.find((p) => p.plan_name === e.target.value);
              setAddForm((f) => ({
                ...f,
                fk_plan_id: selectedPlan?.plan_id || "",
              }));
            }}
          >
            {plans.map((p) => (
              <MenuItem key={p.plan_id} value={p.plan_name}>
                {p.plan_name}
              </MenuItem>
            ))}
          </TextField>
        ),

        job_title: (
          <TextField
            label="Job Title"
            size="small"
            value={addForm.job_title}
            onChange={(e) => setAddForm((f) => ({ ...f, job_title: e.target.value }))}
          />
        ),

        typeOfUser: (
          <MDBox display="flex" flexDirection="column" gap={1}>
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

            {addForm.typeOfUser === "business" && (
              <>
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
              </>
            )}
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
  }, [users, plans, adding, addForm, editingId, editForm]);

  const addButton = (
    <MDButton
      variant="gradient"
      color="success"
      onClick={() => {
        setEditingId(null);
        setAdding(true);
      }}
    >
      + Add User
    </MDButton>
  );

  return {
    columns: [
      { Header: "Author", accessor: "author", width: "25%", align: "left" },
      { Header: "Plan", accessor: "plan", width: "15%", align: "center" },
      { Header: "Job Title", accessor: "job_title", width: "20%", align: "left" },
      { Header: "Type of user", accessor: "typeOfUser", width: "15%", align: "center" },
      { Header: "Phone", accessor: "phone", width: "15%", align: "center" },
      { Header: "Action", accessor: "action", width: "10%", align: "center" },
    ],
    rows,
    addButton,
  };
}
