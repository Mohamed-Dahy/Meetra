const express = require('express');
const router = express.Router();
const MeetingController = require('../Controllers/meetingcontroller');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, MeetingController.createMeeting); // done
router.patch('/update/:id', protect, MeetingController.updateMeeting);//done
router.delete('/delete/:id', protect, MeetingController.deleteMeeting);//done
router.get('/get-meeting/:id', protect, MeetingController.getMeetingById);//done
router.get('/get-meetings', protect, MeetingController.getMeetings);//done
module.exports = router;