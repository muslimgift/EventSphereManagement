import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import PageMeta from "../components/common/PageMeta";
import axios from "axios";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const baseUrl = "http://localhost:3000";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await axios.get(`${baseUrl}/api/event?populate=expoCenter`);

        const upcomingEvents = response.data.data.filter((event) => {
          return new Date(event.dateFrom) >= new Date(today);
        });

        const formattedEvents = upcomingEvents.map((event) => ({
          id: event._id,
          title: event.title,
          start: event.dateFrom,
          end: event.dateTo,
          extendedProps: { theme: event.theme },
        }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Failed to fetch events", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <>
      <PageMeta
        title="Event Calendar"
        description="Displays events scheduled for upcoming dates"
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
              events={events}
              eventContent={renderEventContent}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo) => {
  return (
    <div className="px-2 py-1 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded shadow-sm">
      {eventInfo.event.title}
    </div>
  );
};

export default Calendar;
