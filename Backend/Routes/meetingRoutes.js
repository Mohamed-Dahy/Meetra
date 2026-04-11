const express = require('express');
const router = express.Router();
const MeetingController = require('../Controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

router.post('/create', protect, MeetingController.createMeeting);
router.patch('/update/:id', protect, validateObjectId('id'), MeetingController.updateMeeting);
router.delete('/delete/:id', protect, validateObjectId('id'), MeetingController.deleteMeeting);
router.get('/get-meeting/:id', protect, validateObjectId('id'), MeetingController.getMeetingById);
router.get('/get-meetings', protect, MeetingController.getMeetings);
module.exports = router;