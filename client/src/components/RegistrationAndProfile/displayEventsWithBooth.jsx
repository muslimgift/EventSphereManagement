import { useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import axios from "axios";
import { toast } from "react-toastify";
import Input from "../form/input/InputField";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/UserContext";

export default function DisplayEventsWithBooth() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const { user } = useContext(userContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/event?populate=expoCenter`);
      const eventsData = res.data.data;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingEvents = eventsData.filter(
        (event) => new Date(event.dateFrom) >= today
      );

      const eventsWithAvailableLocations = await Promise.all(
        upcomingEvents.map(async (event) => {
          const bookedRes = await axios.get(
            `${baseUrl}/api/register-event/booked-locations/${event._id}`
          );
          const bookedLocations = bookedRes.data.bookedLocations || [];

          const boothIds = Array.isArray(event.booths) ? event.booths : [];
          if (boothIds.length === 0)
            return { ...event, availableLocations: {} };

          const availableLocations = {};

          for (const boothObj of boothIds) {
            const boothId = boothObj._id || boothObj; // Handle both Object and string
            const boothRes = await axios.get(`${baseUrl}/api/booth/${boothId}`);
            const booth = boothRes.data.data;

            const locationRes = await axios.get(
              `${baseUrl}/api/location/booth/${boothId}`,
              {
                params: { eventId: event._id },
              }
            );

            const locations = locationRes.data.data;

            for (const loc of locations) {
              const isBooked = bookedLocations.some(
                (bl) =>
                  bl.boothId === boothId && bl.locationId === loc._id
              );

              if (!isBooked) {
                if (!availableLocations[booth.name]) {
                  availableLocations[booth.name] = [];
                }
                availableLocations[booth.name].push(loc.name);
              }
            }
          }

          return {
            ...event,
            availableLocations,
          };
        })
      );

      const filteredEvents = eventsWithAvailableLocations.filter(
        (e) => Object.keys(e.availableLocations).length > 0
      );

      setEvents(filteredEvents);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      toast.error("Failed to fetch events");
    }
  };

  const handleRegister = (eventId) => {
    navigate(`/registerevent/${eventId}`);
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-full overflow-x-auto p-4">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by event name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            {["Title", "Available Locations", "Map", "Images"].map((header) => (
              <TableCell
                key={header}
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                {header}
              </TableCell>
            ))}
            {user?.role === "exhibitors" && (
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Action
              </TableCell>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredEvents.map((event) => (
            <TableRow key={event._id}>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {event.title}
              </TableCell>

              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {Object.keys(event.availableLocations).length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {Object.entries(event.availableLocations).map(
                      ([boothName, locations], idx) => (
                        <div key={idx}>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            Booth: {boothName}
                          </span>
                          <ul className="pl-4 mt-1 list-disc">
                            {locations.map((loc, i) => (
                              <li
                                key={i}
                                className="text-gray-500 text-theme-xs dark:text-gray-400"
                              >
                                Location: {loc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                    No available locations
                  </span>
                )}
              </TableCell>

              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {event.expoCenter?.mapSvg ? (
                  event.expoCenter.mapSvg.startsWith("<svg") ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: event.expoCenter.mapSvg,
                      }}
                    />
                  ) : (
                    <img
                      src={`${baseUrl}${event.expoCenter.mapSvg}`}
                      alt="Map"
                      className="h-16 w-16 object-contain cursor-pointer"
                      onClick={() =>
                        setPreviewImage(`${baseUrl}${event.expoCenter.mapSvg}`)
                      }
                    />
                  )
                ) : (
                  "N/A"
                )}
              </TableCell>

              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {Array.isArray(event.expoCenter?.images) &&
                event.expoCenter.images.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto">
                    {event.expoCenter.images.map((img, index) => (
                      <img
                        key={index}
                        src={`${baseUrl}${img}`}
                        alt={`img-${index}`}
                        className="h-16 w-16 object-contain cursor-pointer"
                        onClick={() => setPreviewImage(`${baseUrl}${img}`)}
                      />
                    ))}
                  </div>
                ) : (
                  "N/A"
                )}
              </TableCell>

              {user?.role === "exhibitors" && (
                <TableCell className="px-5 py-4">
                  <button
                    onClick={() => handleRegister(event._id)}
                    className="px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    Register To Event
                  </button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 pt-15">
          <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 text-black bg-gray-200 rounded-full p-1 hover:bg-gray-300"
            >
              ❌
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
