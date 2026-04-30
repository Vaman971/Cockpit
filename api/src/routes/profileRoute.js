const express = require('express');
const verifyToken = require('../utils/verifyToken');
const {
  updateProfile,
  getProfile,
  getAllProfile,
  getProfiles,
  getProfileDetails,
  getSingleProfileDetails,
} = require('../controllers/profileController');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage });

router.put(
  '/updateUserProfile/:username',
  verifyToken,
  upload.single('profileImage'),
  updateProfile
);
router.get('/getProfile/:username', verifyToken, getProfile);
router.get('/getAll', verifyToken, getAllProfile);
router.get('/getProfiles', verifyToken, getProfiles);
router.get('/getProfileDetails', verifyToken, getProfileDetails);
router.get('/getSingleProfileDetails/:userId', verifyToken, getSingleProfileDetails);

module.exports = router;
