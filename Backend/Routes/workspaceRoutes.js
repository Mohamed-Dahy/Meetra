const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const workspaceController = require('../Controllers/workspaceController');


router.use(protect);

// ─── Workspace CRUD ──────────────────────────────────────────
router.post('/create-workspace', workspaceController.createWorkspace); // done

router.get('/get-workspaces', workspaceController.getMyWorkspaces); // done

router.get('/get-workspace/:id', workspaceController.getWorkspaceById); // done 

// done router.put('/update-workspace/:id', workspaceController.updateWorkspace);

router.delete('/delete-workspace/:id', workspaceController.deleteWorkspace);// done 

// ─── Members Management ──────────────────────────────────────
router.post('/invite-member/:id', workspaceController.inviteMember);// done 

router.delete('/remove-member/:id/:userId', workspaceController.removeMember);// done 

router.post('/leave-workspace/:id', workspaceController.leaveWorkspace);// done 

router.get('/get-members/:id', workspaceController.getWorkspaceMembers);// done 

module.exports = router;