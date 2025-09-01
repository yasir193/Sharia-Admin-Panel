// layouts/tables/data/plansRequestsTableData.js
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const API_URL_PENDING = "http://localhost:3000/admin/pending";
const API_URL_APPROVE = "http://localhost:3000/admin/approve";
const API_URL_REJECT = "http://localhost:3000/admin/reject";
const API_URL_USER = "http://localhost:3000/user";

export default function plansRequestsTableData() {
  const [requests, setRequests] = useState([]);

  // Fetch pending requests + enrich with user plan
  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(API_URL_PENDING);
      const list = Array.isArray(data) ? data : data?.data ?? [];

      // Fetch each user’s current plan
      const enriched = await Promise.all(
        list.map(async (r) => {
          try {
            const resUser = await axios.get(`${API_URL_USER}/${r.user_id}/plan`);
            return {
              ...r,
              plan_name: resUser.data?.plan_name || "—",
            };
          } catch (err) {
            console.error("Error fetching user plan:", err);
            return { ...r, plan_name: "—" };
          }
        })
      );

      setRequests(enriched);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    }
  };

  // Handle approve/reject
  const handleAction = async (id, action) => {
    try {
      if (action === "approve") {
        await axios.patch(`${API_URL_APPROVE}/${id}`);
      } else {
        await axios.patch(`${API_URL_REJECT}/${id}`);
      }
      // Remove row immediately
      setRequests((prev) => prev.filter((r) => r.request_id !== id));
    } catch (err) {
      console.error(`${action} failed:`, err);
      alert(`${action} failed`);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Build rows for the table
  const rows = useMemo(() => {
    return requests.map((r) => ({
      user: (
        <MDBox display="flex" flexDirection="column" lineHeight={1}>
          <MDTypography variant="button" fontWeight="medium">
            {r.user_name}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {r.email}
          </MDTypography>
        </MDBox>
      ),
      plan: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {r.plan_name}
        </MDTypography>
      ),
      status: (
        <MDTypography variant="caption" color="warning" fontWeight="medium">
          {r.status}
        </MDTypography>
      ),
      date: (
        <MDTypography variant="caption" color="text">
          {new Date(r.request_date).toLocaleDateString()}
        </MDTypography>
      ),
      action: (
        <MDBox display="flex" gap={1}>
          <MDButton
            variant="gradient"
            color="success"
            size="small"
            onClick={() => handleAction(r.request_id, "approve")}
          >
            Approve
          </MDButton>
          <MDButton
            variant="gradient"
            color="error"
            size="small"
            onClick={() => handleAction(r.request_id, "reject")}
          >
            Reject
          </MDButton>
        </MDBox>
      ),
    }));
  }, [requests]);

  return {
    columns: [
      { Header: "User", accessor: "user", align: "left" },
      { Header: "Plan", accessor: "plan", align: "center" },
      { Header: "Status", accessor: "status", align: "center" },
      { Header: "Date", accessor: "date", align: "center" },
      { Header: "Action", accessor: "action", align: "center" },
    ],
    rows,
  };
}
