const multer = require("multer");
const path = require("path");

// ==========================================
// STORAGE CONFIGURATION
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    const extension = path.extname(file.originalname);

    cb(null, uniqueName + extension);
  },
});

// ==========================================
// ALLOWED FILE TYPES
// ==========================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF, JPG and PNG files are allowed."),
      false
    );
  }
};

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter,
});

module.exports = upload;