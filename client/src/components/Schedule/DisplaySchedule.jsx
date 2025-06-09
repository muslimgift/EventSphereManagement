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

export default function DisplaySchedule() {
  const [schedules, setSchedules] = useState([]);
  const [expoCenters, setExpoCenters] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const navigate = useNavigate();
  const baseUrl = "http://localhost:3000";

  useEffect(() => {
    fetchSchedules();
    fetchExpoCenters();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/schedule`);
      setSchedules(res.data.data || res.data);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
      toast.error("Failed to fetch schedules");
    }
  };

  const fetchExpoCenters = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/expo`);
      setExpoCenters(res.data.data || res.data);
    } catch (err) {
      console.error("Failed to fetch Expo Centers:", err);
      toast.error("Failed to fetch Expo Centers");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${baseUrl}/api/schedule/${selectedScheduleId}`);
      toast.success("Deleted Successfully");
      setSchedules((prev) =>
        prev.filter((schedule) => schedule._id !== selectedScheduleId)
      );
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Delete failed: " + err.message);
    } finally {
      setShowConfirm(false);
      setSelectedScheduleId(null);
    }
  };

  const handleUpdate = (scheduleId) => {
    navigate(`/update-schedule/${scheduleId}`);
  };

  const getBoothNamesFromIds = (boothIds) => {
    const names = [];

    expoCenters.forEach((expo) => {
      expo.booths.forEach((booth) => {
        if (boothIds.includes(booth.id)) {
          names.push(booth.name);
        }
      });
    });

    return names.join(", ");
  };

  const filteredSchedules = schedules.filter((s) => {
    if (!filterDate) return true;
    return (
      new Date(s.scheduledate).toDateString() ===
      new Date(filterDate).toDateString()
    );
  });

  return (
    <div className="max-w-full overflow-x-auto">
      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <Label>Filter by Date</Label>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <Button
          onClick={() => {
            setFilterDate("");
          }}
          variant="outline"
        >
          Clear Filter
        </Button>
      </div>

      <Table>
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            {[
              "Title",
              "Type",
              "Speaker",
              "Date",
              "Start Time",
              "End Time",
              "Booths",
              "Event",
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
          {filteredSchedules.map((s) => (
            <TableRow key={s._id}>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {s.title}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {s.eventtype}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {s.speaker || "N/A"}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {new Date(s.scheduledate).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {s.StartTime}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {s.EndTime}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {Array.isArray(s.booth)
                  ? getBoothNamesFromIds(s.booth)
                  : getBoothNamesFromIds([s.booth])}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm dark:text-white/90">
                {s.event?.title || "N/A"}
              </TableCell>
              <TableCell className="px-5 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedScheduleId(s._id);
                      setShowConfirm(true);
                    }}
                    className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleUpdate(s._id)}
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
              Are you sure you want to delete this schedule?
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
