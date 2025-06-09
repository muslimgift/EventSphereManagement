import React, { useState, useEffect } from "react";
import axios from "axios";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Select from "../form/Select";
import { toast } from "react-toastify";
import Label from "../form/Label";
import { useNavigate } from "react-router-dom";

export default function AddSchedule() {
const [formData, setFormData] = useState({
  title: "",
  eventtype: "",
  speaker: "",
  StartTime: "",
  EndTime: "",
  scheduledate: "",
  event: "",
  booth: "",
});


  const [events, setEvents] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableBooths, setAvailableBooths] = useState([]);
  const navigate = useNavigate();

  // Fetch all events
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/event")
      .then((res) => setEvents(res.data.data))
      .catch(() => toast.error("Failed to load events"));
  }, []);

  // Fetch available dates for selected event
  useEffect(() => {
  if (formData.event) {
    axios
      .get(`http://localhost:3000/api/schedule/available/dates/${formData.event}`)
      .then((res) => {
        
        setAvailableDates(res.data || []);
      })
      .catch(() => toast.error("Failed to load available dates"));
  }
}, [formData.event]);


  // Fetch available booths when all criteria are selected
  useEffect(() => {
  const { event, scheduledate, StartTime, EndTime } = formData;
  if (event && scheduledate && StartTime && EndTime) {
   axios
      .get("http://localhost:3000/api/schedule/available/booths", {
        params: { eventId: event, scheduledate, StartTime, EndTime },
      })
      .then((res) => {
  setAvailableBooths(res.data || []);
}).catch(() => toast.error("Failed to fetch available booths"));
  } else {
    setAvailableBooths([]);
    setFormData((prev) => ({ ...prev, booth: "" }));
  }
}, [formData.event, formData.scheduledate, formData.StartTime, formData.EndTime]);


const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};



  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/api/schedule", formData);
      if (res.data.success) {
        toast.success("Schedule created!");
        navigate("/display-schedule");
      } else {
        toast.error(res.data.message || "Error creating schedule");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create schedule");
    }
  };

  return (
    <ComponentCard title="Add New Schedule">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Schedule Title"
          required
        />
        <Input
          name="eventtype"
          value={formData.eventtype}
          onChange={handleChange}
          placeholder="Event Type"
          required
        />
        <Input
          name="speaker"
          value={formData.speaker}
          onChange={handleChange}
          placeholder="Speaker Name (optional)"
        />
        <Select
          name="event"
          value={formData.event}
          onChange={handleChange}
          options={events.map((e) => ({ value: e._id, label: e.title }))}
          placeholder="Select Event"
          required
        />
        <Select
          name="scheduledate"
          value={formData.scheduledate}
          onChange={handleChange}
          options={availableDates.map((date) => ({
            value: date,
            label: new Date(date).toLocaleDateString(),
          }))}
          placeholder="Select Schedule Date"
          required
        />
        <Input
  type="time"
  name="StartTime"
  value={formData.StartTime}
  onChange={handleChange}
  required
/>
<Input
  type="time"
  name="EndTime"
  value={formData.EndTime}
  onChange={handleChange}
  required
/>


        <Select
  name="booth"
  value={formData.booth}
  onChange={handleChange}
  options={availableBooths.map((b) => ({
    value: b.id,    // use booth id as value
    label: b.name,  // show booth name in dropdown
  }))}
  placeholder="Select Booth"
  required
/>

        <Button type="submit" className="bg-blue-600 text-white p-2 px-4 rounded">
          Create Schedule
        </Button>
      </form>
    </ComponentCard>
  );
}
