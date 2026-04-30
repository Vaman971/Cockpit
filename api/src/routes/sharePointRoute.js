const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  createSharepointLink,
  getSharepointLinkById,
  deleteSharepointLink,
  getSharepointLink,
  assignLinkToMission,
  updateSharepointLink,
} = require('../controllers/sharePointController');
const router = express.Router();

router.post('/createSharepointLink', verifyAuth, createSharepointLink);
router.get('/getSharepointLinkById/:id', verifyToken, verifyAuth, getSharepointLinkById);
router.delete('/deleteSharepointLink/:id', verifyToken, verifyAuth, deleteSharepointLink);
router.get('/getSharepointLink', verifyToken, verifyAuth, getSharepointLink);
router.put('/updateSharepointLink/:id', verifyToken, verifyAuth, updateSharepointLink);
router.post('/assignLinkToMission/:id', verifyToken, verifyAuth, assignLinkToMission);

module.exports = router;
