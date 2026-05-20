const express = require('express');
const { getMapData } = require('../controllers/habitatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Publicly accessible for visitors (or with just protect if we want only logged-in users)
router.get('/map', getMapData);

module.exports = router;
