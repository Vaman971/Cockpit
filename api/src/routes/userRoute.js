const express = require('express');
const {
  createUser,
  updateUser,
  getUserById,
  getUsers,
  updatePassword,
  getUserDetails,
  getMissionDetails,
} = require('../controllers/userController');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const router = express.Router();

router.post('/createUser', verifyToken, verifyAuth, createUser);
router.put('/updateUser/:id', verifyToken, verifyAuth, updateUser);
router.get('/getuserDetails', getUserDetails);
router.get('/getmissionDetails', getMissionDetails);
router.get('/getUserbyId/:id', verifyToken, getUserById);
router.put('/updatePassword/:user_id', updatePassword);
router.get('/getusers', getUsers);

module.exports = router;
