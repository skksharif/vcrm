const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/profile.controller');

router.get('/me', controller.getMyProfile);

module.exports = router;
