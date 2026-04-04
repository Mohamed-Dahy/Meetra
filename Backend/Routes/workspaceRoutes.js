const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const workspaceController = require('../Controllers/workspaceController');


router.use(protect);

// ─── Workspace CRUD ──────────────────────────────────────────
router.post('/create-workspace', workspaceController.createWorkspace);

router.get('/get-workspaces', workspaceController.getMyWorkspaces);

router.get('/get-workspace/:id', workspaceController.getWorkspaceById);

router.put('/update-workspace/:id', workspaceController.updateWorkspace);

router.delete('/delete-workspace/:id', workspaceController.deleteWorkspace);

// ─── Members Management ──────────────────────────────────────
router.post('/invite-member/:id', workspaceController.inviteMember);

router.delete('/remove-member/:id/:userId', workspaceController.removeMember);

router.post('/leave-workspace/:id', workspaceController.leaveWorkspace);

router.get('/get-members/:id', workspaceController.getWorkspaceMembers);

module.exports = router;