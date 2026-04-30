const express = require('express');
const verifyToken = require('../utils/verifyToken');
const verifyAuth = require('../utils/verifyAuth');
const {
  updateProject,
  deleteProject,
  getProjectById,
  getProject,
  getProjectByOpportunityId,
  getProjectExcelData,
} = require('../controllers/projectController');
const { validate } = require('../middleware/validate');
const schemas = require('../middleware/schemas');

const router = express.Router();

router.put('/update/:id', verifyToken, verifyAuth, validate(schemas.updateProject), updateProject);
router.delete('/delete/:id', verifyToken, verifyAuth, deleteProject);
router.get('/getProj/:id', verifyToken, getProjectById);
router.get('/getProjOpp/:oppurtunity_id', verifyToken, getProjectByOpportunityId);
router.get('/getProj', verifyToken, getProject);
router.get('/getProjectExcel', verifyToken, getProjectExcelData);

module.exports = router;
