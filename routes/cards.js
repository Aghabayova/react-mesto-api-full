const express = require('express');
const { celebrate, Joi } = require('celebrate');

const {
  getAllCards,
  createCard,
  likeCard,
  dislikeCard,
  deleteCard,

} = require('../controllers/cards');

const router = express.Router();

router.get('/', getAllCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(1).max(30),
    link: Joi.string().required().pattern(new RegExp('^((http|https):\/\/)(www\.)?([a-zA-z0-9.-]+)\.([a-zA-z]+)([a-zA-z0-9%$?/.-]+)?(#)?$')),
  }).unknown(true),
}), createCard);

router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().hex(),
  }).unknown(true),
}), likeCard);

router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().hex(),
  }).unknown(true),
}), dislikeCard);

router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().hex(),
  }).unknown(true),
}), deleteCard);

module.exports = router;
