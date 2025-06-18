import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function DisplayEvent() {
  const [events, setEvents] = useState([]);
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [locationCounts, setLocationCounts] = useState({});
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BACKEND_URL;;
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/event`);
      const eventsData = res.data.data;
      setEvents(eventsData);

      const counts = {};

      for (const event of eventsData) {
        let totalAvailable = 0;

        if (Array.isArray(event.booths)) {
          for (const booth of event.booths) {
            const boothId =
              typeof booth === "object" && booth !== null ? booth._id : booth;

            try {
              const locRes = await axios.get(
                `${baseUrl}/api/location/booth/${boothId}`,
                {
                  params: { eventId: event._id },
                }
              );

              totalAvailable += locRes.data.data?.length || 0;
            } catch (err) {
              console.error("Error fetching locations for booth", boothId, err);
            }
          }
        }

        counts[event._id] = totalAvailable;
      }

      setLocationCounts(counts);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      toast.error("Failed to fetch events");
    }
  };

  const handleViewRegistrations = (eventId) => {
    navigate(`/registerevent/${eventId}`);
  };

  const filteredEvents = events.filter((event) => {
    const from = filterFromDate ? new Date(filterFromDate) : null;
    const to = filterToDate ? new Date(filterToDate) : null;
    const eventDate = new Date(event.dateFrom);
    if (from && eventDate < from) return false;
    if (to && eventDate > to) return false;
    return true;
  });

  return (
    <div className="max-w-full overflow-x-auto">
      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <Label>From Date</Label>
          <Input
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
          />
        </div>
        <div>
          <Label>To Date</Label>
          <Input
            type="date"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setFilterFromDate("");
            setFilterToDate("");
          }}
          variant="outline"
        >
          Clear Filters
        </Button>
      </div>

      <Table>
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            {[
              "Title",
              "Theme",
              "Description",
              "From Date",
              "To Date",
              "Booths",
              "Available Locations",
              "Expo Center",
              "Expo Image",
              "Expo Map",
              "Action",
            ].map((text) => (
              <TableCell
                key={text}
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                {text}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {filteredEvents.map((event) => (
            <TableRow key={event._id}>
              <TableCell className="px-5 py-4">{event.title}</TableCell>
              <TableCell className="px-5 py-4">{event.theme}</TableCell>
              <TableCell className="px-5 py-4">{event.description}</TableCell>
              <TableCell className="px-5 py-4">
                {new Date(event.dateFrom).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-5 py-4">
                {new Date(event.dateTo).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-5 py-4">
                {Array.isArray(event.booths)
                  ? event.booths
                      .map((b) =>
                        typeof b === "object" && b !== null ? b.name || b._id : b
                      )
                      .join(", ")
                  : event.booths}
              </TableCell>
              <TableCell className="px-5 py-4">
                {locationCounts[event._id] ?? "Loading..."}
              </TableCell>
              <TableCell className="px-5 py-4">
                {event.expoCenter?.name || "N/A"}
              </TableCell>
              <TableCell className="px-4 py-3 text-start">
                <div className="flex -space-x-2">
                  {Array.isArray(event.expoCenter?.images) &&
                  event.expoCenter.images.length > 0 ? (
                    event.expoCenter.images.map((img, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 overflow-hidden border-2 border-white rounded-full"
                      >
                        <img
                          src={`${baseUrl}${img}`}
                          alt="Expo"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreviewImage(`${baseUrl}${img}`)}
                        />
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No images</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-start">
                {event.expoCenter?.mapSvg ? (
                  <div
                    className="w-6 h-6 overflow-hidden border-2 border-white rounded-full cursor-pointer"
                    onClick={() =>
                      setPreviewImage(`${baseUrl}${event.expoCenter.mapSvg}`)
                    }
                  >
                    <img
                      src={`${baseUrl}${event.expoCenter.mapSvg}`}
                      alt="Map"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No map</span>
                )}
              </TableCell>
              <TableCell className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleViewRegistrations(event._id)}
                    className="px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    Add Registrations
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Image Preview Modal */}
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
