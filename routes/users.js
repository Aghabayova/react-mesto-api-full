const express = require('express');
const { celebrate, Joi } = require('celebrate');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

const router = express.Router();

router.get('/', getAllUsers);

router.get('/:id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().required().hex(),
  }),
}), getUser);

router.post('/', createUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }).unknown(true),
}), updateUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(new RegExp('^((http|https):\/\/)(www\.)?([a-zA-z0-9.-]+)\.([a-zA-z]+)([a-zA-z0-9%$?/.-]+)?(#)?$')),
  }).unknown(true),
}), updateAvatar);

module.exports = router;
