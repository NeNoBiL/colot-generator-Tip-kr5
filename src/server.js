const express = require('express');
const path = require('path');
const colorRoutes = require('./routes/colorRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON и URL-encoded данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware для раздачи статических файлов
app.use(express.static(path.join(__dirname, '../public')));

// Подключаем маршруты
app.use('/api/colors', colorRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});