const multer = require("multer");
const EventRegistration = require("../Models/EventRegistration");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "exhibitors/"); // Create this directory if it doesn't exist
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
// Allow only image files (jpeg, png, svg, etc.)
const fileFilter = (req, file, cb) => {
  const allowed = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(null, false);
};
const exhibitors = multer({ storage,fileFilter });

module.exports = { exhibitors };
