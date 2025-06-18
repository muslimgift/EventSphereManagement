import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

import { useEffect, useState } from "react";
import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function StatisticsChart() {
  const [series, setSeries] = useState([
    { name: "Events", data: [] },
    { name: "Schedules", data: [] }
  ]);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left"
    },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false }
    },
    stroke: {
      curve: "smooth",
      width: [2, 2]
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0
      }
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 }
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: "dd MMM yyyy" }
    },
    xaxis: {
      type: "category",
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"]
        }
      }
    }
  };

  useEffect(() => {
    async function fetchMonthlyStats() {
      try {
        const res = await axios.get(`${BACKEND}/api/statistics/monthly`);
        const { eventCounts, scheduleCounts } = res.data;

        setSeries([
          { name: "Events", data: eventCounts },
          { name: "Session", data: scheduleCounts }
        ]);
        
      } catch (err) {
        console.error("Failed to fetch statistics", err);
      }
    }

    fetchMonthlyStats();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Session and Events Booked this year
          </p>
        </div>
        
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
