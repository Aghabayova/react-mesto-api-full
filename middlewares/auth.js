const jwt = require('jsonwebtoken');
const AuthorisationErr = require('../errors/authorisation-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(
      token,
      `${NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'}`,
    );
  } catch (err) {
    throw new AuthorisationErr(
      'Необходима авторизация',
    );
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
