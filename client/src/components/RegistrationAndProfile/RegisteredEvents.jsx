import React, { useEffect, useState, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import axios from "axios";
import { toast } from "react-toastify";
import { userContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function RegisteredEvents() {
  const { user } = useContext(userContext);
  const [users, setUsers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedExpoCenter, setSelectedExpoCenter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/register-event`)
      .then((res) => {
        if (res.data.status) {
          setUsers(res.data.events);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch registered events:", err);
        toast.error("Failed to fetch registered events");
      });
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/register-event/${selectedUserId}`);
      toast.success("Deleted Successfully");
      setUsers(users.filter((user) => user._id !== selectedUserId));
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Delete failed");
    } finally {
      setShowConfirm(false);
      setSelectedUserId(null);
    }
  };

  const handleUpdate = (selectedUserId) => {
    navigate(`/updateregisteredevents/${selectedUserId}`);
  };

  const filteredUsers = users.filter((order) =>
    order.user?._id === user?._id &&
    (selectedStatus === "all" || order.status.toLowerCase() === selectedStatus.toLowerCase()) &&
    (selectedExpoCenter === "all" || order.event?.expoCenter?.name === selectedExpoCenter) &&
    (selectedEvent === "all" || order.event?.title === selectedEvent)
  );

  const expoCenters = [...new Set(users.map((u) => u.event?.expoCenter?.name).filter(Boolean))];
  const eventTitles = [...new Set(users.map((u) => u.event?.title).filter(Boolean))];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-4">
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4 justify-end">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <option value="all">All Statuses</option>
          <option value="Waiting">Waiting</option>
          <option value="Approved">Approved</option>
        </select>

        <select
          value={selectedExpoCenter}
          onChange={(e) => setSelectedExpoCenter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <option value="all">All Expo Centers</option>
          {expoCenters.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <option value="all">All Events</option>
          {eventTitles.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {[
                "User",
                "Stall Location",
                "Staff",
                "Product",
                "File",
                "Status",
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
            {filteredUsers.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-full">
                      <img
                        width={40}
                        height={40}
                        src={order.user?.logolink || "/images/user/user-01.jpg"}
                        alt="User"
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.user?.username || "Unknown User"}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {order.event?.title || "Unknown Event"}
                      </span>
                      <span className="block text-gray-400 text-theme-xs dark:text-gray-500">
                        {order.event?.expoCenter?.name || "Unknown Expo Center"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.boothName ? `Booth ${order.boothName}` : "Booth N/A"}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {order.locationName ? `Location ${order.locationName}` : "Location N/A"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.StaffName}
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.Product}
                </TableCell>

                <TableCell>
                  <a
                    href={`${BASE_URL}/${order.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 text-blue-500 underline text-start text-theme-sm dark:text-blue-400"
                  >
                    View File
                  </a>
                </TableCell>

                <TableCell>
                  <Badge
                    size="sm"
                    color={order.status.toLowerCase() === "waiting" ? "warning" : "success"}
                  >
                    {order.status}
                  </Badge>
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.event?.expoCenter?.name || "N/A"}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUserId(order._id);
                        setShowConfirm(true);
                      }}
                      className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleUpdate(order._id)}
                      className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600"
                    >
                      Update
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-sm text-center dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Confirm Deletion
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this registration? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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
