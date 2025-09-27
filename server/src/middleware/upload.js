const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

// Configure storage for uploaded files (in-memory for now, can be replaced with S3, etc.)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new AppError('Unsupported file type', 400));
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter,
});

module.exports = upload;
