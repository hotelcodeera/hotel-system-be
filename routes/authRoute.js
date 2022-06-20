const express = require('express');
const router = express.Router();

// Controllers
const { login,  } = require('../controllers/auth');

router.route('/login').post(login);

module.exports = router;
