import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useEffect, useState } from "react";
import axios from "axios";

export default function MonthlySalesChart() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState([{ name: "Registrations", data: [] }]);
  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },

    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, regRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/event`),
          axios.get(`${BACKEND_URL}/api/register-event`),
        ]);

        const events = eventRes.data?.data || [];
        const registrations = regRes.data.events || [];
       const eventCounts = events.map((event) => {
  const count = registrations.filter((reg) => {
    return reg.event?._id?.toString() === event._id.toString();
  }).length;

  return { title: event.title, count };
});
        setCategories(eventCounts.map((e) => e.title));
        setSeries([{ name: "Booth Registered to that Event", data: eventCounts.map((e) => e.count) }]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [BACKEND_URL]);
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
         Booth booked by Exhibitors Per Event
        </h3>
        
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}
