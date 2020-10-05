const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AuthorisationErr = require('../errors/authorisation-err');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: { validator: validator.isEmail, message: 'Некорректный формат' },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return /^((http|https):\/\/)(www\.)?([a-zA-z0-9.-]+)\.([a-zA-z]+)([a-zA-z0-9%$?/.-]+)?(#)?$/.test(v);
      },
      message: (props) => `${props.value} некорректная ссылка`,
    },
  },
}, { versionKey: false });

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .orFail(new AuthorisationErr('Неправильные почта или пароль'))
    .then((user) => bcrypt.compare(password, user.password)
      .then((matched) => {
        if (!matched) {
          throw new AuthorisationErr('Неправильные почта или пароль');
        }
        return user;
      }));
};

module.exports = mongoose.model('user', userSchema);
