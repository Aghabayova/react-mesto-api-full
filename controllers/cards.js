const Card = require('../models/card');
const BadRequestErr = require('../errors/bad-request-err');
const NotFoundErr = require('../errors/not-found-err');
const AccessErr = require('../errors/access-err');

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
  Card.findById(req.params.cardId)
    .orFail()
    .catch(() => {
      throw new NotFoundErr({ message: 'Нет карточки с таким id' });
    })
    .then((card) => {
      if (card.owner.toString() !== req.user._id) {
        throw new AccessErr({ message: 'Недостаточно прав для этой операции' });
      }
      Card.findByIdAndDelete(req.params.cardId)
        .then((cardData) => {
          res.send({ data: cardData });
        })
        .catch(next);
    })
    .catch(next);
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true })
    .orFail()
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        res
          .status(404)
          .send({ message: err.message });
        return;
      }
      res
        .status(500)
        .send({ message: 'Ошибка сервера. Повторите попытку позже' });
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true })
    .orFail()
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        res
          .status(404)
          .send({ message: err.message });
        return;
      }
      res
        .status(500)
        .send({ message: 'Ошибка сервера. Повторите попытку позже' });
    });
};

module.exports = {
  getAllCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
