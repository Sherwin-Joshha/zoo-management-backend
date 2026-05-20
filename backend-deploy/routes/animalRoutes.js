const express = require('express');
const { getAnimals, getAnimalById, addAnimal } = require('../controllers/animalController');
const { protect } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');

const router = express.Router();

router.route('/')
  .get(getAnimals)
  .post(protect, roleGuard('employee', 'admin'), addAnimal);

router.route('/:id')
  .get(getAnimalById);

module.exports = router;
