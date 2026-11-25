const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');

router.get('/', challengeController.getChallenges);
router.get('/:id', challengeController.getChallengeById);
router.post('/', challengeController.createChallenge);
router.put('/:id/day/:dayNumber', challengeController.updateDay);
router.put('/:id/habits', challengeController.updateHabits);
router.post('/:id/reset', challengeController.resetChallenge);
router.delete('/:id', challengeController.deleteChallenge);

module.exports = router;
