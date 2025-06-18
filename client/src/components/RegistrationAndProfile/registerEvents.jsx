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
  StaffName: '',
  Product: '',
};

export default function RegisterEvents() {
  const { id: eventId } = useParams();
  const { user } = useContext(userContext);
  const [formData, setFormData] = useState(initialState);
  const [availableBooths, setAvailableBooths] = useState([]);
  const [locationsMap, setLocationsMap] = useState({});
  const [bookedLocations, setBookedLocations] = useState([]);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchBoothsAndLocations = async () => {
      try {
        // Step 1: Get the event to find its expoCenter
        const { data: eventRes } = await axios.get(`${baseUrl}/api/event/${eventId}`);
        const expoCenterId = eventRes.expoCenter;
        console.log(expoCenterId)

        // Step 2: Get booths that belong to this expoCenter
        const { data: boothRes } = await axios.get(`${baseUrl}/api/booth/expo/${expoCenterId._id}`);
        const booths = boothRes;
        setAvailableBooths(booths);

        // Step 3: For each booth, fetch its locations
        const locationsResult = {};
        for (let booth of booths) {
          const { data: locRes } = await axios.get(
            `${baseUrl}/api/location/booth/${booth._id}`,
            {
              params: { eventId },
            }
          );
          console.log(`Locations for booth ${booth.name}:`, locRes.data); // 👈 ADD THIS
          locationsResult[booth._id] = locRes.data;
        }
        setLocationsMap(locationsResult);

        // Step 4: Get already booked locations for this event
        const bookedRes = await axios.get(`${baseUrl}/api/register-event/booked-locations/${eventId}`);
        setBookedLocations(bookedRes.data.bookedLocations || []);
      } catch (error) {
        toast.error("Failed to load data: " + error.message);
      }
    };

    fetchBoothsAndLocations();
  }, [eventId]);

  const booth = availableBooths.find(b => b._id === formData.boothId);
  const boothLocations = locationsMap[formData.boothId] || [];

  const availableLocations = boothLocations
    .filter(loc => {
      const isBooked = bookedLocations.some(
        bl => bl.boothId === formData.boothId && bl.locationId === loc._id
      );
      return !isBooked;
    })
    .map(loc => ({
      value: loc._id,
      label: `${booth?.name || ''} - ${loc.name} ($${loc.price})`
    }));

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'boothId' ? { locationId: '' } : {})
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

      await axios.post(`${baseUrl}/api/register-event`, submitData);
      toast.success("Successfully registered for the event");
      setFormData(initialState);
      navigate("/registeredevents");
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
            options={availableBooths.map(b => ({ value: b._id, label: b.name }))}
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

        <Button type="submit">Register</Button>
      </form>
    </ComponentCard>
  );
}
