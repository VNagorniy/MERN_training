const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const fileUpload = require('express-fileupload');
const authRouter = require('./routes/auth.routes');
const fileRouter = require('./routes/file.routes');

// Создаём сервер
const app = express();
const PORT = config.get('serverPort');

const corsMiddleware = require('./middleware/cors.middleware');

app.use(fileUpload({}));
app.use(corsMiddleware);
app.use(express.json());
app.use(express.static('static'));
app.use('/api/auth', authRouter);
app.use('/api/files', fileRouter);

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
