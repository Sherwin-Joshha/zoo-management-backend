const db = require('../db');

// @desc    Fetch all animals (active only for visitors)
// @route   GET /api/animals
// @access  Public
const getAnimals = async (req, res) => {
  try {
    const isEmployee = req.user && (req.user.role === 'employee' || req.user.role === 'admin');
    let query = `
      SELECT a.*, h.enclosure_name, h.zone_name 
      FROM Animals a 
      LEFT JOIN Habitats h ON a.habitat_id = h.habitat_id
    `;
    
    if (!isEmployee) {
      query += ` WHERE a.visibility_status = 'active'`;
    }

    const [animals] = await db.query(query);
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single animal
// @route   GET /api/animals/:id
// @access  Public
const getAnimalById = async (req, res) => {
  try {
    const [animals] = await db.query(`
      SELECT a.*, h.enclosure_name, h.zone_name 
      FROM Animals a 
      LEFT JOIN Habitats h ON a.habitat_id = h.habitat_id 
      WHERE a.animal_id = ?
    `, [req.params.id]);

    if (animals.length > 0) {
      res.json(animals[0]);
    } else {
      res.status(404).json({ message: 'Animal not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new animal
// @route   POST /api/animals
// @access  Private/Employee
const addAnimal = async (req, res) => {
  const { name, species, gender, age, weight, health_condition, habitat_id, conservation_category, visibility_status } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO Animals (name, species, gender, age, weight, health_condition, habitat_id, conservation_category, visibility_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, species, gender, age, weight, health_condition, habitat_id, conservation_category, visibility_status]
    );
    res.status(201).json({ animal_id: result.insertId, name, species });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnimals, getAnimalById, addAnimal };
