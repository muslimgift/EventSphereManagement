const Booth = require("../Models/BoothModel");
const ExpoCenter = require("../Models/ExpoSchema");


const BoothController = {
  // ✅ Create Booth
  addBooth: async (req, res) => {
    try {
      const { name, expoCenter } = req.body;

      if (!name || !expoCenter) {
        return res.status(400).json({ success: false, message: "Booth name and expoCenter are required" });
      }

      const expoExists = await ExpoCenter.findById(expoCenter);
      if (!expoExists) {
        return res.status(404).json({ success: false, message: "Expo center not found" });
      }

      const newBooth = new Booth({
        name,
        expoCenter,
      });

      await newBooth.save();

      res.status(201).json({ success: true, message: "Booth created successfully", data: newBooth });
    } catch (error) {
      console.error("Add Booth Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ✅ Update Booth
  updateBooth: async (req, res) => {
    try {
      const boothId = req.params.id;
      const { name } = req.body;

      const updatedBooth = await Booth.findByIdAndUpdate(
        boothId,
        { name },
        { new: true }
      );

      if (!updatedBooth) {
        return res.status(404).json({ success: false, message: "Booth not found" });
      }

      res.status(200).json({ success: true, message: "Booth updated successfully", data: updatedBooth });
    } catch (error) {
      console.error("Update Booth Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ✅ Delete Booth
  deleteBooth: async (req, res) => {
    try {
      const boothId = req.params.id;

      const deleted = await Booth.findByIdAndDelete(boothId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Booth not found" });
      }

      res.status(200).json({ success: true, message: "Booth deleted successfully" });
    } catch (error) {
      console.error("Delete Booth Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ✅ Get All Booths
  getAllBooths: async (req, res) => {
    try {
      const booths = await Booth.find().populate("expoCenter");
      res.status(200).json({ success: true, data: booths });
    } catch (error) {
      console.error("Get All Booths Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ✅ Get Booth by ID
  getBoothById: async (req, res) => {
    try {
      const boothId = req.params.id;
      const booth = await Booth.findById(boothId).populate("expoCenter");

      if (!booth) {
        return res.status(404).json({ success: false, message: "Booth not found" });
      }

      res.status(200).json({ success: true, data: booth });
    } catch (error) {
      console.error("Get Booth By ID Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  getBoothByExpoId:async(req,res)=>{
    const { expoCenterId } = req.params;
  const filter = {};
  if (expoCenterId) {
    filter.expoCenter = expoCenterId;
  }
  const booths = await Booth.find(filter);
  res.json(booths);
  },

addBookedEventToBooths: async (req, res) => {
  const { booths, eventId, startDate, endDate } = req.body;

  try {
    if (!booths || !eventId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    for (const boothId of booths) {
      const booth = await Booth.findById(boothId);
      if (!booth) continue;

      const alreadyExists = booth.bookedEvents.some(
        (entry) => entry.eventId.toString() === eventId
      );

      if (!alreadyExists) {
        booth.bookedEvents.push({ eventId, startDate, endDate });
        await booth.save();
      }
    }

    res.status(200).json({ message: 'Event booked in booths successfully' });
  } catch (error) {
    console.error("Add Booked Event Error:", error);
    res.status(500).json({ error: 'Failed to add booked event to booths' });
  }
},


// Remove event ID from booked array of each booth
removeBookedEventFromBooths : async (req, res) => {
  try {
    const { booths, eventId } = req.body;

    if (!Array.isArray(booths) || booths.length === 0) {
      return res.status(400).json({ message: 'No booths provided for update' });
    }

    // Remove the eventId from each booth's bookedEvents array
    await Promise.all(
      booths.map(async (boothId) => {
        await Booth.findByIdAndUpdate(boothId, {
          $pull: { bookedEvents: { eventId: eventId.toString() } },
        });
      })
    );

    if (res?.status) {
      return res.status(200).json({ message: 'Event removed from booths successfully' });
    }
  } catch (error) {
    console.error('Error removing booked event from booths:', error);
    if (res?.status) {
      return res.status(500).json({ message: 'Failed to remove event from booths', error: error.message });
    }
  }


}
};

module.exports=BoothController;