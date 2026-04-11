const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const connectionController = require('../Controllers/connectionController');
const validateObjectId = require('../middleware/validateObjectId');

router.post('/request/:userId',  protect, validateObjectId('userId'), connectionController.sendRequest);
router.put('/accept/:userId',    protect, validateObjectId('userId'), connectionController.acceptRequest);
router.put('/reject/:userId',    protect, validateObjectId('userId'), connectionController.rejectRequest);
router.delete('/remove/:userId', protect, validateObjectId('userId'), connectionController.removeConnection);
router.get('/',                  protect, connectionController.getMyConnections);
router.get('/requests',          protect, connectionController.getReceivedRequests);
router.get('/sent',              protect, connectionController.getSentRequests);

module.exports = router;