const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const NotFoundErr = require('../errors/not-found-err');
const ConflictErr = require('../errors/conflict-err');

const { NODE_ENV, JWT_SECRET } = process.env;

const getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => res
      .send({ data: users }))
    .catch(next);
};

const getUser = (req, res, next) => {
  User.findById(req.params.id)
    .orFail()
    .catch(() => {
      throw new NotFoundErr({ message: 'Нет пользователя с таким id' });
    })
    .then((user) => res.send({ data: user }))
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .catch((err) => {
      if (err.name === 'MongoError' || err.code === 11000) {
        throw new ConflictErr({ message: 'Пользователь с таким email уже зарегистрирован' });
      } else next(err);
    })
    .then((user) => res.status(201).send({
      data: {
        name: user.name,
        about: user.about,
        avatar,
        email: user.email,
      },
    }))
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findOneAndUpdate(
    { _id: req.user._id },
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findOneAndUpdate({ _id: req.user._id }, { avatar },
    {
      new: true,
      runValidators: true,
    })
    .orFail()
    .then((newAvatar) => res.send({ data: newAvatar }))
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      // отправим токен, браузер сохранит его в куках
      res.cookie('jwt', token, {
        // token - наш JWT токен, который мы отправляем
        maxAge: 3600000 * 24 * 7, // защита от автоматической отправки кук
        httpOnly: true,
        sameSite: true,
      })
        .send({ message: 'успешная авторизация' });
    })
    .catch(next);
};

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  updateAvatar,
  login,
};
