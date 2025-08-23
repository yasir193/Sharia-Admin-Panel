// layouts/tables/data/plansTableData.js
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

// MUI + Material Dashboard
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const API_URL = "https://sharia-base-three.vercel.app/plan";

export default function plansTableData() {
  const [plans, setPlans] = useState([]);

  // Add mode
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    plan_name: "",
    refine_requests: "",
    daily_requests_per_day: "",
    number_of_uploads: "",
  });

  // Edit mode
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    plan_name: "",
    refine_requests: "",
    daily_requests_per_day: "",
    number_of_uploads: "",
  });

  // --- API Helpers ---
  const fetchPlans = async () => {
    const { data } = await axios.get(API_URL);
    const list = Array.isArray(data) ? data : data?.data ?? [];
    setPlans(list);
  };

  const handleAdd = async () => {
    await axios.post(API_URL, addForm);
    setAdding(false);
    setAddForm({
      plan_name: "",
      refine_requests: "",
      daily_requests_per_day: "",
      number_of_uploads: "",
    });
    fetchPlans();
  };

  const startEdit = (p) => {
    setEditingId(p.plan_id);
    setEditForm({
      plan_name: p.plan_name || "",
      refine_requests: p.refine_requests || "",
      daily_requests_per_day: p.daily_requests_per_day || "",
      number_of_uploads: p.number_of_uploads || "",
    });
  };

  const saveEdit = async (id) => {
    await axios.put(`${API_URL}/${id}`, editForm);
    setEditingId(null);
    fetchPlans();
  };

  const cancelEdit = () => setEditingId(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    await axios.delete(`${API_URL}/${id}`);
    fetchPlans();
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // --- Derived rows ---
  const rows = useMemo(() => {
    const baseRows = plans.map((p) => {
      const isEditing = editingId === p.plan_id;

      return {
        name: isEditing ? (
          <TextField
            size="small"
            value={editForm.plan_name}
            onChange={(e) => setEditForm((f) => ({ ...f, plan_name: e.target.value }))}
          />
        ) : (
          <MDTypography variant="caption" fontWeight="medium">
            {p.plan_name}
          </MDTypography>
        ),
        refine: isEditing ? (
          <TextField
            size="small"
            type="number"
            value={editForm.refine_requests}
            onChange={(e) => setEditForm((f) => ({ ...f, refine_requests: e.target.value }))}
          />
        ) : (
          <MDTypography variant="caption">{p.refine_requests}</MDTypography>
        ),
        daily: isEditing ? (
          <TextField
            size="small"
            type="number"
            value={editForm.daily_requests_per_day}
            onChange={(e) => setEditForm((f) => ({ ...f, daily_requests_per_day: e.target.value }))}
          />
        ) : (
          <MDTypography variant="caption">{p.daily_requests_per_day}</MDTypography>
        ),
        uploads: isEditing ? (
          <TextField
            size="small"
            type="number"
            value={editForm.number_of_uploads}
            onChange={(e) => setEditForm((f) => ({ ...f, number_of_uploads: e.target.value }))}
          />
        ) : (
          <MDTypography variant="caption">{p.number_of_uploads}</MDTypography>
        ),
        action: isEditing ? (
          <MDBox display="flex" gap={1}>
            <MDButton
              variant="gradient"
              color="success"
              size="small"
              onClick={() => saveEdit(p.plan_id)}
            >
              Save
            </MDButton>
            <MDButton variant="outlined" color="secondary" size="small" onClick={cancelEdit}>
              Cancel
            </MDButton>
          </MDBox>
        ) : (
          <MDBox display="flex" gap={1}>
            <MDButton variant="text" color="info" size="small" onClick={() => startEdit(p)}>
              Edit
            </MDButton>
            <MDButton
              variant="text"
              color="error"
              size="small"
              onClick={() => handleDelete(p.plan_id)}
            >
              Delete
            </MDButton>
          </MDBox>
        ),
      };
    });

    if (adding) {
      baseRows.unshift({
        name: (
          <TextField
            label="Plan Name"
            size="small"
            value={addForm.plan_name}
            onChange={(e) => setAddForm((f) => ({ ...f, plan_name: e.target.value }))}
          />
        ),
        refine: (
          <TextField
            label="Refine Requests"
            type="number"
            size="small"
            value={addForm.refine_requests}
            onChange={(e) => setAddForm((f) => ({ ...f, refine_requests: e.target.value }))}
          />
        ),
        daily: (
          <TextField
            label="Daily Requests"
            type="number"
            size="small"
            value={addForm.daily_requests_per_day}
            onChange={(e) => setAddForm((f) => ({ ...f, daily_requests_per_day: e.target.value }))}
          />
        ),
        uploads: (
          <TextField
            label="Uploads"
            type="number"
            size="small"
            value={addForm.number_of_uploads}
            onChange={(e) => setAddForm((f) => ({ ...f, number_of_uploads: e.target.value }))}
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
  }, [plans, adding, addForm, editingId, editForm]);

  const addButton = (
    <MDButton
      variant="gradient"
      color="info"
      onClick={() => {
        setEditingId(null);
        setAdding(true);
      }}
    >
      + Add Plan
    </MDButton>
  );

  return {
    columns: [
      { Header: "Plan Name", accessor: "name", align: "left" },
      { Header: "Refine Requests", accessor: "refine", align: "center" },
      { Header: "Daily Requests", accessor: "daily", align: "center" },
      { Header: "Uploads", accessor: "uploads", align: "center" },
      { Header: "Action", accessor: "action", align: "center" },
    ],
    rows,
    addButton,
  };
}
