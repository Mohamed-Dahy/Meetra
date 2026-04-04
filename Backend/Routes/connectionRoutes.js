const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const connectionController = require('../Controllers/connectionController');



router.post('/request/:userId',  protect, connectionController.sendRequest);       // Send request // done
router.put('/accept/:userId',    protect, connectionController.acceptRequest);     // Accept request // done
router.put('/reject/:userId',    protect, connectionController.rejectRequest);     // Reject request// done
router.delete('/remove/:userId', protect, connectionController.removeConnection);  // Remove connection// done
router.get('/',                  protect, connectionController.getMyConnections);  // Get my connections// done
router.get('/requests',          protect, connectionController.getReceivedRequests); // Get received requests// done
router.get('/sent',              protect, connectionController.getSentRequests);   // Get sent requests// done

module.exports = router;