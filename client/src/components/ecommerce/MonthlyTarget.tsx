import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function MonthlyTarget() {
  const [bookedPercent, setBookedPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [boothIds, setBoothIds] = useState<string[]>([]);
  const [TotalLocations,setTotalLocation] =useState(0);
  const [bookedLocations,setBookedLocation] = useState(0);
  const series = [bookedPercent];
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val) => `${val.toFixed(0)}%`,
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Progress"],
  };

  // Step 1: Fetch booth IDs
  useEffect(() => {
    async function fetchBoothIds() {
      try {
        const { data } = await axios.get(`${BACKEND}/api/booth/`);
        const ids = data.data.map((booth: any) => booth._id);
        setBoothIds(ids);
      } catch (err) {
        console.error("Failed to fetch booths", err);
      }
    }

    fetchBoothIds();
  }, []);

  // Step 2: Fetch all locations for the booths and calculate availability
  useEffect(() => {
    async function fetchLocationStats() {
      if (boothIds.length === 0) return;

      setLoading(true);
      let totalLocations = 0;
      let availableLocations = 0;

      try {
        for (const boothId of boothIds) {
    
          const res = await axios.get(`${BACKEND}/api/location/allbooth/${boothId}`);
          const locations = res.data.data;
          totalLocations += locations.length;
          availableLocations += locations.filter(
            (loc: any) => !loc.bookedEventRegs || loc.bookedEventRegs.length === 0
          ).length;
        }
     
      

        const booked = totalLocations - availableLocations;
        const percentBooked = totalLocations > 0 ? (booked / totalLocations) * 100 : 0;
        setBookedPercent(parseFloat(percentBooked.toFixed(2)));
        setBookedLocation(booked)
        setTotalLocation(totalLocations)

      } catch (err) {
        console.error("Error fetching location data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLocationStats();
  }, [boothIds]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Monthly Target
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Location Bookings this month
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]" id="chartDarkStyle">
            {loading ? (
              <p className="text-center text-gray-400">Loading...</p>
            ) : (
              <Chart options={options} series={series} type="radialBar" height={330} />
            )}
          </div>

          {!loading && (
            <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
              {`${bookedPercent.toFixed(0)}% Booked`}
            </span>
          )}
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {loading
            ? "Calculating..."
            : `Out of ${TotalLocations} locations, ${bookedLocations} are booked hence ${bookedPercent.toFixed(2)}% are booked.`}
        </p>
      </div>
    </div>
  );
}
