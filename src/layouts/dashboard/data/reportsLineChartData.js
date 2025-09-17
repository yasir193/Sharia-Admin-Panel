import { useEffect, useState } from "react";
import axios from "axios";

const API_URL_STATS = "http://148.230.125.200:9110/api_db/admin/dashboard-stats";

export default function useMonthlyRegistrations() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: { label: "Monthly Registrations", data: [] },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthly = async () => {
      try {
        const { data } = await axios.get(API_URL_STATS);
        if (data?.monthlyRegistrations) {
          setChartData({
            labels: data.monthlyRegistrations.labels,
            datasets: {
              label: data.monthlyRegistrations.datasets.label,
              data: data.monthlyRegistrations.datasets.data,
            },
          });
        }
      } catch (err) {
        console.error("Error fetching monthly registrations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthly();
  }, []);

  return { chartData, loading };
}
