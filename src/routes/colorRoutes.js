const express = require('express');
const ColorController = require('../controllers/colorController');
const logger = require('../middleware/logger');

const router = express.Router();

// Применяем middleware логгера ко всем маршрутам
router.use(logger);

// GET /api/colors/random - генерация случайного цвета
router.get('/random', ColorController.generateRandomColor);

// GET /api/colors/scheme - генерация цветовой схемы (с query-параметрами)
router.get('/scheme', ColorController.generateColorScheme);

// GET /api/colors - получение всех сохраненных цветов
router.get('/', ColorController.getAllColors);

// GET /api/colors/:id - получение цвета по ID (с параметром)
router.get('/:id', ColorController.getColorById);

// POST /api/colors - сохранение нового цвета
router.post('/', ColorController.saveColor);

module.exports = router;