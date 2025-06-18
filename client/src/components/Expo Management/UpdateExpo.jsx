import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import FileInput from "../form/input/FileInput";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";

export default function UpdateExpo() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Expo Center state
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    country: "",
    description: "",
    facilities: "",
    images: [], // existing image URLs (strings)
    mapSvg: "", // existing svg URL (string)
  });
  const [imageFiles, setImageFiles] = useState([]); // new images files
  const [imagePreviews, setImagePreviews] = useState([]);
  const [mapSvgFile, setMapSvgFile] = useState(null);
  const [mapSvgPreview, setMapSvgPreview] = useState("");
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Booths state - array of booths with locations nested inside
  // Structure: [{ _id, name, locations: [{ _id, name, price, Booth }] }]
  const [booths, setBooths] = useState([]);

  // Track deleted booth and location IDs for DELETE requests
  const [deletedBoothIds, setDeletedBoothIds] = useState([]);
  const [deletedLocationIds, setDeletedLocationIds] = useState([]);

  // Fetch ExpoCenter, booths, locations on mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch expo center
        const { data: expoRes } = await axios.get(`${BASE_URL}/api/expo/${id}`);
        const expo = expoRes.data;
        setFormData({
          name: expo.name,
          city: expo.location.city,
          address: expo.location.address,
          country: expo.location.country,
          description: expo.description,
          facilities: expo.facilities,
          images: expo.images || [],
          mapSvg: expo.mapSvg || "",
        });
        setImagePreviews((expo.images || []).map((img) => `${BASE_URL}${img}`));
        setMapSvgPreview(expo.mapSvg ? `${BASE_URL}${expo.mapSvg}` : "");
        // Fetch booths linked to this expo center
        const { data: boothsRes } = await axios.get(`${BASE_URL}/api/booth/expo/${id}`);
        const boothsData = boothsRes || [];

        // For each booth, fetch locations
        const boothsWithLocations = await Promise.all(
          boothsData.map(async (booth) => {
            const { data: locRes } = await axios.get(`${BASE_URL}/api/location/allbooth/${booth._id}`);
            return {
              ...booth,
              locations: locRes.data || [],
            };
          })
        );

        setBooths(boothsWithLocations);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load Expo Center data");
      }
    }
    fetchData();
  }, [id]);

  // Handle ExpoCenter field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle booths changes
  const handleBoothChange = (index, key, value) => {
    const updatedBooths = [...booths];
    updatedBooths[index][key] = value;
    setBooths(updatedBooths);
  };

  // Handle locations changes
  const handleLocationChange = (boothIndex, locIndex, key, value) => {
    const updatedBooths = [...booths];
    updatedBooths[boothIndex].locations[locIndex][key] = value;
    setBooths(updatedBooths);
  };

  // Add a new booth (without _id initially)
  const addBooth = () => {
    setBooths((prev) => [...prev, { name: "", expoCenter: id, locations: [] }]);
  };

  // Remove a booth
  const removeBooth = (index) => {
    const boothToDelete = booths[index];
    if (boothToDelete._id) {
      setDeletedBoothIds((prev) => [...prev, boothToDelete._id]);
      // Also mark its locations for deletion
      boothToDelete.locations.forEach((loc) => {
        if (loc._id) setDeletedLocationIds((prev) => [...prev, loc._id]);
      });
    }
    setBooths((prev) => prev.filter((_, i) => i !== index));
  };

  // Add location inside a booth
  const addLocation = (boothIndex) => {
    const updatedBooths = [...booths];
    updatedBooths[boothIndex].locations.push({ name: "", price: "", Booth: updatedBooths[boothIndex]._id });
    setBooths(updatedBooths);
  };

  // Remove location from booth
  const removeLocation = (boothIndex, locIndex) => {
    const locToDelete = booths[boothIndex].locations[locIndex];
    if (locToDelete._id) {
      setDeletedLocationIds((prev) => [...prev, locToDelete._id]);
    }
    const updatedBooths = [...booths];
    updatedBooths[boothIndex].locations.splice(locIndex, 1);
    setBooths(updatedBooths);
  };

  // Handle image uploads
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Handle map SVG upload
  const handleMapSvgUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "image/svg+xml") {
      toast.error("Only SVG files are allowed for map SVG");
      return;
    }
    setMapSvgFile(file);
    setMapSvgPreview(URL.createObjectURL(file));
  };

  // Submit handler
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // --- 1. Update ExpoCenter itself ---
    const expoForm = new FormData();
    expoForm.append("name", formData.name);
    expoForm.append(
      "location",
      JSON.stringify({
        city: formData.city,
        address: formData.address,
        country: formData.country,
      })
    );
    expoForm.append("description", formData.description);
    expoForm.append("facilities", formData.facilities);
    imageFiles.forEach((f) => expoForm.append("images", f));
    if (mapSvgFile) expoForm.append("mapSvg", mapSvgFile);

    await axios.put(`${BASE_URL}/api/expo/${id}`, expoForm, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // --- 2. Delete removed Locations ---
    await Promise.all(
      deletedLocationIds.map((locId) =>
        axios.delete(`${BASE_URL}/api/location/${locId}`)
      )
    );

    // --- 3. Delete removed Booths ---
    await Promise.all(
      deletedBoothIds.map((boothId) =>
        axios.delete(`${BASE_URL}/api/booth/${boothId}`)
      )
    );

    // --- 4. Upsert remaining Booths & Locations ---
    for (let booth of booths) {
      let boothId = booth._id;
      const boothPayload = { name: booth.name, expoCenter: id };

      if (boothId) {
        // UPDATE existing booth
        await axios.put(`${BASE_URL}/api/booth/${boothId}`, boothPayload);
      } else {
        // CREATE new booth
        const { data } = await axios.post(`${BASE_URL}/api/booth`, boothPayload);
        boothId = data.data._id;
      }

      // Now handle locations under this booth:
      for (let loc of booth.locations || []) {
        const locPayload = { name: loc.name, price: loc.price, Booth: boothId };

        if (loc._id) {
          // UPDATE existing location
          await axios.put(`${BASE_URL}/api/location/${loc._id}`, locPayload);
        } else {
          // CREATE new location
          await axios.post(`${BASE_URL}/api/location`, locPayload);
        }
      }
    }

    toast.success("Expo, booths & locations synchronized!");
    navigate("/eddel-expo");
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Update failed");
  }
};



  return (
    <div className="w-full max-w-7xl mx-auto">
      <ComponentCard title="Update Expo Center">
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
          {/* Expo Center Basic Fields */}
          <Label label="Expo Name" required />
          <Input
            type="text"
            name="name"
            placeholder="Expo Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <Label label="City" />
          <Input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleInputChange}
          />

          <Label label="Address" />
          <Input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleInputChange}
          />

          <Label label="Country" />
          <Input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleInputChange}
          />

          <Label label="Description" />
          <TextArea
            name="description"
            placeholder="Description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
          />

          <Label label="Facilities" />
          <TextArea
            name="facilities"
            placeholder="Facilities"
            rows={3}
            value={formData.facilities}
            onChange={handleInputChange}
          />

          {/* Images */}
          <Label label="Expo Images" />
          <FileInput multiple accept="image/*" onChange={handleImageUpload} />
          <div className="flex space-x-4 mt-2">
            {imagePreviews.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Preview"
                className="w-24 h-24 object-cover rounded border"
              />
            ))}
          </div>

          {/* Map SVG */}
          <Label label="Expo Map (SVG)" />
          <FileInput accept=".svg" onChange={handleMapSvgUpload} />
          {mapSvgPreview && (
            <img src={mapSvgPreview} alt="Map SVG Preview" className="w-48 h-auto mt-2" />
          )}

          {/* Booths & Locations */}
          <div>
            <h3 className="text-xl font-semibold mt-6 mb-2 dark:text-white">Booths & Locations</h3>
            {booths.map((booth, boothIndex) => (
              <div
                key={booth._id || boothIndex}
                className="border p-4 mb-4 rounded-md bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex justify-between items-center mb-2">
                  <Input
                    type="text"
                    value={booth.name}
                    placeholder="Booth Name"
                    onChange={(e) => handleBoothChange(boothIndex, "name", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    onClick={() => removeBooth(boothIndex)}
                    className="ml-2 bg-red-600 hover:bg-red-700"
                  >
                    Remove Booth
                  </Button>
                </div>

                {/* Locations for this booth */}
                <div className="ml-4">
                  <h4 className="font-semibold mb-2 dark:text-white">Locations</h4>
                  {booth.locations.map((loc, locIndex) => (
                    <div
                      key={loc._id || locIndex}
                      className="flex space-x-2 items-center mb-2"
                    >
                      <Input
                        type="text"
                        value={loc.name}
                        placeholder="Location Name"
                        onChange={(e) =>
                          handleLocationChange(boothIndex, locIndex, "name", e.target.value)
                        }
                        required
                      />
                      <Input
                        type="number"
                        value={loc.price}
                        placeholder="Price"
                        onChange={(e) =>
                          handleLocationChange(boothIndex, locIndex, "price", e.target.value)
                        }
                        required
                        min={0}
                      />
                      <Button
                        type="button"
                        onClick={() => removeLocation(boothIndex, locIndex)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Remove Location
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => addLocation(boothIndex)}
                    className="mt-1 bg-green-600 hover:bg-green-700"
                  >
                    Add Location
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" onClick={addBooth} className="bg-blue-600 hover:bg-blue-700">
              Add Booth
            </Button>
          </div>

          <Button type="submit" className="w-full bg-primary">
            Update Expo Center
          </Button>
        </form>
      </ComponentCard>
    </div>
  );
}
