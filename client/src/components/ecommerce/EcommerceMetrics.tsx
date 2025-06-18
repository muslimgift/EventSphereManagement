import { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

export default function EcommerceMetrics() {
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Replace with your actual backend URL if needed
        const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

        // Get registrations (attendees)
      const res = await axios.get(`${BASE_URL}/api/schedule/total-attendees`);
      setAttendeeCount(res.data.totalAttendees);

        // Get total events
        const eventRes = await axios.get(`${BASE_URL}/api/event`);
        const events = eventRes.data?.data || [];
        setEventCount(events.length);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Attendees Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Attendees
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {typeof attendeeCount === "number" ? attendeeCount : 0}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {/* You can add percentage change logic here if needed */}
            {3*attendeeCount}
          </Badge>
        </div>
      </div>

      {/* Events Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Events
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {typeof eventCount === "number" ? eventCount : 0}
            </h4>
          </div>
          <Badge color="error">
            <ArrowDownIcon />
            {/* You can add percentage change logic here if needed */}
            {2*eventCount}
          </Badge>
        </div>
      </div>
    </div>
  );
}
