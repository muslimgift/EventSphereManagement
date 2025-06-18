import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Select from "../form/Select";
import MultiSelect from "../form/MultiSelect";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const initialState = {
  title: "",
  eventtype: "",
  speaker: "",
  StartTime: "",
  EndTime: "",
  scheduledate: "",
  event: "",
  booth: [],
  attendees: [],
};

export default function UpdateSchedule() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialState);
  const [events, setEvents] = useState([]);
  const [availableBooths, setAvailableBooths] = useState([]);
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  // Fetch all events once
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/event`)
      .then((res) => {
        setEvents(res.data.data || []);
      })
      .catch(() => toast.error("Failed to load events"));
  }, []);

  // Fetch schedule details to pre-fill form
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/schedule/${id}`)
      .then((res) => {
        const sched = res.data;
        setFormData({
          title: sched.title || "",
          eventtype: sched.eventtype || "",
          speaker: sched.speaker || "",
          StartTime: sched.StartTime ? sched.StartTime.slice(0, 5) : "",
          EndTime: sched.EndTime ? sched.EndTime.slice(0, 5) : "",
          scheduledate: sched.scheduledate ? sched.scheduledate.slice(0, 10) : "",
          event: sched.event?._id || sched.event || "",
          booth: Array.isArray(sched.booth) ? sched.booth : [],
          attendees: Array.isArray(sched.attendees) ? sched.attendees.map((a) => a._id) : [],
        });
      })
      .catch(() => toast.error("Failed to load schedule details"));
  }, [id]);

 // Updated booth fetch function without debounce and with excludeScheduleId support
const fetchAvailableBooths = useCallback(
  ({ event, scheduledate, StartTime, EndTime, excludeScheduleId }) => {
    if (event && scheduledate && StartTime && EndTime) {
      axios
        .get(`${BASE_URL}/api/schedule/available/booths`, {
          params: {
            eventId: event,
            scheduledate,
            StartTime,
            EndTime,
            excludeScheduleId, // Add only if defined
          },
        })
        .then((res) => {
          setAvailableBooths(res.data.booths || res.data || []);
        })
        .catch(() => toast.error("Failed to fetch booths"));
    } else {
      setAvailableBooths([]);
      setFormData((prev) => ({ ...prev, booth: [] }));
    }
  },
  [] // No debounce, function is still memoized
);


useEffect(() => {
  fetchAvailableBooths({
    event: formData.event,
    scheduledate: formData.scheduledate,
    StartTime: formData.StartTime,
    EndTime: formData.EndTime,
    excludeScheduleId: id // <-- use URL param directly
  });
}, [
  formData.event,
  formData.scheduledate,
  formData.StartTime,
  formData.EndTime,
  id, // dependency
  fetchAvailableBooths
]);



  // Handle input change (for text/select inputs)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // MultiSelect change handlers
  const handleBoothChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      booth: selected,
    }));
  };

  const handleAttendeesChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      attendees: selected,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate booth selection
  if (!formData.booth || formData.booth.length === 0) {
    toast.error("Please select at least one booth");
    return;
  }

  try {
    const res = await axios.put(`${BASE_URL}/api/schedule/${id}`, formData);

    if (res.data.success) {
      toast.success("Schedule updated successfully!");
      navigate("/display-schedule");
    } else {
      toast.error(res.data.message || "Failed to update schedule");
    }
  } catch (error) {
    // More informative error toast from backend if available
    if (error.response?.data?.message) {
      toast.error("Update failed: " + "error.response.data.message");
    } else {
      toast.error("Update failed: " + error.message);
    }
  }
};

  return (
    <ComponentCard title="Update Schedule">
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
        />
        <Input
          name="speaker"
          value={formData.speaker}
          onChange={handleChange}
          placeholder="Speaker"
        />
        <Input
          type="time"
          name="StartTime"
          value={formData.StartTime}
          onChange={handleChange}
          required
          placeholder="Start Time"
        />
        <Input
          type="time"
          name="EndTime"
          value={formData.EndTime}
          onChange={handleChange}
          required
          placeholder="End Time"
        />
        <Input
          type="date"
          name="scheduledate"
          value={formData.scheduledate}
          onChange={handleChange}
          required
          placeholder="Schedule Date"
        />
        <Select
          name="event"
          value={formData.event}
          onChange={handleChange}
          options={events.map((ev) => ({ label: ev.title, value: ev._id }))}
          placeholder="Select Event"
          required
        />
        
 <MultiSelect
  label="Select Booth(s)"
  options={availableBooths.map((b) => ({ text: b.name, value: b._id }))}
  selectedOptions={formData.booth}
  onChange={handleBoothChange}
  disabled={availableBooths.length === 0}
/>


        <MultiSelect
          label="Select Attendees"
          options={[]} // You can fetch and populate attendees list if needed
          selectedOptions={formData.attendees}
          onChange={handleAttendeesChange}
        />
        <Button type="submit" className="bg-green-600 text-white p-2 px-4 rounded">
          Update Schedule
        </Button>
      </form>
    </ComponentCard>
  );
}
