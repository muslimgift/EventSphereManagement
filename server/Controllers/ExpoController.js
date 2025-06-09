const path = require("path");
const fs = require("fs");
const expoModel = require("../Models/ExpoSchema");
const eventModel = require("../Models/EventSchema");

let expoController = {
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
      const { name, location, description, facilities, booths } = req.body;

      const parsedLocation = location ? JSON.parse(location) : null;
      const parsedBooths = booths ? JSON.parse(booths).map((booth) => ({
        name: booth.name,
        status: booth.status || "available",
        locations: booth.locations?.map((loc) => ({
          name: loc.name,
          price: loc.price,
          status: loc.status || "available",
        })) || [],
      })) : [];

      if (!parsedLocation || !parsedBooths.length || !description || !name) {
        return res.status(400).json({ success: false, error: "Missing required fields." });
      }

      const images = req.files["images"]?.map((file) => `/uploads/${file.filename}`) || [];
      const mapSvgFile = req.files["mapSvg"] ? req.files["mapSvg"][0] : null;
      const mapSvg = mapSvgFile ? `/uploads/${mapSvgFile.filename}` : null;

      if (!mapSvg || !images.length) {
        return res.status(400).json({ success: false, error: "Images and Map SVG are required" });
      }

      const newExpoCenter = new expoModel({
        name,
        location: parsedLocation,
        description,
        images,
        facilities,
        mapSvg,
        booths: parsedBooths,
      });

      await newExpoCenter.save();
      res.status(201).json({ success: true, data: newExpoCenter });
    } catch (error) {
      console.error("Error creating expo center:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update Expo Center
  updateExpoCenter: async (req, res) => {
    try {
      const expoId = req.params.id;
      const existingExpo = await expoModel.findById(expoId);

      if (!existingExpo) {
        return res.status(404).json({ message: "Expo Center not found" });
      }

      // Delete previous images if new ones are uploaded
      if (req.files.images) {
        existingExpo.images.forEach((imgPath) => {
          const fullPath = path.join(__dirname, "..", "..", "uploads", path.basename(imgPath));
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        });
      }

      // Delete previous mapSvg if new one uploaded
      if (req.files.mapSvg) {
        const fullMapPath = path.join(__dirname, "..", "..", "uploads", path.basename(existingExpo.mapSvg));
        if (fs.existsSync(fullMapPath)) fs.unlinkSync(fullMapPath);
      }

      const { name, location, description, facilities, booths } = req.body;

      const parsedLocation = location ? JSON.parse(location) : {};
      const parsedBooths = booths ? JSON.parse(booths).map((booth) => ({
        name: booth.name,
        status: booth.status || "available",
        locations: booth.locations?.map((loc) => ({
          name: loc.name,
          price: loc.price,
          status: loc.status || "available",
        })) || [],
      })) : [];

      const updatedData = {
        name,
        location: parsedLocation,
        description,
        facilities,
        booths: parsedBooths,
      };

      if (req.files.images) {
        updatedData.images = req.files.images.map((file) => `/uploads/${file.filename}`);
      }

      if (req.files.mapSvg) {
        updatedData.mapSvg = `/uploads/${req.files.mapSvg[0].filename}`;
      }

      const updatedExpo = await expoModel.findByIdAndUpdate(expoId, updatedData, { new: true });
      res.status(200).json({ message: "Expo center updated", data: updatedExpo });
    } catch (error) {
      console.error("Update Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Delete Expo Center (prevent deletion if linked Events exist)
  deleteExpoCenter: async (req, res) => {
    try {
      const expoCenterId = req.params.id;

      const linkedEvents = await eventModel.findOne({ expoCenter: expoCenterId });

      if (linkedEvents) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete Expo Center because events are linked to it.",
        });
      }

      const expoCenter = await expoModel.findByIdAndDelete(expoCenterId);
      if (!expoCenter) {
        return res.status(404).json({ success: false, error: "Expo center not found" });
      }

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

      return res.status(200).json({ success: true, message: "Expo center deleted" });
    } catch (error) {
      console.error("Delete ExpoCenter Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = expoController;
