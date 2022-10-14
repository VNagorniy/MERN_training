const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const authRouter = require('./routes/auth.routes');

// Создаём сервер
const app = express();
const PORT = config.get('serverPort');

app.use(express.json());
app.use('/api/auth', authRouter);

//Ф-я подключения к БД и запуск сервера
const start = async () => {
  try {
    await mongoose.connect(config.get('dbUrl'));
    app.listen(PORT, () => {
      console.log(`Сервер запущен на `, PORT);
    });
  } catch (e) {}
};

start();
