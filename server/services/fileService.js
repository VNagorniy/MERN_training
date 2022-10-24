const { rejects } = require('assert');
const fs = require('fs');
const config = require('config');
const File = require('../models/File');

//Разработка сервиса
class FileService {
  //Ф-я по созданию папки, на вход принимает file(объект той модели которую будем добавлять)
  createDir(file) {
    //Переменная хранит путь к файлу
    const filePath = `${config.get('filePath')}\\${file.user}\\${file.path}`;
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath);
          return resolve({ message: 'Файл был создан' });
        } else {
          return reject({ message: 'Файл уже создан' });
        }
      } catch (e) {
        return reject({ message: 'Ошибка файла' });
      }
    });
  }
}

module.exports = new FileService();
