const express = require('express');
const router = express.Router();
const {
  getAllTeams,
  getTeamUsers,
  createTeam,
  getTeamById,
  updateTeam,
  deleteTeamMembers,
  addUsersToTeam,
  deleteUserFromTeam,
  updateUserTeams,
} = require('../controllers/teamController');

router.get('/getallTeams', getAllTeams);
router.get('/getTeamUsers', getTeamUsers);
router.get('/getTeam/:id', getTeamById);
router.post('/createTeam/:mission_card_id', createTeam);
router.put('/updateTeam/:id', updateTeam);
router.put('/addTeamMembers/:teamId', addUsersToTeam);
router.delete('/deleteTeamMembers/:teamId/:userId', deleteUserFromTeam);
router.delete('/delete', deleteTeamMembers);
router.put('/updateUserTeams/:team_id/:profile_id', updateUserTeams);

module.exports = router;
