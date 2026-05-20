const express = require('express');
const { getDashboardStats, getTasks } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect);
router.use(roleGuard('employee', 'admin'));

router.get('/dashboard', getDashboardStats);
router.get('/tasks', getTasks);

module.exports = router;
