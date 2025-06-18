import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ComponentCard from '../common/ComponentCard';
import axios from 'axios';
import { toast } from 'react-toastify';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import FileInput from '../form/input/FileInput';
import Button from '../ui/button/Button';
import Select from '../form/Select';
import { userContext } from '../../context/UserContext';

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
  const [availableLocations, setAvailableLocations] = useState([]);
  const [eventId, setEventId] = useState('');
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
const {user}=useContext(userContext)
  // Load initial registration data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/api/register-event/${registrationId}`);
        const registration = data.registration;

        setFormData({
          boothId: registration.boothId._id,
          locationId: registration.locationId,
          StallName: registration.StallName,
          StaffName: registration.StaffName,
          Product: registration.Product,
          file: null,
        });

        const eventRes = await axios.get(`${baseUrl}/api/event/${registration.event._id}`);
        setEventId(registration.event._id);

        const allowedBoothIds = eventRes.data.booths;

        const boothRes = await axios.get(`${baseUrl}/api/booth`);
        const allowedBooths = boothRes.data.data.filter((b) => allowedBoothIds.includes(b._id));
        setAvailableBooths(allowedBooths);
      } catch (error) {
        toast.error('Failed to load registration data: ' + error.message);
      }
    };

    fetchData();
  }, [registrationId]);

  // Fetch locations when booth changes
  useEffect(() => {
    const fetchLocationsByBooth = async () => {
      if (!formData.boothId || !eventId) return;

      try {
        const res = await axios.get(
  `${baseUrl}/api/location/booth/${formData.boothId}`,
  {
    params: {
      eventId,
      registrationId,
    },
  }
);


        setAvailableLocations(res.data.data);
      } catch (err) {
        toast.error('Failed to fetch locations: ' + err.message);
      }
    };

    fetchLocationsByBooth();
  }, [formData.boothId, eventId, formData.locationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'boothId' ? { locationId: '' } : {}), // reset location on booth change
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
      if(user.role=="exhibitors"){
      navigate('/registeredevents');
      }
      else{
        navigate('/user-application');
      }
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
            options={availableBooths.map((b) => ({ value: b._id, label: b.name }))}
            value={formData.boothId}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="locationId">Select Location</Label>
          <Select
            name="locationId"
            options={availableLocations.map((loc) => ({
              value: loc._id,
              label: `${loc.name} ($${loc.price})`,
            }))}
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
