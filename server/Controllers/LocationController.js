const Location = require("../Models/LocationModel");
const Booth = require("../Models/BoothModel");
const mongoose = require('mongoose');
const EventRegistration = require('../Models/EventRegistration');
const Event = require('../Models/EventSchema');
const locationController = {
  // ✅ Create Location
  addLocation: async (req, res) => {
    try {
      const { name, price, Booth: boothId } = req.body;

      if (!name || !price || !boothId) {
        return res.status(400).json({ success: false, message: "Name, price, and Booth are required" });
      }

      const boothExists = await Booth.findById(boothId);
      if (!boothExists) {
        return res.status(404).json({ success: false, message: "Booth not found" });
      }

      const newLocation = new Location({
        name,
        price,
        Booth: boothId,
      });

      await newLocation.save();

      res.status(201).json({ success: true, message: "Location created successfully", data: newLocation });
    } catch (error) {
      console.error("Add Location Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ✅ Update Location
  updateLocation: async (req, res) => {
    try {
      const locationId = req.params.id;
      const { name, price } = req.body;

      const updatedLocation = await Location.findByIdAndUpdate(
        locationId,
        { name, price },
        { new: true }
      );

      if (!updatedLocation) {
        return res.status(404).json({ success: false, message: "Location not found" });
      }

      res.status(200).json({ success: true, message: "Location updated successfully", data: updatedLocation });
    } catch (error) {
      console.error("Update Location Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ✅ Delete Location
  deleteLocation: async (req, res) => {
    try {
      const locationId = req.params.id;

      const deleted = await Location.findByIdAndDelete(locationId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Location not found" });
      }

      res.status(200).json({ success: true, message: "Location deleted successfully" });
    } catch (error) {
      console.error("Delete Location Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ✅ Get All Locations
  getAllLocations: async (req, res) => {
    try {
      const locations = await Location.find().populate("Booth");
      res.status(200).json({ success: true, data: locations });
    } catch (error) {
      console.error("Get All Locations Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ✅ Get Location by ID
  getLocationById: async (req, res) => {
    try {
      const locationId = req.params.id;

      const location = await Location.findById(locationId).populate("Booth");

      if (!location) {
        return res.status(404).json({ success: false, message: "Location not found" });
      }

      res.status(200).json({ success: true, data: location });
    } catch (error) {
      console.error("Get Location By ID Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },
getLocationsByBooth: async (req, res) => {
  try {
    const { boothId } = req.params;
    const { eventId, registrationId } = req.query;

    if (!boothId || !eventId) {
      return res.status(400).json({ message: 'Booth ID and Event ID are required' });
    }

    // Get all registrations for this event and booth
    const registrations = await EventRegistration.find({
      event: eventId,
      boothId,
    });

    let bookedLocationIds = registrations.map((reg) => reg.locationId.toString());

    // If editing, allow already selected location
    if (registrationId) {
      const currentReg = await EventRegistration.findById(registrationId);
      if (currentReg && currentReg.locationId) {
        const currentLocationId = currentReg.locationId.toString();
        bookedLocationIds = bookedLocationIds.filter((id) => id !== currentLocationId);
      }
    }

    // FIX: Use Booth with capital B
    const locations = await Location.find({
      Booth: boothId,
      _id: { $nin: bookedLocationIds },
    });

    res.status(200).json({ data: locations });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
},
getAllLocationsByBooth: async (req, res) => {
  try {
    const { boothId } = req.params;
    const locations = await Location.find({ Booth: boothId });
    res.status(200).json({ data: locations });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
},

};

module.exports = locationController;
