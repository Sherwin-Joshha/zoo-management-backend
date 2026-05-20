const db = require('../db');

// @desc    Get dashboard statistics for employee
// @route   GET /api/employee/dashboard
// @access  Private/Employee
const getDashboardStats = async (req, res) => {
  try {
    const [[{ total_animals }]] = await db.query('SELECT COUNT(*) as total_animals FROM Animals');
    const [[{ pending_tasks }]] = await db.query('SELECT COUNT(*) as pending_tasks FROM Tasks WHERE status != "completed"');
    const [[{ open_incidents }]] = await db.query('SELECT COUNT(*) as open_incidents FROM IncidentReports');
    const [[{ todays_feedings }]] = await db.query('SELECT COUNT(*) as todays_feedings FROM FeedingSchedules WHERE DATE(feeding_time) = CURDATE()');
    
    // Revenue chart data
    const [revenueData] = await db.query(`
      SELECT MONTH(booking_timestamp) AS month, SUM(total_amount) AS revenue 
      FROM Tickets 
      WHERE payment_status = 'paid' AND YEAR(booking_timestamp) = YEAR(NOW())
      GROUP BY MONTH(booking_timestamp)
    `);

    res.json({
      summary: { total_animals, pending_tasks, open_incidents, todays_feedings },
      charts: { revenueData }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks assigned to an employee or all
// @route   GET /api/employee/tasks
// @access  Private/Employee
const getTasks = async (req, res) => {
  try {
    const [tasks] = await db.query(`
      SELECT t.*, u.full_name as assigned_to 
      FROM Tasks t 
      LEFT JOIN Employees e ON t.assigned_employee = e.employee_id
      LEFT JOIN Users u ON e.user_id = u.user_id
      ORDER BY t.deadline ASC
    `);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getTasks };
