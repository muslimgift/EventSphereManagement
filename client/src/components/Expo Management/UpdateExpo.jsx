import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom"; // If you're using React Router
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import FileInput from "../form/input/FileInput";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";

const initialState = {
  name: "",
  city: "",
  address: "",
  country: "",
  description: "",
  facilities: "",
  booths: [],
};

export default function UpdateExpo() {
  const navigate = useNavigate();
  const { id } = useParams(); // assuming you're using URL like /expo/edit/:id
  const [formData, setFormData] = useState(initialState);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [mapSvgFile, setMapSvgFile] = useState(null);
  const [mapSvgPreview, setMapSvgPreview] = useState("");

  // Fetch data when page loads
  useEffect(() => {
    const fetchExpo = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3000/api/expo/${id}`);
        const expo = data.data;

        setFormData({
          name: expo.name,
          city: expo.location.city,
          address: expo.location.address,
          country: expo.location.country,
          description: expo.description,
          facilities: expo.facilities,
          booths: expo.booths,
        });

        setImagePreviews(expo.images.map((url) => `http://localhost:3000${url}`));
        setMapSvgPreview(`http://localhost:3000${expo.mapSvg}`);
      } catch (error) {
        console.error("Failed to fetch expo center:", error);
        toast.error("Failed to load expo center");
      }
    };

    fetchExpo();
  }, [id]);

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImageFiles(files);
    setImagePreviews(previews);
  };

  const handleMapSvgUpload = (e) => {
    const file = e.target.files[0];
    if (file?.type !== "image/svg+xml") {
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
        { id: "", name: "", locations: [{ id: "", name: "", price: "" }] },
      ],
    }));
  };

  const removeBooth = (index) => {
    const booths = [...formData.booths];
    booths.splice(index, 1);
    setFormData((prev) => ({ ...prev, booths }));
  };

  const addLocation = (boothIndex) => {
    const booths = [...formData.booths];
    booths[boothIndex].locations.push({ id: "", name: "", price: "" });
    setFormData((prev) => ({ ...prev, booths }));
  };

  const removeLocation = (boothIndex, locationIndex) => {
    const booths = [...formData.booths];
    booths[boothIndex].locations.splice(locationIndex, 1);
    setFormData((prev) => ({ ...prev, booths }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("name", formData.name);

      const locationObj = {
        city: formData.city,
        address: formData.address,
        country: formData.country,
      };
      data.append("location", JSON.stringify(locationObj));
      data.append("description", formData.description);
      data.append("facilities", formData.facilities);
      data.append("booths", JSON.stringify(formData.booths));

      imageFiles.forEach((file) => data.append("images", file));
      if (mapSvgFile) {
        data.append("mapSvg", mapSvgFile);
      }

      await axios.put(`http://localhost:3000/api/expo/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Expo Center updated successfully");
       navigate("/eddel-expo");
    } catch (error) {
      console.error("Error updating expo center:", error);
      toast.error("Failed to update expo center");
    }
  };

  return (
    <ComponentCard title="Update Expo Center">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Same form fields as AddExpo */}
        <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" required />
        <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="City" required />
        <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" required />
        <Input name="country" value={formData.country} onChange={handleInputChange} placeholder="Country" required />
        <TextArea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" required />
        <Input name="facilities" value={formData.facilities} onChange={handleInputChange} placeholder="Facilities" required />

        <Label>Images</Label>
        <FileInput type="file" multiple accept="image/*" onChange={handleImageUpload} />
        <div className="flex gap-2 mt-2">
          {imagePreviews.map((src, idx) => (
            <img key={idx} src={src} alt="preview" className="w-24 h-24 object-cover border rounded" />
          ))}
        </div>

        <Label>Map SVG</Label>
        <FileInput type="file" accept=".svg" onChange={handleMapSvgUpload} />
        {mapSvgPreview && (
          <img src={mapSvgPreview} alt="Map Preview" className="w-24 h-24 object-cover border rounded mt-2" />
        )}

        {/* Booths and locations */}
        {formData.booths.map((booth, i) => (
          <div key={i} className="border p-4 rounded space-y-4 mb-4">
            
            <Input value={booth.name} onChange={(e) => handleBoothChange(i, "name", e.target.value)} placeholder="Booth Name" required />

            {booth.locations.map((loc, j) => (
              <div key={j} className="border p-3 rounded space-y-2">
                
                <Input value={loc.name} onChange={(e) => handleLocationChange(i, j, "name", e.target.value)} placeholder="Location Name" required />
                <Input value={loc.price} type="number" onChange={(e) => handleLocationChange(i, j, "price", e.target.value)} placeholder="Price" required />
                {j > 0 && (
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeLocation(i, j)}>❌ Remove Location</Button>
                )}
              </div>
            ))}
            <Button type="button" onClick={() => addLocation(i)} variant="outline" size="sm">+ Add Location</Button>
            {i > 0 && (
              <Button type="button" variant="destructive" size="sm" onClick={() => removeBooth(i)}>❌ Remove Booth</Button>
            )}
          </div>
        ))}

        <Button type="button" onClick={addBooth} variant="outline">+ Add Booth</Button>
        <br />
        <Button type="submit" className="bg-blue-600 text-white p-2 px-4 rounded">Update</Button>
      </form>
    </ComponentCard>
  );
}
