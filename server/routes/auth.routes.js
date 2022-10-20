const Router = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const router = new Router();

//POST запрос url registration
router.post(
  '/registration',
  [check('email', 'Некорректный ввод').isEmail(), check('password', 'Пароль дб длиной не менее 3 и не более 12 символов').isLength({ min: 3, max: 12 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Некорректный запрос', errors });
      }

      const { email, password } = req.body;

      //Проверка пользователя с таким же email

      const canditate = await User.findOne({ email });

      if (canditate) {
        return res.status(400).json({ message: `Пользователь с таким email ${email} уже создан` });
      }
      //Хэширование пароля
      const hashPassword = await bcrypt.hash(password, 8);
      const user = new User({ email, password: hashPassword });
      await user.save();
      return res.json({ message: 'Пользователь создан' });
    } catch (e) {
      console.log(e);
      res.send({ message: 'Ошибка сервера' });
    }
  }
);

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    //Сравнение пароль в БД с написанным
    const isPassValid = bcrypt.compareSync(password, user.password);
    if (!isPassValid) {
      return res.status(400).json({ message: 'Некорректный пароль' });
    }
    //Создадим токен (sign принимает: объект с данными, секретный ключ,объект времени хранения токена)
    const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        diskSpace: user.diskSpace,
        usedSpace: user.usedSpace,
        avatar: user.avatar,
      },
    });
  } catch (e) {
    console.log(e);
    res.send({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
