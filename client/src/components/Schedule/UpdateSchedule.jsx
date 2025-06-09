import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Select from "../form/Select";
import MultiSelect from "../form/MultiSelect";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { debounce } from "lodash";

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

  // Fetch all events once
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/event")
      .then((res) => {
        setEvents(res.data.data || []);
      })
      .catch(() => toast.error("Failed to load events"));
  }, []);

  // Fetch schedule details to pre-fill form
  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/schedule/${id}`)
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

  // Debounced booth fetch function
  const fetchAvailableBooths = useCallback(
    debounce(({ event, scheduledate, StartTime, EndTime }) => {
      if (event && scheduledate && StartTime && EndTime) {
        axios
          .get(`http://localhost:3000/api/schedule/available/booths`, {
            params: { eventId: event, scheduledate, StartTime, EndTime },
          })
          .then((res) => {
            setAvailableBooths(res.data.booths || res.data || []);
          })
          .catch(() => toast.error("Failed to fetch booths"));
      } else {
        setAvailableBooths([]);
        setFormData((prev) => ({ ...prev, booth: [] }));
      }
    }, 500),
    [] // empty dependency so function instance is stable
  );

  // Call debounced booth fetch when formData dependencies change
  useEffect(() => {
    fetchAvailableBooths({
      event: formData.event,
      scheduledate: formData.scheduledate,
      StartTime: formData.StartTime,
      EndTime: formData.EndTime,
    });

    return () => {
      fetchAvailableBooths.cancel();
    };
  }, [formData.event, formData.scheduledate, formData.StartTime, formData.EndTime, fetchAvailableBooths]);

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

  // Submit updated schedule
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:3000/api/schedule/${id}`, formData);
      if (res.data.success) {
        toast.success("Schedule updated successfully!");
        navigate("/display-schedule");
      } else {
        toast.error(res.data.message || "Failed to update schedule");
      }
    } catch (error) {
      toast.error("Update failed: " + (error.response?.data?.message || error.message));
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
          options={availableBooths.map((b) => ({ text: b.name || b, value: b.id || b._id || b }))}
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
