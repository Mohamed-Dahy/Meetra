const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers } = require('../Controllers/authController');

router.post('/register', registerUser); // done
router.post('/login', loginUser); // done
router.get('/users',getUsers) // done
module.exports = router;