const userRouter = require('./users');
const cardsRouter = require('./cards');
const errorRouter = require('./error');

module.exports = {
  cardsRouter,
  userRouter,
  errorRouter,
};
