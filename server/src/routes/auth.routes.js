const express = require('express');

const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  validateLogin,
  validateRegister
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/login', validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
