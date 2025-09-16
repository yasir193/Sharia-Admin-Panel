import { useEffect, useState } from "react";
import axios from "axios";

const API_URL_STATS = "https://template-olive-one.vercel.app/admin/dashboard-stats";

export default function useWeeklyRegistrations() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: { label: "Registrations", data: [] },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        const { data } = await axios.get(API_URL_STATS);
        if (data?.weeklyRegistrations) {
          setChartData({
            labels: data.weeklyRegistrations.labels,
            datasets: {
              label: data.weeklyRegistrations.datasets.label,
              data: data.weeklyRegistrations.datasets.data,
            },
          });
        }
      } catch (err) {
        console.error("Error fetching weekly registrations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeekly();
  }, []);

  return { chartData, loading };
}
