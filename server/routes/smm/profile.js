/**
 * SMM PROFILE ROUTES
 * Routes for SMM profile management
 */

const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/smm/profileController');

/* ============ PROFILE ============ */
router.get('/work-history', profileController.getWorkHistory);
router.get('/statistics', profileController.getStatistics);
router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);

module.exports = router;
