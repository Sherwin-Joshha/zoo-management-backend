const db = require('../db');
const QRCode = require('qrcode');

// @desc    Book a new ticket
// @route   POST /api/tickets
// @access  Private/Visitor
const bookTicket = async (req, res) => {
  const { ticket_type, visit_date, num_adults, num_children, payment_method, total_amount } = req.body;

  try {
    const [visitors] = await db.query('SELECT visitor_id FROM Visitors WHERE user_id = ?', [req.user.id]);
    if (visitors.length === 0) {
      return res.status(400).json({ message: 'Only visitors can book tickets' });
    }
    const visitor_id = visitors[0].visitor_id;

    const [result] = await db.query(
      `INSERT INTO Tickets (visitor_id, ticket_type, visit_date, num_adults, num_children, payment_method, payment_status, total_amount) 
       VALUES (?, ?, ?, ?, ?, ?, 'paid', ?)`,
      [visitor_id, ticket_type, visit_date, num_adults, num_children, payment_method, total_amount]
    );

    const ticket_id = result.insertId;

    // Generate QR Code containing ticket ID and validation data
    const qrData = JSON.stringify({ ticket_id, visitor_id, visit_date, type: ticket_type });
    const qr_code = await QRCode.toDataURL(qrData);

    await db.query('UPDATE Tickets SET qr_code = ? WHERE ticket_id = ?', [qr_code, ticket_id]);

    res.status(201).json({ ticket_id, qr_code, status: 'success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's tickets
// @route   GET /api/tickets/my-tickets
// @access  Private/Visitor
const getMyTickets = async (req, res) => {
  try {
    const [visitors] = await db.query('SELECT visitor_id FROM Visitors WHERE user_id = ?', [req.user.id]);
    if (visitors.length === 0) {
      return res.status(400).json({ message: 'Visitor not found' });
    }
    
    const [tickets] = await db.query('SELECT * FROM Tickets WHERE visitor_id = ? ORDER BY visit_date DESC', [visitors[0].visitor_id]);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tickets (Employee only)
// @route   GET /api/tickets
// @access  Private/Employee
const getAllTickets = async (req, res) => {
  try {
    const [tickets] = await db.query(`
      SELECT t.*, u.full_name, u.email 
      FROM Tickets t 
      JOIN Visitors v ON t.visitor_id = v.visitor_id
      JOIN Users u ON v.user_id = u.user_id
      ORDER BY t.booking_timestamp DESC
    `);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { bookTicket, getMyTickets, getAllTickets };
