/**
 * ADMIN CLIENT ROUTES
 * Routes for client management
 */

const express = require('express');
const router = express.Router();
const clientController = require('../../controllers/admin/client.controller');

/* ============ CLIENT MANAGEMENT ============ */
router.post('/', clientController.createClient);
router.get('/deleted/all', clientController.viewDeletedClients);
router.get('/:id/tasks', clientController.getClientTasks);
router.get('/:id', clientController.viewClientProfile);
router.get('/', clientController.listClients);
router.patch('/:id', clientController.updateClient);
router.delete('/:id', clientController.softDeleteClient);
router.patch('/:id/restore', clientController.restoreClient);

module.exports = router;
