const express = require('express');
const router = express.Router();
const MeetingController = require('../Controllers/meetingcontroller');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, MeetingController.createMeeting); // done
router.patch('/update/:id', protect, MeetingController.updateMeeting);
router.delete('/delete/:id', protect, MeetingController.deleteMeeting);
router.get('/get-meeting/:id', protect, MeetingController.getMeetingById);
router.get('/get-meetings', protect, MeetingController.getMeetings);
module.exports = router;