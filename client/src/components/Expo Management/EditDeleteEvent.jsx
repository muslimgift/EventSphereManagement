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

export default function EditDeleteEvent() {
  const [events, setEvents] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const navigate = useNavigate();
  const baseUrl = "http://localhost:3000";

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/event`);
      setEvents(res.data.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      toast.error("Failed to fetch events");
    }
  };

  const handleDelete = async () => {
  try {
    await axios.delete(`${baseUrl}/api/event/${selectedEventId}`);
    toast.success("Deleted Successfully");
    setEvents((prev) => prev.filter((event) => event._id !== selectedEventId));
  } catch (err) {
    console.error("Delete failed:", err);

    // Check if backend sent a message in response.data.message or response.data.error
    const backendMessage =
      err.response?.data?.message || err.response?.data?.error || "Unknown error";

    toast.error("Delete failed: " + backendMessage);
  } finally {
    setShowConfirm(false);
    setSelectedEventId(null);
  }
};


  const handleUpdate = (eventId) => {
    navigate(`/update-event/${eventId}`);
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
            className="border border-gray-300 px-3 py-1 rounded"
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
              "From Date",
              "To Date",
              "Booth",
              "Expo Center",
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
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {event.title}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {event.theme}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {new Date(event.dateFrom).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {new Date(event.dateTo).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {Array.isArray(event.booth) ? event.booth.join(", ") : event.booth}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {event.expoCenter?.name || "N/A"}
              </TableCell>
              <TableCell className="px-5 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedEventId(event._id);
                      setShowConfirm(true);
                    }}
                    className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleUpdate(event._id)}
                    className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Update
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this event?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
