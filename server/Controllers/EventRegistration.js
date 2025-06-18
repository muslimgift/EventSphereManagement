const EventRegistration = require("../Models/EventRegistration");
const Location = require("../Models/LocationModel");

const EventRegistrationController = {
  // Fetch all registered events
  getRegisterEvent: async (req, res) => {
    try {
      const events = await EventRegistration.find()
        .populate("user")
        .populate("boothId")
        .populate("locationId")
        .populate({
          path: "event",
          populate: { path: "expoCenter" },
        });

      const enrichedEvents = events.map((registration) => ({
        ...registration.toObject(),
        boothName: registration.boothId?.name || "N/A",
        locationName: registration.locationId?.name || "N/A",
      }));

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

  // Fetch registration by ID
  getEventRegistrationById: async (req, res) => {
    const { id } = req.params;

    try {
      const registration = await EventRegistration.findById(id)
        .populate("user")
        .populate("boothId")
        .populate("locationId")
        .populate({
          path: "event",
          populate: { path: "expoCenter" },
        });

      if (!registration) {
        return res.status(404).json({ status: false, message: "Registration not found" });
      }

      const boothName = registration.boothId?.name || "N/A";
      const locationName = registration.locationId?.name || "N/A";
      const boothPrice = registration.locationId?.price || null;

      res.status(200).json({
        status: true,
        message: "Event registration fetched successfully",
        registration: {
          ...registration.toObject(),
          boothName,
          locationName,
          boothPrice,
          file: registration.file,
        },
      });
    } catch (error) {
      console.error("Error in getEventRegistrationById:", error);
      res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
  },

  // Delete a registration
  deleteEventById: async (req, res) => {
    const { id } = req.params;

    try {
      const deletedevent = await EventRegistration.findByIdAndDelete(id);

      if (!deletedevent) {
        return res.status(404).json({ status: false, message: "No Registered Event found" });
      }

      await Location.findByIdAndUpdate(deletedevent.locationId, {
        $pull: { bookedEventRegs: { eventRegId: deletedevent._id } },
      });

      return res.status(200).json({ status: true, message: "Registered Location Deleted Successfully" });
    } catch (error) {
      console.error("Error deleting event registration:", error);
      return res.status(500).json({ status: false, message: "Server error" });
    }
  },

  // Update registration status
  updateEventRegistrationStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ status: false, message: "Current status is required" });
    }

    try {
      const updatedApplication = await EventRegistration.findByIdAndUpdate(
        id,
        { status },
        { new: true }
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

  // Create a new event registration
  registerEvent: async (req, res) => {
    try {
      const { user, event, boothId, locationId, StallName, Product, StaffName, status } = req.body;
      const file = req.file;

      if (!user || !event || !boothId || !locationId || !StallName || !file || !Product || !StaffName) {
        return res.status(400).json({ message: "Missing required fields including file" });
      }

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
        status,
      });

      await registration.save();

      await Location.findByIdAndUpdate(locationId, {
        $push: {
          bookedEventRegs: {
            eventRegId: registration._id,
            eventId: event,
            date: new Date(),
          },
        },
      });

      res.status(201).json({ message: "Event registered successfully", registration });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Update existing registration
  updateEventRegistrationById: async (req, res) => {
    const { id } = req.params;
    const { user, event, boothId, locationId, StallName, Product, StaffName, status } = req.body;
    const file = req.file;

    const boothIdFinal = boothId && typeof boothId === 'object' ? boothId._id : boothId;
    const locationIdFinal = locationId && typeof locationId === 'object' ? locationId._id : locationId;

    try {
      const existing = await EventRegistration.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "Registration not found" });
      }

      // Check for conflicting booking
      if (event && boothIdFinal && locationIdFinal) {
        const existingBooking = await EventRegistration.findOne({
          _id: { $ne: id },
          event,
          boothId: boothIdFinal,
          locationId: locationIdFinal,
        });

        if (existingBooking) {
          return res.status(400).json({ message: "This location is already booked for the event." });
        }
      }

      // Remove from old location bookings
      await Location.findByIdAndUpdate(existing.locationId, {
        $pull: { bookedEventRegs: { eventRegId: existing._id } },
      });

      // Prepare update fields
      const updatedFields = {
        ...(user && { user }),
        ...(event && { event }),
        ...(boothIdFinal && { boothId: boothIdFinal }),
        ...(locationIdFinal && { locationId: locationIdFinal }),
        ...(StallName && { StallName }),
        ...(Product && { Product }),
        ...(StaffName && { StaffName }),
        ...(status && { status }),
        ...(file && { file: file.path }),
      };

      const updatedRegistration = await EventRegistration.findByIdAndUpdate(id, updatedFields, {
        new: true,
      });

      if (!updatedRegistration) {
        return res.status(404).json({ status: false, message: "Registration not found" });
      }

      // Add to new location booking
      if (locationIdFinal) {
        await Location.findByIdAndUpdate(locationIdFinal, {
          $push: {
            bookedEventRegs: {
              eventRegId: updatedRegistration._id,
              eventId: event || existing.event,
              date: new Date(),
            },
          },
        });
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

  // Get all booked locations for a given event
  getBookedLocations: async (req, res) => {
    try {
      const eventId = req.params.eventId;

      const locations = await Location.find({ "bookedEventRegs.eventId": eventId }).select("_id Booth");

      const bookedLocations = locations.map((loc) => ({
        locationId: loc._id.toString(),
        boothId: loc.Booth.toString(),
      }));

      res.json({ bookedLocations });
    } catch (error) {
      console.error("Error fetching booked locations:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = EventRegistrationController;
