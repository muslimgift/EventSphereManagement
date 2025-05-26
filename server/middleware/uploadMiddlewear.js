const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Allow only image files (jpeg, png, svg, etc.)
const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(null, false);
};

const upload = multer({ storage, fileFilter });
module.exports=upload
