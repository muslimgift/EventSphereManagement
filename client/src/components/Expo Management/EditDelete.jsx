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

export default function EditDeleteExpo() {
  const [expoCenters, setExpoCenters] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedExpoId, setSelectedExpoId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const baseUrl = "http://localhost:3000";

  useEffect(() => {
    fetchExpos();
  }, []);

  const fetchExpos = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/expo`);
      setExpoCenters(res.data.data);
    } catch (err) {
      console.error("Failed to fetch expos:", err);
      toast.error("Failed to fetch expo centers");
    }
  };

const handleDelete = async () => {
  try {
    await axios.delete(`${baseUrl}/api/expo/${selectedExpoId}`);
    toast.success("Deleted Successfully");
    setExpoCenters((prev) =>
      prev.filter((expo) => expo._id !== selectedExpoId)
    );
  } catch (err) {
    console.error("Delete failed:", err);

    // Extract error message from backend response if exists
    const backendMessage = err.response?.data?.message || err.message;

    toast.error("Delete failed: " + backendMessage);
  } finally {
    setShowConfirm(false);
    setSelectedExpoId(null);
  }
};


  const handleUpdate = (expoId) => {
    navigate(`/update-expo/${expoId}`);

  };

  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {["Expo Center", "Description", "Images", "Action"].map((text) => (
              <TableCell
                key={text}
                isHeader
                className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500"
              >
                {text}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {expoCenters.map((expo) => (
            <TableRow key={expo._id}>
              <TableCell className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 overflow-hidden rounded-full">
                    {expo.mapSvg && (
                      <img
                        src={`${baseUrl}${expo.mapSvg}`}
                        alt="Map"
                        width={40}
                        height={40}
                        onClick={() => setPreviewImage(`${baseUrl}${expo.mapSvg}`)}
                      />
                    )}
                  </div>
                  <div>
                    <span className="block font-medium text-gray-800 dark:text-white/90">
                      {expo.name}
                    </span>
                   <span className="block text-gray-500 text-sm">
  {`${expo.location?.address || ""}, ${expo.location?.city || ""}, ${expo.location?.country || ""}`}
</span>


                  </div>
                </div>
              </TableCell>

              <TableCell className="px-4 py-3 text-start text-sm text-gray-500">
                {expo.description}
              </TableCell>

              <TableCell className="px-4 py-3 text-start">
                <div className="flex -space-x-2">
                  {expo.images?.map((img, index) => (
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
                  ))}
                </div>
              </TableCell>

              <TableCell className="px-5 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedExpoId(expo._id);
                      setShowConfirm(true);
                    }}
                    className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleUpdate(expo._id)}
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
              Are you sure you want to delete this expo center?
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
