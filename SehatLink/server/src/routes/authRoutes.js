const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { register, login, getUserById, uploadAvatar, updateProfile, getCompleteProfile, getDoctorCompleteProfile, updateDoctorProfile } = require('../controllers/authController');

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory:', uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (JPEG, PNG, GIF)'));
  }
};

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter 
});

router.post('/register', register);
router.post('/login', login);
router.get('/users/:id', getUserById);

router.post('/upload-avatar', upload.single('avatar'), uploadAvatar);
router.put('/profile/:userId', updateProfile);
router.get('/complete-profile/:userId', getCompleteProfile);
router.get('/doctor-complete-profile/:userId', getDoctorCompleteProfile);
router.put('/doctor-profile/:userId', updateDoctorProfile);
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ success: false, message: 'File too large. Max size 2MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

module.exports = router;