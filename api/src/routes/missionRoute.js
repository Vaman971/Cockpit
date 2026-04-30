const express = require('express');
const {
  createMission,
  updateMission,
  getMissionById,
  getMission,
  getLatestMission,
  getMissionsByProjectId,
  assignCustomerToMission,
} = require('../controllers/missionController');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const router = express.Router();

router.post('/createMission', verifyToken, verifyAuth, createMission);
router.put('/update/:id', verifyToken, verifyAuth, updateMission);
router.get('/getMission/:id', verifyToken, getMissionById);
router.get('/getAll', verifyToken, getMission);
router.get('/getLatestMission', verifyToken, getLatestMission);
router.get('/getMissionByProjId/:id', verifyToken, getMissionsByProjectId);
router.post('/assignCustomerToMission/:missionId', verifyToken, assignCustomerToMission);

module.exports = router;
