// layouts/tables/data/filesTableData.js
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../contracts.css";
// MUI + Material Dashboard components
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const API_URL_FILES = "https://sharia-base-three.vercel.app/upload";

export default function contractsDataTable() {
  const [files, setFiles] = useState([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [addForm, setAddForm] = useState({
    file_name: "",
    user_id: "",
    original_version: "",
    last_edits_version: "",
    summary: "",
  });

  const [editForm, setEditForm] = useState({
    file_name: "",
    user_id: "",
    original_version: "",
    last_edits_version: "",
    summary: "",
  });

  // --- API helpers ---
  const fetchFiles = async () => {
    try {
      const { data } = await axios.get(API_URL_FILES);
      setFiles(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const handleAdd = async () => {
    await axios.post(API_URL_FILES, addForm);
    setAdding(false);
    setAddForm({
      file_name: "",
      user_id: "",
      original_version: "",
      last_edits_version: "",
      summary: "",
    });
    fetchFiles();
  };

  const startEdit = (f) => {
    setEditingId(f.file_id);
    setEditForm({
      file_name: f.file_name || "",
      user_id: f.user_id || "",
      original_version: f.original_version || "",
      last_edits_version: f.last_edits_version || "",
      summary: f.summary || "",
    });
  };

  const saveEdit = async (id) => {
    await axios.patch(`${API_URL_FILES}/${id}`, editForm);
    setEditingId(null);
    fetchFiles();
  };

  const cancelEdit = () => setEditingId(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    await axios.delete(`${API_URL_FILES}/${id}`);
    fetchFiles();
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // --- Helpers: pretty Arabic HTML in a new tab ---

  const escapeHtml = (s = "") =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Detect the “clauses map” like { "1": "(البند الاول) ...", "2": "(البند الثاني) ..." }
  const isClauseMap = (v) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) return false;
    const keys = Object.keys(v);
    if (!keys.length) return false;
    return keys.every((k) => /^\d+$/.test(k) && typeof v[k] === "string");
  };

  // Build HTML list from the clauses object
  const buildClauseListHtml = (title, obj) => {
    // sort numerically by key
    const entries = Object.entries(obj).sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10));

    const items = entries
      .map(([key, text]) => {
        // text like "(البند الاول) ...."
        // extract title inside (…) then the rest
        let clauseTitle = "";
        let clauseBody = text || "";
        const m = clauseBody.match(/^\s*\(([^)]+)\)\s*(.*)$/);
        if (m) {
          clauseTitle = m[1]; // e.g., "البند الاول"
          clauseBody = m[2];
        }
        // fallback title if not found
        const shownTitle = clauseTitle
          ? `البند ${clauseTitle.replace(/^البند\s*/, "")}`
          : `البند ${key}`;
        return `<li><strong>${escapeHtml(shownTitle)}:</strong> ${escapeHtml(clauseBody)}</li>`;
      })
      .join("");

    return `
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(title)}</title>
          <style>
            body { font-family: "Tahoma", "Segoe UI", Arial, sans-serif; background:#f8f9fb; margin:0; padding:24px; direction: rtl; }
            .wrap { max-width: 900px; margin: 0 auto; background:#fff; border-radius:12px; padding:24px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
            h2 { margin: 0 0 16px; font-size: 22px; }
            ul { margin: 0; padding-inline-start: 1.2rem; }
            li { margin: 8px 0; line-height: 1.8; }
            strong { font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <h2>${escapeHtml(title)}</h2>
            <ul>
              ${items}
            </ul>
          </div>
        </body>
      </html>
    `;
  };

  const buildJsonPreHtml = (title, value) => {
    const pretty = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    return `
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(title)}</title>
          <style>
            body { font-family: monospace; padding: 20px; background: #f9f9f9; direction: rtl; }
            .wrap { max-width: 900px; margin: 0 auto; }
            pre { background: #272822; color: #f8f8f2; padding: 16px; border-radius: 10px; white-space: pre-wrap; word-break: break-word; }
            h2 { font-family: Arial, sans-serif; margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <h2>${escapeHtml(title)}</h2>
            <pre>${escapeHtml(pretty)}</pre>
          </div>
        </body>
      </html>
    `;
  };

  const openValueInNewTab = (title, value) => {
    const html = isClauseMap(value)
      ? buildClauseListHtml(title, value)
      : buildJsonPreHtml(title, value);

    const tab = window.open();
    if (!tab) return alert("Popup blocked. Please allow popups for this site.");
    tab.document.open();
    tab.document.write(html);
    tab.document.close();
  };

  // --- Rows ---
  const rows = useMemo(() => {
    const baseRows = files.map((f) => {
      const isEditing = editingId === f.file_id;

      return {
        file_id: <MDTypography variant="caption">{f.file_id}</MDTypography>,

        file_name: isEditing ? (
          <TextField
            size="small"
            value={editForm.file_name}
            onChange={(e) => setEditForm((p) => ({ ...p, file_name: e.target.value }))}
          />
        ) : (
          <MDTypography variant="button">{f.file_name}</MDTypography>
        ),

        user_name: <MDTypography variant="caption">{f.user_name}</MDTypography>,

        original_version: f.original_version ? (
          <MDTypography
            variant="caption"
            sx={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => openValueInNewTab(`${f.file_name} - النسخة الأصلية`, f.original_version)}
          >
            {f.file_name} (النسخة الأصلية)
          </MDTypography>
        ) : (
          <MDTypography variant="caption">—</MDTypography>
        ),

        last_edits_version: f.last_edits_version ? (
          <MDTypography
            variant="caption"
            sx={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => openValueInNewTab(`${f.file_name} - آخر تعديلات`, f.last_edits_version)}
          >
            {f.file_name} (آخر تعديلات)
          </MDTypography>
        ) : (
          <MDTypography variant="caption">—</MDTypography>
        ),

        summary: f.summary ? (
          <MDTypography
            variant="caption"
            sx={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => openValueInNewTab(`${f.file_name} - ملخص`, f.summary)}
          >
            {f.file_name} (ملخص)
          </MDTypography>
        ) : (
          <MDTypography variant="caption">—</MDTypography>
        ),

        action: isEditing ? (
          <MDBox display="flex" gap={1}>
            <MDButton
              variant="gradient"
              color="success"
              size="small"
              onClick={() => saveEdit(f.file_id)}
            >
              Save
            </MDButton>
            <MDButton variant="outlined" color="secondary" size="small" onClick={cancelEdit}>
              Cancel
            </MDButton>
          </MDBox>
        ) : (
          <MDBox display="flex" gap={1}>
            <MDButton variant="text" color="info" size="small" onClick={() => startEdit(f)}>
              Edit
            </MDButton>
            <MDButton
              variant="text"
              color="error"
              size="small"
              onClick={() => handleDelete(f.file_id)}
            >
              Delete
            </MDButton>
          </MDBox>
        ),
      };
    });

    // Optional “add” row (kept like your original):
    if (adding) {
      baseRows.unshift({
        file_id: "—",
        file_name: (
          <TextField
            size="small"
            value={addForm.file_name}
            onChange={(e) => setAddForm((p) => ({ ...p, file_name: e.target.value }))}
          />
        ),
        user_name: (
          <TextField
            size="small"
            value={addForm.user_id}
            onChange={(e) => setAddForm((p) => ({ ...p, user_id: e.target.value }))}
            placeholder="Enter User ID"
          />
        ),
        original_version: (
          <TextField
            size="small"
            value={addForm.original_version}
            onChange={(e) => setAddForm((p) => ({ ...p, original_version: e.target.value }))}
            placeholder="JSON or text"
          />
        ),
        last_edits_version: (
          <TextField
            size="small"
            value={addForm.last_edits_version}
            onChange={(e) => setAddForm((p) => ({ ...p, last_edits_version: e.target.value }))}
            placeholder="JSON or text"
          />
        ),
        summary: (
          <TextField
            size="small"
            value={addForm.summary}
            onChange={(e) => setAddForm((p) => ({ ...p, summary: e.target.value }))}
            placeholder="JSON or text"
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
  }, [files, adding, addForm, editingId, editForm]);

  const addButton = (
    <MDButton
      variant="gradient"
      className="darkgreen"
      onClick={() => {
        setEditingId(null);
        setAdding(true);
      }}
    >
      + Add File
    </MDButton>
  );

  return {
    columns: [
      { Header: "ID", accessor: "file_id", align: "center" },
      { Header: "File Name", accessor: "file_name", align: "left" },
      { Header: "User", accessor: "user_name", align: "left" },
      { Header: "Original Version", accessor: "original_version", align: "center" },
      { Header: "Last Edits Version", accessor: "last_edits_version", align: "center" },
      { Header: "Summary", accessor: "summary", align: "center" },
      { Header: "Action", accessor: "action", align: "center" },
    ],
    rows,
    addButton,
  };
}
