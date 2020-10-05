const Card = require('../models/card');
const BadRequestErr = require('../errors/bad-request-err');
const NotFoundErr = require('../errors/not-found-err');
// const AccessErr = require('../errors/access-err');

const getAllCards = (req, res) => {
  Card.find({})
    .populate('user')
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500)
      .send({ message: 'Ошибка сервера. Повторите попытку позже' }));
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .catch((err) => {
      throw new BadRequestErr({ message: `Указаны некорректные данные при создании карточки: ${err.message}` });
    })
    .then((card) => res.status(201).send({ data: card }))
    .catch(next);
};

const deleteCard = (req, res, next) => {
  Card.findByIdAndDelete(req.params.cardId)
    .orFail(new NotFoundErr('Нет карточки с таким id или вы не являетесь ее авоторм'))
    .then((card) => {
      res
        .status(200)
        .send({ message: `${card._id} карточка успешно удалена` });
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true })
    .orFail(new NotFoundErr('Нет карточки с таким id'))
    .then((likes) => res.send({ data: likes }))
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true })
    .orFail(new NotFoundErr('Нет карточки с таким id'))
    .then((likes) => res.send({ data: likes }))
    .catch(next);
};

module.exports = {
  getAllCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
