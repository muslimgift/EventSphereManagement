const expoModel = require('../Models/ExpoSchema');

let expoController = {
// get expocenter
getExpoCenters: async (req, res) => {
  try {
    const expoCenters = await expoModel.find(); // corrected variable name
    res.json({
      message: "Expo Centers fetched successfully",
      status: true,
      data: expoCenters, // changed from 'users' to 'expoCenters'
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Error fetching Expo Centers" });
  }
},

// DELETE an ExpoCenter by ID
deleteExpoCenter : async (req, res) => {
  try {
    const expoCenter = await expoModel.findByIdAndDelete(req.params.id);
    if (!expoCenter) {
      return res.status(404).json({ success: false, error: "Expo center not found" });
    }

    // Optionally delete image files
    expoCenter.images.forEach((imgPath) => {
      const fullPath = `.${imgPath}`;
      fs.existsSync(fullPath) && fs.unlinkSync(fullPath);
    });

    res.status(200).json({ success: true, message: "Expo center deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
},

//  GET single ExpoCenter by ID
getExpoCenterById : async (req, res) => {
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

//create expo center


createExpoCenter : async (req, res) => {
  try {
    const { name, location, description, facilities, booths } = req.body;

    // Parse JSON fields safely
    const parsedLocation = location ? JSON.parse(location) : null;
    const parsedBooths = booths ? JSON.parse(booths) : [];

    if (!parsedLocation || !parsedBooths.length || !description || !name) {
      return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    const images = req.files["images"]?.map((file) => `/uploads/${file.filename}`) || [];
    const mapSvgFile = req.files['mapSvg'] ? req.files['mapSvg'][0] : null;

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
}
}





module.exports = expoController;
