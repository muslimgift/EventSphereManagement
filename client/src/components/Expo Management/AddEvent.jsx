import React, { useState, useEffect } from "react";
import axios from "axios";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";
import Select from "../form/Select";
import MultiSelect from "../form/MultiSelect"; // ✅ import custom MultiSelect
import { useNavigate } from "react-router-dom";
import Label from "../form/Label";

const initialState = {
  title: "",
  description: "",
  theme: "",
  dateFrom: "",
  dateTo:"",
  expoCenter: "",
  booth: [], // ✅ multi-select is an array
};

export default function AddEvent() {
  const [formData, setFormData] = useState(initialState);
  const navigate = useNavigate();
  const [expoCenters, setExpoCenters] = useState([]);
  const [availableBooths, setAvailableBooths] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/expo")
      .then((res) => {
        setExpoCenters(res.data.data);
      })
      .catch(() => toast.error("Failed to load expo centers"));
  }, []);

  useEffect(() => {
    if (formData.expoCenter && formData.dateFrom && formData.dateTo) {
      axios
        .get("http://localhost:3000/api/event/available-booths", {
          params: { expoCenterId: formData.expoCenter, dateFrom: formData.dateFrom,dateTo:formData.dateTo },
        })
        .then((res) => {
          setAvailableBooths(res.data.booths);
        })
        .catch((err) => {
          console.error("Booth fetch error:", err);
          toast.error("Failed to fetch available booths");
        });
    } else {
      setAvailableBooths([]); // clear booths if no expoCenter or date
      setFormData((prev) => ({ ...prev, booth: [] })); // reset booths selection
    }
  }, [formData.expoCenter, formData.dateFrom,formData.dateTo]);

  // Handle simple inputs + multi-select separately
  const handleChange = (eOrValue) => {
    // If eOrValue is an event (from Input, Select, TextArea)
    if (eOrValue && eOrValue.target) {
      const { name, value } = eOrValue.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      // For MultiSelect onChange: eOrValue is array of selected values
      setFormData((prev) => ({ ...prev, booth: eOrValue }));
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  const today = new Date().setHours(0, 0, 0, 0); // strip time part
  const fromDate = new Date(formData.dateFrom).setHours(0, 0, 0, 0);
  const toDate = new Date(formData.dateTo).setHours(0, 0, 0, 0);

  if (!formData.booth.length) {
    toast.error("Please select at least one booth");
    return;
  }

  if (fromDate < today) {
    toast.error("Start date cannot be in the past");
    return;
  }

  if (toDate < fromDate) {
    toast.error("End date must be the same or after the start date");
    return;
  }

  try {
    const res = await axios.post("http://localhost:3000/api/event", formData);
    if (res.data.success) {
      toast.success("Event created successfully!");
      navigate("/display-event");
      setFormData(initialState);
      setAvailableBooths([]);
    } else {
      toast.error(res.data.message);
    }
  } catch (error) {
    console.error("Create event error:", error);
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
        <Label
        >From Date</Label>
        <Input
  name="dateFrom"
  type="date"
  value={formData.dateFrom}
  onChange={handleChange}
  min={new Date().toISOString().split("T")[0]} // disable past dates
  required
/>



        <Label
        >To Date</Label>
       <Input
  name="dateTo"
  type="date"
  value={formData.dateTo}
  onChange={handleChange}
  min={formData.dateFrom || new Date().toISOString().split("T")[0]} // min is from date
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
          name="booth"
          label="Select Available Booth(s)"
          selectedOptions={formData.booth} // <-- Note prop is selectedOptions, NOT value
          onChange={handleChange}
          options={availableBooths.map((b) => ({
            text: b.name,
            value: b.id,
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
