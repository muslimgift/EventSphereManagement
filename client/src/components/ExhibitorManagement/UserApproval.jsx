import { useEffect, useState } from "react";
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

export default function UserApproval() {
  const [users, setUsers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all"); // Filter by status
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
  axios
    .get("http://localhost:3000/api/user")
    .then((res) => {
      if (res.data.status) {
        const exhibitors = res.data.users.filter((user) => user.role === "exhibitors");
        setUsers(exhibitors);
      }
    })
    .catch((err) => {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to fetch users");
    });
}, []);

const handleDelete = async () => {
  try {
    await axios.delete(`http://localhost:3000/api/user/${selectedUserId}`);
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

const handleStatusChange = async (userId, newStatus) => {
  try {
    await axios.patch(`http://localhost:3000/api/user/${userId}`, {
      CurrentStatus: newStatus,
    });
    setUsers(users.map((user) =>
      user._id === userId ? { ...user, CurrentStatus: newStatus } : user
    ));
  } catch (err) {
    console.error("Status update failed:", err);
    toast.error("Status update failed");
  }
};


  // Filter users by status only, role already filtered on fetch
  const filteredUsers =
    selectedStatus === "all"
      ? users
      : users.filter((user) => user.CurrentStatus === selectedStatus);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-4">
      {/* Status Filter */}
      <div className="mb-4 flex justify-end">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <option value="all">All Statuses</option>
          <option value="waiting">Waiting</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* User Table */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {["User", "Email", "CompanyName", "Phone Number", "Status", "Action"].map((text) => (
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
                        src="/images/user/user-01.jpg"
                        alt="image not found"
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.username}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {order.role}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.email}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {order.companyname}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.phonenumber}
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <Badge
                    size="sm"
                    color={
                      order.CurrentStatus === "waiting"
                        ? "warning"
                        : order.CurrentStatus === "approved"
                        ? "success"
                        : "error"
                    }
                  >
                    {order.CurrentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">
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
                    <select
                      value={order.CurrentStatus}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="px-2 py-1 text-xs bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="waiting">Waiting</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
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
              Are you sure you want to delete this user? This action cannot be undone.
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
