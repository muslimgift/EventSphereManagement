import React, { useState } from "react";
import axios from "axios";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import FileInput from "../form/input/FileInput";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const initialState = {
  name: "",
  city: "",
  address: "",
  country: "",
  description: "",
  facilities: "",
  booths: [
    {
      id: "",
      name: "",
      locations: [{ id: "", name: "", address: "", price: "" }],
    },
  ],
};

export default function AddExpo() {
  const [formData, setFormData] = useState(initialState);
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [mapSvgFile, setMapSvgFile] = useState(null);
  const [mapSvgPreview, setMapSvgPreview] = useState("");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;


 const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBoothChange = (index, key, value) => {
    const booths = [...formData.booths];
    booths[index][key] = value;
    setFormData((prev) => ({ ...prev, booths }));
  };

  const handleLocationChange = (boothIndex, locationIndex, key, value) => {
    const booths = [...formData.booths];
    booths[boothIndex].locations[locationIndex][key] = value;
    setFormData((prev) => ({ ...prev, booths }));
  };
const removeBooth = (index) => {
  const booths = [...formData.booths];
  booths.splice(index, 1);
  setFormData((prev) => ({ ...prev, booths }));
};

const removeLocation = (boothIndex, locationIndex) => {
  const booths = [...formData.booths];
  booths[boothIndex].locations.splice(locationIndex, 1);
  setFormData((prev) => ({ ...prev, booths }));
};

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "image/tiff",
      "image/svg+xml",
    ];

    const validFiles = files.filter((file) => allowedTypes.includes(file.type));
    if (validFiles.length < files.length) {
      toast.error(
        "Only image files (jpg, png, gif, bmp, webp, tiff, svg) are allowed."
      );
    }

    const previews = validFiles.map((file) => URL.createObjectURL(file));

    setImageFiles(validFiles);
    setImagePreviews(previews);
  };

  const handleMapSvgUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Accept only SVG files
  const allowedTypes = ["image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    toast.error("Only SVG files are allowed for Map SVG");
    return;
  }

  setMapSvgFile(file);
  setMapSvgPreview(URL.createObjectURL(file));
};


  const addBooth = () => {
    setFormData((prev) => ({
      ...prev,
      booths: [
        ...prev.booths,
        { id: "", name: "", locations: [{ id: "", name: "", address: "", price: "" }] },
      ],
    }));
  };

  const addLocation = (boothIndex) => {
    const booths = [...formData.booths];
    booths[boothIndex].locations.push({ id: "", name: "", price: "" });
    setFormData((prev) => ({ ...prev, booths }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!mapSvgFile) {
    toast.error("Map SVG file is required");
    return;
  }

  try {
    // 1. Submit Expo data without booths
    const expoData = new FormData();
    expoData.append("name", formData.name);
    const locationObj = {
      city: formData.city,
      address: formData.address,
      country: formData.country,
    };
    expoData.append("location", JSON.stringify(locationObj));
    expoData.append("description", formData.description);
    expoData.append("facilities", formData.facilities);
    imageFiles.forEach((file) => expoData.append("images", file));
    expoData.append("mapSvg", mapSvgFile);

    const expoResponse = await axios.post(
      `${BASE_URL}/api/expo/`,
      expoData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const expoId = expoResponse.data.data._id; // Adjust if your API returns id differently

    // 2. For each booth, submit it with expoId
for (const booth of formData.booths) {
  const boothData = {
  name: booth.name,
  expoCenter: expoId, // Use the correct field name expected by schema
};


  const boothResponse = await axios.post(
    `${BASE_URL}/api/booth/`,
    boothData
  );
  const boothId = boothResponse.data.data._id;
console.log(boothId)
  // 3. For each location in booth, submit with Booth field
  for (const location of booth.locations) {
    const locationData = {
      name: location.name,
      price: location.price,
      Booth: boothId, // Fix: use 'Booth' instead of 'boothId'
    };

    await axios.post(`${BASE_URL}/api/location/`, locationData);
  }
}

    toast.success("Expo, booths, and locations added successfully");
    navigate("/eddel-expo");
  } catch (error) {
    console.error("Error submitting expo data:", error);
    toast.error("Error submitting expo data");
  }
};


  return (
    <ComponentCard title="Adding Expo Center">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic fields */}
        <Input name="name" placeholder="Expo Center Name" value={formData.name} onChange={handleInputChange} required={true} />
        <Input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} required={true} />
        <Input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required={true} />
        <Input name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} required={true} />
        <TextArea
  name="description"
  value={formData.description}
  onChange={handleInputChange}
  placeholder="Enter description"
  required
/>


        {/* Images upload */}
        <Label>Upload Images</Label>
        <FileInput
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff,.svg"
          multiple
          onChange={handleImageUpload}
          required
        />
        {imagePreviews.length > 0 && (
          <div className="flex gap-2 mt-2">
            {imagePreviews.map((url, i) => (
              <img key={i} src={url} alt={`Preview ${i}`} className="w-24 h-24 object-cover border rounded" />
            ))}
          </div>
        )}

        {/* Map SVG upload */}
        <Label>Upload Map SVG</Label>
        <FileInput
          type="file"
          accept=".svg"
          onChange={handleMapSvgUpload}
          required={true}
        />
        {mapSvgPreview && (
          <img src={mapSvgPreview} alt="Map SVG Preview" className="w-24 h-24 object-cover border rounded mt-2" />
        )}

        {/* Facilities */}
        <Input
          name="facilities"
          placeholder="Facilities better to be comma-separated"
          value={formData.facilities}
          onChange={handleInputChange}
          required={true}
        />

        {/* Booths and locations */}
               {formData.booths.map((booth, i) => (
          <div key={i} className="border p-4 mb-4 rounded">

            <div>
              <Label>Booth Name</Label>
              <Input
                placeholder="Booth Name"
                value={booth.name}
                onChange={(e) => handleBoothChange(i, "name", e.target.value)}
                className="w-full border p-2 mb-4"
                required={true}
              />
            </div>

            <h4 className="font-semibold mb-2">Locations</h4>

            {booth.locations.map((loc, j) => (
              <div key={j} className="border p-3 mb-3 rounded space-y-2">

                <div>
                  <Label>Location Name</Label>
                  <Input
                    placeholder="Location Name"
                    value={loc.name}
                    onChange={(e) => handleLocationChange(i, j, "name", e.target.value)}
                    className="w-full border p-2"
                    required={true}
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    placeholder="Price"
                    value={loc.price}
                    onChange={(e) => handleLocationChange(i, j, "price", e.target.value)}
                    className="w-full border p-2"
                    required={true}
                  />
                </div>
{j > 0 && (
  <Button
  type="button"
    variant="destructive"
    size="sm"
    onClick={() => removeLocation(i)}
    className="text-red-600 mt-2"
  >
    ❌ Remove Location
  </Button>
)}
              </div>
              
            ))}

            <Button
            type="button"
              variant="outline"
              size="sm"
              onClick={() => addLocation(i)}
              className="text-blue-600"
            >
              + Add Location
            </Button>
            {i > 0 && (
  <Button
  type="button"
    variant="destructive"
    size="sm"
    onClick={() => removeBooth(i)}
    className="text-red-600 mt-2"
  >
    ❌ Remove Booth
  </Button>
)}
          </div>
        ))}

        <Button
        type="button"
          variant="outline"
          size="sm"
          onClick={addBooth}
          className="text-blue-600"
        >
          + Add Booth
        </Button>

        <br />

        <Button type="submit" className="bg-blue-600 text-white p-2 px-4 rounded">
          Submit
        </Button>
      </form>
    </ComponentCard>
  );
}