const express = require('express');
const { login, registerVisitor } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/register', registerVisitor);

module.exports = router;
