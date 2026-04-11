const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const workspaceController = require('../Controllers/workspaceController');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);

// ─── Workspace CRUD ──────────────────────────────────────────
router.post('/create-workspace', workspaceController.createWorkspace);

router.get('/get-workspaces', workspaceController.getMyWorkspaces);

router.get('/get-workspace/:id', validateObjectId('id'), workspaceController.getWorkspaceById);

router.put('/update-workspace/:id', validateObjectId('id'), workspaceController.updateWorkspace);

router.delete('/delete-workspace/:id', validateObjectId('id'), workspaceController.deleteWorkspace);

// ─── Members Management ──────────────────────────────────────
router.post('/invite-member/:id', validateObjectId('id'), workspaceController.inviteMember);

router.delete('/remove-member/:id/:userId', validateObjectId('id', 'userId'), workspaceController.removeMember);

router.post('/leave-workspace/:id', validateObjectId('id'), workspaceController.leaveWorkspace);

router.get('/get-members/:id', validateObjectId('id'), workspaceController.getWorkspaceMembers);

module.exports = router;