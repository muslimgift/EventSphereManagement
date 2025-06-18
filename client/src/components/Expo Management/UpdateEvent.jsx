import React, { useState, useEffect } from "react";
import axios from "axios";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";
import Select from "../form/Select";
import MultiSelect from "../form/MultiSelect";
import { useParams, useNavigate } from "react-router-dom";

const initialState = {
  title: "",
  description: "",
  theme: "",
  dateFrom: "",
  dateTo: "",
  expoCenter: "",
  booths: [], // changed from 'booth'
};


export default function UpdateEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [expoCenters, setExpoCenters] = useState([]);
  const [availableBooths, setAvailableBooths] = useState([]);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleBoothChange = (selectedBooths) => {
  setFormData((prev) => ({ ...prev, booths: selectedBooths }));
};


  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/expo`)
      .then((res) => {
        setExpoCenters(res.data.data);
      })
      .catch(() => toast.error("Failed to load expo centers"));
  }, []);

  useEffect(() => {
    if (formData.expoCenter && formData.dateFrom && formData.dateTo) {
      axios
        .get(`${BASE_URL}/api/event/available-booths`, {
          params: {
            expoCenterId: formData.expoCenter,
            dateFrom: formData.dateFrom,
            dateTo: formData.dateTo,
            excludeEventId: id,
          },
        })
        .then((res) => {
          setAvailableBooths(res.data.booths);
        })
        .catch(() => toast.error("Failed to fetch booths"));
    }
  }, [formData.expoCenter, formData.dateFrom, formData.dateTo]);

useEffect(() => {
  axios
    .get(`${BASE_URL}/api/event/${id}`)
    .then((res) => {
      const event = res.data;
      console.log(event)
      setFormData({
        title: event.title,
        description: event.description,
        theme: event.theme,
        dateFrom: event.dateFrom.split("T")[0],
        dateTo: event.dateTo.split("T")[0],
        expoCenter: event.expoCenter._id || event.expoCenter,
        booths: Array.isArray(event.booths) ? event.booths : [event.booths],
      });
    })
    .catch(() => toast.error("Failed to fetch event details"));
}, [id]);


const handleSubmit = async (e) => {
  e.preventDefault();

const selectedBoothIds = formData.booths.map((b) => (typeof b === 'string' ? b : b._id));
  const validBoothIds = availableBooths.map((b) => b._id);

  const hasValidBooth = selectedBoothIds.some((id) => validBoothIds.includes(id));

  if (!hasValidBooth) {
    toast.error("Please select at least one valid booth.");
    return;
  }
  try {
    const res = await axios.put(`${BASE_URL}/api/event/${id}`, formData);
    if (res.data.success) {
      toast.success("Event updated successfully!");
      navigate("/display-event");
    } else {
      toast.error(res.data.message || "Failed to update event");
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || "An unexpected error occurred";
    toast.error("Failed to update event: " + errorMsg);
  }
};



  return (
    <ComponentCard title="Update Event">
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
        <Input
          name="dateFrom"
          type="date"
          value={formData.dateFrom}
          onChange={handleChange}
          required
        />
        <Input
          name="dateTo"
          type="date"
          value={formData.dateTo}
          onChange={handleChange}
          required
        />
        <Select
          name="expoCenter"
          value={formData.expoCenter}
          onChange={handleChange}
          options={expoCenters.map((e) => ({ label: e.name, value: e._id }))}
          placeholder="Select Expo Center"
          required
        />
        <MultiSelect
  label="Select Booth(s)"
  options={availableBooths.map((b) => ({ text: b.name, value: b._id }))}
  selectedOptions={formData.booths}
  onChange={handleBoothChange}
  disabled={availableBooths.length === 0}
/>

        <TextArea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Event Description"
          required
        />
        <Button type="submit" className="bg-green-600 text-white p-2 px-4 rounded">
          Update Event
        </Button>
      </form>
    </ComponentCard>
  );
}
