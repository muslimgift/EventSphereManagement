import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ComponentCard from '../common/ComponentCard';
import axios from 'axios';
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

export default function UpdateRegisteredEvents() {
  const { id: registrationId } = useParams();
  const [formData, setFormData] = useState(initialState);
  const [availableBooths, setAvailableBooths] = useState([]);
  const [bookedLocations, setBookedLocations] = useState([]);
  
  const baseUrl = 'http://localhost:3000';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current registration
        const { data } = await axios.get(`${baseUrl}/api/register-event/${registrationId}`);
        const registration = data.registration;

        

        // Set base form data
        setFormData({
          boothId: registration.boothId,
          locationId: registration.locationId,
          StallName: registration.StallName,
          StaffName: registration.StaffName,
          Product: registration.Product,
          file: null,
        });

        // Get event + allowed booths
        const eventData = await axios.get(`${baseUrl}/api/event/${registration.event._id}`);
        const { expoCenter, booth: boothIds } = eventData.data.data;

        // Get Expo Center details
        const expoDetails = await axios.get(`${baseUrl}/api/expo/${expoCenter._id}`);
        const allBooths = expoDetails.data.data.booths.filter((b) => boothIds.includes(b.id));

        const booths = allBooths.map((b) => ({
          id: b.id,
          name: b.name,
          locations: b.locations,
        }));

        setAvailableBooths(booths);

        // Get booked locations for this event
        const bookedRes = await axios.get(`${baseUrl}/api/register-event/booked-locations/${registration.event._id}`);
        setBookedLocations(bookedRes.data.bookedLocations || []);
      } catch (error) {
        toast.error('Failed to fetch registration: ' + error.message);
      }
    };

    fetchData();
  }, [registrationId]);

  // Filter locations for selected booth
  const booth = availableBooths.find((b) => b.id === formData.boothId);
  const availableLocations =
    booth?.locations
      .filter((loc) => {
        const isBooked = bookedLocations.some(
          (bl) =>
            bl.boothId === booth.id &&
            bl.locationId === loc.id &&
            loc.id !== formData.locationId // allow user’s own location
        );
        return !isBooked;
      })
      .map((loc) => ({
        value: loc.id,
        label: `${booth.name} - ${loc.name} ($${loc.price})`,
      })) || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'boothId' ? { locationId: '' } : {}),
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('boothId', formData.boothId);
      submitData.append('locationId', formData.locationId);
      submitData.append('StallName', formData.StallName);
      submitData.append('StaffName', formData.StaffName);
      submitData.append('Product', formData.Product);
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      await axios.put(`${baseUrl}/api/register-event/${registrationId}`, submitData);
      toast.success('Registration updated successfully');
      navigate('/eventdisplay');
    } catch (err) {
      toast.error('Update failed: ' + err.message);
    }
  };

  return (
    <ComponentCard title="Update Registered Event">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="boothId">Select Booth</Label>
          <Select
            name="boothId"
            options={availableBooths.map((b) => ({ value: b.id, label: b.name }))}
            value={formData.boothId}
            onChange={handleChange}
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
            disabled={!formData.boothId}
            required
          />
        </div>

        <div>
          <Label htmlFor="StallName">Stall Name</Label>
          <Input
            type="text"
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
            name="Product"
            value={formData.Product}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="file">Update File (optional)</Label>
          <FileInput
            type="file"
            name="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileChange}
          />
        </div>

        <Button type="submit">Update</Button>
      </form>
    </ComponentCard>
  );
}
