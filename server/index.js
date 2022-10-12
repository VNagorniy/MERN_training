const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

// Создаём сервер
const app = express();

const PORT = config.get('serverPort');

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
