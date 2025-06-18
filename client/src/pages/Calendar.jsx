import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import PageMeta from "../components/common/PageMeta";
import axios from "axios";

const Calendar = () => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const calendarRef = useRef(null);
  const baseUrl = import.meta.env.VITE_BACKEND_URL;;

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        // Fetch events
        const eventRes = await axios.get(`${baseUrl}/api/event`);
        const upcomingEvents = eventRes.data.data.filter((event) => new Date(event.dateFrom) >= new Date(today));
        const formattedEvents = upcomingEvents.map((event) => ({
          id: `event-${event._id}`,
          title: event.title,
          start: event.dateFrom,
          end: event.dateTo,
          color: "#10b981", // Tailwind emerald-500
          extendedProps: {
            type: "event",
            theme: event.theme,
          },
        }));
        

        // Fetch schedules
        const scheduleRes = await axios.get(`${baseUrl}/api/schedule`);
        const formattedSchedules = scheduleRes.data
  .filter(schedule => schedule.StartTime && schedule.EndTime && schedule.event?.dateFrom)
  .map((schedule) => {
    // Extract date from event and format to YYYY-MM-DD
    const eventDate = new Date(schedule.event.dateFrom).toISOString().split("T")[0];

    return {
      id: `schedule-${schedule._id}`,
      title: schedule.title || `Schedule: ${schedule.event?.title || "Untitled"}`,
      start: `${eventDate}T${schedule.StartTime}`,
      end: `${eventDate}T${schedule.EndTime}`,
      color: "#f59e0b", // Tailwind amber-500
      extendedProps: {
        type: "schedule",
        relatedEvent: schedule.event?.title,
      },
    };
  });

        console.log(formattedSchedules)

        setCalendarEvents([...formattedEvents, ...formattedSchedules]);
      } catch (error) {
        console.error("Failed to fetch calendar data", error);
      }
    };

    fetchCalendarData();
  }, []);

  return (
    <>
      <PageMeta
        title="Event Calendar"
        description="Displays events and schedules for upcoming dates"
      />
      <div className="w-full px-2 sm:px-6 md:px-10 py-6">
        <div className="rounded-2xl shadow-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] max-w-5xl mx-auto overflow-hidden">
          <div className="p-4 md:p-6">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              height="auto"
              events={calendarEvents}
              eventContent={renderEventContent}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo) => {
  const type = eventInfo.event.extendedProps?.type;
  const bgColor =
    type === "event"
      ? "bg-gradient-to-r from-green-500 to-green-600"
      : "bg-gradient-to-r from-amber-500 to-amber-600";

  return (
    <div className={`px-2 py-1 text-xs sm:text-sm font-semibold text-white ${bgColor} rounded shadow-sm`}>
      {eventInfo.event.title}
    </div>
  );
};

export default Calendar;
