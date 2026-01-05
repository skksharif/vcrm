/**
 * ADMIN USER ROUTES
 * Routes for user management
 */

const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/user.controller');

/* ============ USER MANAGEMENT ============ */
router.post('/', userController.createUser);
router.get('/suspended', userController.listSuspendedUsers);
router.get('/soft-deleted', userController.listSoftDeletedUsersAdmin);
router.get('/:id/profile', userController.getUserProfile);
router.get('/:id', userController.getUserProfile);
router.get('/', userController.listUsers);
router.patch('/:id', userController.updateUser);
router.patch('/:id/suspend', userController.suspendUser);
router.patch('/:id/activate', userController.unsuspendUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/restore', userController.activateUser);

module.exports = router;
