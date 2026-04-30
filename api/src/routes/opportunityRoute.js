const express = require('express');
const {
  createOpportunity,
  getOpportunityById,
  getOpportunity,
  updateOpportunity,
  getLatestOpportunities,
} = require('../controllers/opportunityController');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const { validate } = require('../middleware/validate');
const schemas = require('../middleware/schemas');

const router = express.Router();

router.post(
  '/createOpp',
  verifyToken,
  verifyAuth,
  validate(schemas.createOpportunity),
  createOpportunity
);
router.put(
  '/update/:id',
  verifyToken,
  verifyAuth,
  validate(schemas.updateOpportunity),
  updateOpportunity
);
router.get('/getOpp/:id', verifyToken, getOpportunityById);
router.get('/getOpp', verifyToken, getOpportunity);
router.get('/getLatestOpp', verifyToken, getLatestOpportunities);

module.exports = router;
