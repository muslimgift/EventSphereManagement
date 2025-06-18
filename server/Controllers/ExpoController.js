const path = require("path");
const fs = require("fs");
const expoModel = require("../Models/ExpoSchema");
const eventModel = require("../Models/EventSchema");
const boothModel = require("../Models/BoothModel");
const locationModel = require("../Models/LocationModel");

const expoController = {
  // Get all expo centers
  getExpoCenters: async (req, res) => {
    try {
      const expoCenters = await expoModel.find();
      res.json({
        message: "Expo Centers fetched successfully",
        status: true,
        data: expoCenters,
      });
    } catch (err) {
      res.status(500).json({ status: false, message: "Error fetching Expo Centers: " + err });
    }
  },

  // Get single Expo Center by ID
  getExpoCenterById: async (req, res) => {
    try {
      const expoCenter = await expoModel.findById(req.params.id);
      if (!expoCenter) {
        return res.status(404).json({ success: false, error: "Expo center not found" });
      }
      res.status(200).json({ success: true, data: expoCenter });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Create new Expo Center
  createExpoCenter: async (req, res) => {
    try {
      const { name, location, description, facilities } = req.body;

      const parsedLocation = location ? JSON.parse(location) : null;
      const images = req.files["images"]?.map((file) => `/uploads/${file.filename}`) || [];
      const mapSvgFile = req.files["mapSvg"] ? req.files["mapSvg"][0] : null;
      const mapSvg = mapSvgFile ? `/uploads/${mapSvgFile.filename}` : null;

      if (!name || !parsedLocation || !description || !mapSvg || !images.length) {
        return res.status(400).json({ success: false, error: "Missing required fields." });
      }

      const newExpoCenter = new expoModel({
        name,
        location: parsedLocation,
        description,
        images,
        facilities,
        mapSvg,
      });

      await newExpoCenter.save();
      res.status(201).json({ success: true, data: newExpoCenter });
    } catch (error) {
      console.error("Error creating expo center:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update Expo Center


updateExpoCenter : async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, description, facilities } = req.body;

    // 1️⃣ Load existing expo
    const expo = await expoModel.findById(id);
    if (!expo) return res.status(404).json({ message: "Expo not found" });

    // 2️⃣ Find all booths for this expo
    const existingBooths = await boothModel.find({ expoCenter: id });

    // 3️⃣ If any booth has bookedEvents, block everything
    if (existingBooths.some((b) => b.bookedEvents.length > 0)) {
      return res.status(400).json({
        message: "Cannot update booths/locations: some booths have booked events",
      });
    }

    // 4️⃣ Delete old files if replaced
    if (req.files?.images) {
      expo.images.forEach((img) => {
        const p = path.join(__dirname, "..", "..", "uploads", path.basename(img));
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });
    }
    if (req.files?.mapSvg) {
      const p = path.join(__dirname, "..", "..", "uploads", path.basename(expo.mapSvg));
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    // 6️⃣ Update expo core fields + files
    const updated = {
      name,
      location: JSON.parse(location),
      description,
      facilities,
    };
    if (req.files?.images) {
      updated.images = req.files.images.map((f) => `/uploads/${f.filename}`);
    }
    if (req.files?.mapSvg) {
      updated.mapSvg = `/uploads/${req.files.mapSvg[0].filename}`;
    }
    await expoModel.findByIdAndUpdate(id, updated);

    // 7️⃣ Re-create booths & locations from payload
    const booths = req.body.booths ? JSON.parse(req.body.booths) : [];
    for (let b of booths) {
      const newBooth = await boothModel.create({
        name: b.name,
        expoCenter: id,
      });
      if (Array.isArray(b.locations)) {
        const locDocs = b.locations.map((loc) => ({
          name: loc.name,
          price: loc.price,
          Booth: newBooth._id,
        }));
        await locationModel.insertMany(locDocs);
      }
    }

    return res.json({ message: "ExpoCenter, booths & locations updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
},

deleteExpoCenter: async (req, res) => {
  try {
    const expoCenterId = req.params.id;

    // 1. Check if any event uses this expo center
    const linkedEvents = await eventModel.findOne({ expoCenter: expoCenterId });
    if (linkedEvents) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete Expo Center because events are linked to it.",
      });
    }

    // 2. Find all booths linked to this expo center
    const booths = await boothModel.find({ expoCenter: expoCenterId });

    // 3. Extract booth ids
    const boothIds = booths.map((b) => b._id);

    // 4. Delete all locations linked to those booths
    await locationModel.deleteMany({ Booth: { $in: boothIds } });

    // 5. Delete all booths linked to expo center
    await boothModel.deleteMany({ expoCenter: expoCenterId });

    // 6. Delete Expo Center document
    const expoCenter = await expoModel.findByIdAndDelete(expoCenterId);
    if (!expoCenter) {
      return res.status(404).json({ success: false, error: "Expo center not found" });
    }

    // 7. Delete image files and mapSvg from filesystem
    expoCenter.images.forEach((imgPath) => {
      const fullPath = path.resolve(`.${imgPath}`);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.warn(`Failed to delete image file: ${fullPath}`, err);
        }
      }
    });

    if (expoCenter.mapSvg) {
      const mapPath = path.resolve(`.${expoCenter.mapSvg}`);
      if (fs.existsSync(mapPath)) {
        try {
          fs.unlinkSync(mapPath);
        } catch (err) {
          console.warn(`Failed to delete mapSvg file: ${mapPath}`, err);
        }
      }
    }

    return res.status(200).json({ success: true, message: "Expo center and associated booths and locations deleted" });
  } catch (error) {
    console.error("Delete ExpoCenter Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
},
};

module.exports = expoController;
