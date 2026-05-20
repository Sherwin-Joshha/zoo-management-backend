const express = require('express');
const { bookTicket, getMyTickets, getAllTickets } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect); // All ticket routes require authentication

router.route('/')
  .post(bookTicket)
  .get(roleGuard('employee', 'admin'), getAllTickets);

router.get('/my-tickets', getMyTickets);

module.exports = router;
