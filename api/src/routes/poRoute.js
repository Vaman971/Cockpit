const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  createPo,
  getPo,
  getPoById,
  updatePo,
  getLatestPo,
} = require('../controllers/poController');
const { validate } = require('../middleware/validate');
const schemas = require('../middleware/schemas');

const router = express.Router();

router.post('/create', verifyToken, verifyAuth, validate(schemas.createPO), createPo);
router.get('/getAll', verifyToken, verifyAuth, getPo);
router.get('/getPo/:id', verifyToken, verifyAuth, getPoById);
router.put('/update/:id', verifyToken, verifyAuth, validate(schemas.updatePO), updatePo);
router.get('/getLatestPo', verifyToken, verifyAuth, getLatestPo);

module.exports = router;
