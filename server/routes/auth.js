const express = require('express');
const authController = require('../controllers/auth');
const authenticate  = require('../middleware/authenticate');

const router = express.Router();

router.post('/login',    authController.login);
router.post('/register', authController.register);
router.get('/me',        authenticate, authController.me);

module.exports = router;
