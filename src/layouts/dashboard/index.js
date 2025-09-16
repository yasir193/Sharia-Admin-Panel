// @mui material components
import Grid from "@mui/material/Grid";
import { CircularProgress, Skeleton, Box } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import { useEffect, useState } from "react";
import axios from "axios";
import useWeeklyRegistrations from "./data/reportsBarChartData";
import useMonthlyRegistrations from "./data/reportsLineChartData";

const API_URL_STATS = "https://template-olive-one.vercel.app/admin/dashboard-stats";

function Dashboard() {
  const { chartData: weeklyData, loading: weeklyLoading } = useWeeklyRegistrations();
  const { chartData: monthlyData, loading: monthlyLoading } = useMonthlyRegistrations();

  const [stats, setStats] = useState({
    totalUsers: 0,
    proUsersCount: 0,
    freeUsersCount: 0,
    pendingRequests: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(API_URL_STATS);
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* ==== Stats Cards ==== */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                title="Total Users"
                icon="people"
                count={stats.totalUsers}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="attach_money"
                title="Pro Users"
                count={stats.proUsersCount}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="weekend"
                title="Free Users"
                count={stats.freeUsersCount}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="priority_high"
                title="Pending Requests"
                count={stats.pendingRequests}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* ==== Charts ==== */}
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={12}>
              <MDBox mb={3}>
                {weeklyLoading ? (
                  <MDBox display="flex" justifyContent="center" alignItems="center" py={5}>
                    <span>Loading weekly registrations...</span>
                  </MDBox>
                ) : (
                  <ReportsBarChart color="info" title="Registrations per Day" chart={weeklyData} />
                )}
              </MDBox>
            </Grid>

            <Grid item xs={12} md={6} lg={12}>
              <MDBox mb={3}>
                {monthlyLoading ? (
                  <MDBox display="flex" justifyContent="center" alignItems="center" py={5}>
                    <span>Loading monthly registrations...</span>
                  </MDBox>
                ) : (
                  <ReportsLineChart
                    color="success"
                    title="Monthly Registrations"
                    chart={monthlyData}
                  />
                )}
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
