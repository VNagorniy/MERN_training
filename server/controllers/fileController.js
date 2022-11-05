const fileService = require('../services/fileService');
const config = require('config');
const fs = require('fs');
const User = require('../models/User');
const File = require('../models/File');

//Контроллер в котором работаем непосредственно с запросом

class FileController {
  async createDir(req, res) {
    try {
      const { name, type, parent } = req.body;
      const file = new File({ name, type, parent, user: req.user.id });
      const parentFile = await File.findOne({ _id: parent });
      if (!parentFile) {
        file.path = name;
        await fileService.createDir(file);
      } else {
        file.path = `${parentFile.path}\\${file.name}`;
        await fileService.createDir(file);
        parentFile.childs.push(file._id);
        await parentFile.save();
      }
      await file.save();
      return res.json(file);
    } catch (e) {
      console.log(e);
      return res.status(400).json(e);
    }
  }

  async getFiles(req, res) {
    try {
      const { sort } = req.query;
      let files;
      switch (sort) {
        case 'name':
          files = await File.find({ user: req.user.id, parent: req.query.parent }).sort({ name: 1 });
          break;
        case 'type':
          files = await File.find({ user: req.user.id, parent: req.query.parent }).sort({ type: 1 });
          break;
        case 'date':
          files = await File.find({ user: req.user.id, parent: req.query.parent }).sort({ date: 1 });
          break;
        default:
          files = await File.find({ user: req.user.id, parent: req.query.parent });
          break;
      }
      return res.json(files);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Can not get files' });
    }
  }

  async uploadFile(req, res) {
    try {
      // Получение файла из запроса
      const file = req.files.file;

      //Поиск родительской директории, в который сохраняем файл
      const parent = await File.findOne({ user: req.user.id, _id: req.body.parent });
      //Поиск пользователя(для проверки места на диске)
      const user = await User.findOne({ _id: req.user.id });

      //Проверка размера диска
      if (user.usedSpace + file.size > user.diskSpace) {
        return res.status(400).json({ message: 'Недостаточно свободного места на диске' });
      }
      user.usedSpace = user.usedSpace + file.size;

      //Путь сохранения файла, взависимости от наличия родителя
      let path;
      if (parent) {
        path = `${config.get('filePath')}\\${user._id}\\${parent.path}\\${file.name}`;
      } else {
        path = `${config.get('filePath')}\\${user._id}\\${file.name}`;
      }

      //Проверка наличия файла через модуль fs
      if (fs.existsSync(path)) {
        return res.status(400).json({ message: 'Файл уже был создан' });
      }
      file.mv(path);

      //Получения типа файла
      const type = file.name.split('.').pop();
      let filePath = file.name;
      if (parent) {
        filePath = parent.path + '\\' + file.name;
      }

      // Создание моделя файла, который сохраняем в БД
      const dbFile = new File({
        name: file.name,
        type,
        size: file.size,
        path: filePath,
        parent: parent?._id,
        user: user._id,
      });

      await dbFile.save();
      await user.save();

      res.json(dbFile);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Upload error' });
    }
  }

  async downloadFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });
      const path = config.get('filePath') + '\\' + req.user.id + '\\' + file.path + '\\' + file.name;
      if (fs.existsSync(path)) {
        return res.download(path, file.name);
      }
      return res.status(400).json({ message: 'Ошибка скачивания' });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Ошибка скачивания' });
    }
  }

  async deleteFile(req, res) {
    try {
      //Получение файла из БД
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });
      if (!file) {
        return res.status(400).json({ message: 'Файл не найден' });
      }
      fileService.deleteFile(file);
      await file.remove();
      return res.json({ message: 'Файл был удалён' });
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: 'Каталог не пустой' });
    }
  }
}

module.exports = new FileController();
