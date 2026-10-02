const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==========================================
// UPLOAD DIRECTORY
// ==========================================

// Always use:
// backend/uploads
const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads"
);

// Create uploads folder automatically
// if it does not exist.
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ==========================================
// STORAGE CONFIGURATION
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    cb(null, uniqueName + extension);
  },
});

// ==========================================
// ALLOWED FILE TYPES
// ==========================================

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const allowedExtensions = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".doc",
    ".docx",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const validMimeType =
    allowedMimeTypes.includes(
      file.mimetype
    );

  const validExtension =
    allowedExtensions.includes(
      extension
    );

  if (
    validMimeType &&
    validExtension
  ) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only PDF, JPG, JPEG, PNG, DOC and DOCX files are allowed."
    ),
    false
  );
};

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const upload = multer({
  storage,

  limits: {
    // Maximum size per file = 5 MB
    fileSize: 5 * 1024 * 1024,

    // Maximum number of files = 5
    files: 5,
  },

  fileFilter,
});

module.exports = upload;