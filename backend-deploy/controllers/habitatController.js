const db = require('../db');

// @desc    Get all habitats and their associated animals for the map
// @route   GET /api/habitats/map
// @access  Public
const getMapData = async (req, res) => {
  try {
    const [habitats] = await db.query(`
      SELECT h.habitat_id, h.enclosure_name, h.zone_name, h.coordinates, h.nearby_facilities,
             JSON_ARRAYAGG(JSON_OBJECT('id', a.animal_id, 'name', a.name, 'species', a.species)) as animals
      FROM Habitats h
      LEFT JOIN Animals a ON h.habitat_id = a.habitat_id AND a.visibility_status = 'active'
      GROUP BY h.habitat_id
    `);

    // The JSON_ARRAYAGG might return an array with a null object if no animals exist.
    // Let's clean it up before sending.
    const cleanHabitats = habitats.map(h => ({
      ...h,
      animals: h.animals && h.animals[0].id !== null ? h.animals : []
    }));

    res.json(cleanHabitats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMapData };
