const EventRegistration = require("../Models/EventRegistration");
const EventRegistrationController={

getRegisterEvent: async (req, res) => {
  try {
    const events = await EventRegistration.find()
      .populate("user")
      .populate({
        path: "event",
        populate: { path: "expoCenter" },
      });

    // Enhance each eventRegistration with boothName and locationName
    const enrichedEvents = events.map((registration) => {
      const { event, boothId, locationId } = registration;
      let boothName = "N/A";
      let locationName = "N/A";

      if (event?.expoCenter?.booths) {
        const booth = event.expoCenter.booths.find((b) => b.id === boothId);
        if (booth) {
          boothName = booth.name;
          const location = booth.locations.find((loc) => loc.id === locationId);
          if (location) locationName = location.name;
        }
      }

      return {
        ...registration.toObject(),
        boothName,
        locationName,
      };
    });

    res.json({
      message: "Events fetched successfully",
      status: true,
      events: enrichedEvents,
    });
  } catch (err) {
    console.error("Error fetching registered events:", err);
    res.status(500).json({ status: false, message: "Error fetching events" });
  }
},

getEventRegistrationById: async (req, res) => {
  const { id } = req.params;

  try {
    const registration = await EventRegistration.findById(id)
      .populate("user")
      .populate({
        path: "event",
        populate: { path: "expoCenter" }, // Nested expoCenter
      });

    if (!registration) {
      return res.status(404).json({ status: false, message: "Registration not found" });
    }

    let boothName = "N/A";
    let locationName = "N/A";
    let boothPrice = null;
    const event = registration.event;
    const boothId = registration.boothId;
    const locationId = registration.locationId;

    const expoCenter = event?.expoCenter;
    if (expoCenter && expoCenter.booths && Array.isArray(expoCenter.booths)) {
      const booth = expoCenter.booths.find((b) => b.id === boothId);
      if (booth) {
        boothName = booth.name;

        const location = booth.locations?.find((loc) => loc.id === locationId);
        if (location) {
        
          locationName = location.name;
          boothPrice = location.price;
        }
      }
    }

    res.status(200).json({
      status: true,
      message: "Event registration fetched successfully",
      registration: {
        ...registration.toObject(),
        boothName,
        locationName,
        boothPrice,
        file: registration.file, // Make sure this exists in your schema
      },
    });
  } catch (error) {
    console.error("Error in getEventRegistrationById:", error);
    res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
},

deleteEventById: async (req, res) => {
  const { id } = req.params;

  try {
    const deletedevent = await EventRegistration.findByIdAndDelete(id);

    if (!deletedevent) {
     
      return res.status(404).json({ status: false, message: "No Registered Event found" });
    }

    return res.status(200).json({ status: true, message: "Registered Location Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
},
updateEventRegistrationStatus: async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ status: false, message: "CurrentStatus is required" });
  }

  try {
    const updatedApplication = await EventRegistration.findByIdAndUpdate(
      id,
      { status },
      { new: true } // return the updated document
    );

    if (!updatedApplication) {
      return res.status(404).json({ status: false, message: "Application not found" });
    }

    res.status(200).json({
      status: true,
      message: "Application status updated successfully",
      events: updatedApplication,
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
},

registerEvent : async (req, res) => {
  try {
    const { user, event, boothId, locationId, StallName,Product,StaffName,status } = req.body;
    const file = req.file;

    if (!user || !event || !boothId || !locationId || !StallName || !file || !Product||!StaffName) {
      return res.status(400).json({ message: "Missing required fields including file" });
    }

    // Check if this location is already booked for this event
    const existingBooking = await EventRegistration.findOne({
      event,
      boothId,
      locationId,
    });

    if (existingBooking) {
      return res.status(400).json({ message: "Location already booked for this event" });
    }

    const registration = new EventRegistration({
      user,
      event,
      boothId,
      locationId,
      StallName,
      file: file.path,
      Product,
      StaffName,
      status
    });

    await registration.save();

    res.status(201).json({ message: "Event registered successfully", registration });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
},
updateEventRegistrationById: async (req, res) => {
  const { id } = req.params;
  const {
    user,
    event,
    boothId,
    locationId,
    StallName,
    Product,
    StaffName,
    status
  } = req.body;
  const file = req.file;

  try {
    // Check if the location is already booked by another registration (optional but good)
    if (event && boothId && locationId) {
      const existingBooking = await EventRegistration.findOne({
        _id: { $ne: id }, // exclude current registration
        event,
        boothId,
        locationId,
      });

      if (existingBooking) {
        return res.status(400).json({ message: "This location is already booked for the event." });
      }
    }

    const updatedFields = {
      ...(user && { user }),
      ...(event && { event }),
      ...(boothId && { boothId }),
      ...(locationId && { locationId }),
      ...(StallName && { StallName }),
      ...(Product && { Product }),
      ...(StaffName && { StaffName }),
      ...(status && { status }),
    };

    if (file) {
      updatedFields.file = file.path;
    }

    const updatedRegistration = await EventRegistration.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true }
    );

    if (!updatedRegistration) {
      return res.status(404).json({ status: false, message: "Registration not found" });
    }

    res.status(200).json({
      status: true,
      message: "Registration updated successfully",
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error("Error updating registration:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
},

getBookedLocations : async (req, res) => {
  try {
    const eventId = req.params.eventId;
    // Find all bookings for this event and select boothId, locationId only
    const bookings = await EventRegistration.find({ event: eventId }).select("boothId locationId -_id");

    // Format result to send only boothId and locationId
    const bookedLocations = bookings.map(b => ({
      boothId: b.boothId.toString(),
      locationId: b.locationId.toString(),
    }));

    res.json({ bookedLocations });
  } catch (error) {
    console.error("Error fetching booked locations:", error);
    res.status(500).json({ message: "Server error" });
  }
}
}
module.exports = EventRegistrationController;