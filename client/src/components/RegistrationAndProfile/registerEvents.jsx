import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ComponentCard from '../common/ComponentCard';
import axios from 'axios';
import { userContext } from '../../context/UserContext';
import { toast } from 'react-toastify';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import FileInput from '../form/input/FileInput';
import Button from '../ui/button/Button';
import Select from '../form/Select';

const initialState = {
  boothId: '',
  locationId: '',
  StallName: '',
  file: null,
  StaffName:'',
  Product:'',
};

export default function RegisterEvents() {
  const { id: eventId } = useParams();
  const { user } = useContext(userContext); // user._id expected
  const [formData, setFormData] = useState(initialState);
  const [availableBooths, setAvailableBooths] = useState([]);
  const baseUrl = "http://localhost:3000";
const [bookedLocations, setBookedLocations] = useState([]);
const navigate=useNavigate();

  useEffect(() => {
    const fetchBoothsAndLocations = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/api/event/${eventId}`);
        const { expoCenter, booth: boothIds } = data.data;

        const expoDetails = await axios.get(`${baseUrl}/api/expo/${expoCenter._id}`);
        const allBooths = expoDetails.data.data.booths.filter(b => boothIds.includes(b.id));

        const booths = allBooths.map(b => ({
          id: b.id,
          name: b.name,
          locations: b.locations,
        }));

        setAvailableBooths(booths);
      // Fetch booked locations for this event
        const bookedRes = await axios.get(`${baseUrl}/api/register-event/booked-locations/${eventId}`);
        setBookedLocations(bookedRes.data.bookedLocations || []);
      } catch (error) {
        toast.error("Failed to fetch booths: " + error.message);
      }
    };

    fetchBoothsAndLocations();
  }, [eventId]);

  const booth = availableBooths.find(b => b.id === formData.boothId);
  const availableLocations = booth?.locations
  .filter(loc => {
    // Remove status check, only filter by booked locations
    const isBooked = bookedLocations.some(
      (bl) => bl.boothId === booth.id && bl.locationId === loc.id
    );
    return !isBooked;
  })
  .map(loc => ({
    value: loc.id,
    label: `${booth.name} - ${loc.name} ($${loc.price})`
  })) || [];


  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'boothId' ? { locationId: '' } : {}) // reset location when booth changes
    }));
  };

  const handleFileChange = e => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append("user", user._id);
      submitData.append("event", eventId);
      submitData.append("boothId", formData.boothId);
      submitData.append("locationId", formData.locationId);
      submitData.append("StallName", formData.StallName);
      submitData.append("StaffName", formData.StaffName);
      submitData.append("Product", formData.Product);
      
      if (formData.file) submitData.append("file", formData.file);
for (let [key, value] of submitData.entries()) {
  console.log(key, value);
}

      await axios.post(`${baseUrl}/api/register-event`, submitData);
      toast.success("Successfully registered for the event");
      setFormData(initialState);
      navigate("/eventdisplay")
    } catch (err) {
      toast.error("Registration failed: " + err.message);
    }
  };

  return (
    <ComponentCard title="Register Event">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="boothId">Select Booth</Label>
          <Select
            name="boothId"
            options={availableBooths.map(b => ({ value: b.id, label: b.name }))}
            value={formData.boothId}
            onChange={handleChange}
            placeholder="Select Booth"
            required
          />
        </div>

        <div>
          <Label htmlFor="locationId">Select Location</Label>
          <Select
            name="locationId"
            options={availableLocations}
            value={formData.locationId}
            onChange={handleChange}
            placeholder="Select Location"
            disabled={!formData.boothId}
            required
          />
        </div>

        <div>
          <Label htmlFor="StallName">Stall Name</Label>
          <Input
            type="text"
            id="StallName"
            name="StallName"
            value={formData.StallName}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <Label htmlFor="StaffName">Staff Name</Label>
          <Input
            type="text"
            id="StaffName"
            name="StaffName"
            value={formData.StaffName}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

<div>
          <Label htmlFor="Product">Products/Services</Label>
          <Input
            type="text"
            id="Product"
            name="Product"
            value={formData.Product}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>


        <div>
          <Label htmlFor="file">Upload Related File</Label>
          <FileInput
          required
            type="file"
            id="file"
            name="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileChange}
          />
        </div>

        <Button type="submit">
          Register
        </Button>
      </form>
    </ComponentCard>
  );
}
