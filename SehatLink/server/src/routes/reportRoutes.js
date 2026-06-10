const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadReport,
  getPatientReports,
  getReportById,
  deleteReport
} = require('../controllers/reportController');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Uploads directory created at:', uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'report-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and PDF files are allowed'), false);
  }
};

// Multer configuration with error handling
const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Routes
router.post('/upload', upload.single('file'), (req, res, next) => {
  if (req.file) {
    console.log('File uploaded:', req.file.filename);
  }
  next();
}, uploadReport);

router.get('/', getPatientReports);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

module.exports = router;