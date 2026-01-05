/**
 * TEAM LEAD USER ROUTES
 * Routes for viewing users (e.g., employees)
 */

const express = require('express');
const router = express.Router();
const userController = require('../../controllers/teamlead/user.controller');

/* ============ USER MANAGEMENT ============ */
router.get('/', userController.listUsers);

module.exports = router;
