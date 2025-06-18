import React, { useState, useEffect } from "react";
import axios from "axios";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";
import Select from "../form/Select";
import MultiSelect from "../form/MultiSelect";
import { useNavigate } from "react-router-dom";
import Label from "../form/Label";

const initialState = {
  title: "",
  description: "",
  theme: "",
  dateFrom: "",
  dateTo: "",
  expoCenter: "",
  booths: [],
};

export default function AddEvent() {
  const [formData, setFormData] = useState(initialState);
  const navigate = useNavigate();
  const [expoCenters, setExpoCenters] = useState([]);
  const [availableBooths, setAvailableBooths] = useState([]);
 const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/expo`)
      .then((res) => setExpoCenters(res.data.data))
      .catch(() => toast.error("Failed to load expo centers"));
  }, []);

  useEffect(() => {
    const { expoCenter, dateFrom, dateTo } = formData;
    if (expoCenter && dateFrom && dateTo) {
      axios
        .get(`${BASE_URL}/api/event/available-booths`, {
          params: { expoCenterId: expoCenter, dateFrom, dateTo },
        })
        .then((res) => setAvailableBooths(res.data.booths))
        .catch((err) => {
          console.error("Error fetching booths:", err);
          toast.error("Failed to fetch available booths");
        });
    } else {
      setAvailableBooths([]);
      setFormData((prev) => ({ ...prev, booths: [] }));
    }
  }, [formData.expoCenter, formData.dateFrom, formData.dateTo]);

  const handleChange = (eOrValue) => {
    if (eOrValue?.target) {
      const { name, value } = eOrValue.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, booths: eOrValue }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const today = new Date().setHours(0, 0, 0, 0);
    const start = new Date(formData.dateFrom).setHours(0, 0, 0, 0);
    const end = new Date(formData.dateTo).setHours(0, 0, 0, 0);

    if (!formData.booths.length) {
      toast.error("Please select at least one booth");
      return;
    }

    if (start < today) {
      toast.error("Start date cannot be in the past");
      return;
    }

    if (end < start) {
      toast.error("End date must be the same or after the start date");
      return;
    }

    try {
      const payload = {
        ...formData,
      };

      await axios.post(`${BASE_URL}/api/event`, payload);
      toast.success("Event created successfully!");
      navigate("/display-event");
      setFormData(initialState);
      setAvailableBooths([]);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };

  return (
    <ComponentCard title="Add New Event">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Event Title"
          required
        />
        <Input
          name="theme"
          value={formData.theme}
          onChange={handleChange}
          placeholder="Theme (e.g., Tech, Arts)"
          required
        />
        <Label>From Date</Label>
        <Input
          name="dateFrom"
          type="date"
          value={formData.dateFrom}
          onChange={handleChange}
          min={new Date().toISOString().split("T")[0]}
          required
        />
        <Label>To Date</Label>
        <Input
          name="dateTo"
          type="date"
          value={formData.dateTo}
          onChange={handleChange}
          min={formData.dateFrom || new Date().toISOString().split("T")[0]}
          required
        />
        <Select
          name="expoCenter"
          value={formData.expoCenter}
          onChange={handleChange}
          options={expoCenters.map((expo) => ({
            label: expo.name,
            value: expo._id,
          }))}
          placeholder="Select Expo Center"
          required
        />
        <MultiSelect
          name="booths"
          label="Select Available Booth(s)"
          selectedOptions={formData.booths}
          onChange={handleChange}
          options={availableBooths.map((booth) => ({
            text: booth.name,
            value: booth._id,
          }))}
        />
        <TextArea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Event Description"
          required
        />
        <Button type="submit" className="bg-blue-600 text-white p-2 px-4 rounded">
          Create Event
        </Button>
      </form>
    </ComponentCard>
  );
}
