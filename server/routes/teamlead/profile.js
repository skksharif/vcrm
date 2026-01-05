/**
 * TEAM LEAD PROFILE ROUTES
 * Routes for TL-1 and TL-2 profile management
 */

const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/teamlead/profileController');

/* ============ PROFILE ============ */
router.get('/assignments', profileController.getAssignmentHistory);
router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);

module.exports = router;
