const Router = require('express');
const router = new Router();
//Middleware индификации пользователя по токену
const authMiddleware = require('../middleware/auth.middleware');
const fileController = require('../controllers/fileController');

//Подзапрос без url
router.post('', authMiddleware, fileController.createDir);
router.get('', authMiddleware, fileController.getFiles);

module.exports = router;
