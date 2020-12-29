const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: [true, 'Please provide a first name'] },
  lastname: { type: String, required: [true, 'Please provide a last name'] },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'manager', 'accounts', 'finance', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, // Password field won't be selected in a user query
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide a password'],
    validate: {
      // Custom validator only runs on Create() & Save()
      validator: function (el) {
        return el === this.password;
      },
      msg: 'Passwords do not match',
    },
  },
});

// This function runs everytime a new document is created or saved in the database
userSchema.pre('save', async function (next) {
  // check if the password field has been modified before running the hash or exiting if not
  if (!this.isModified('password')) return next();

  // Password hashed
  this.password = await bcrypt.hash(this.password, 12);

  // Ignores / deletes the passwordconfirm field
  this.passwordConfirm = undefined;

  // Onto the next middleware
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Instance method for all user documents
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// eslint-disable-next-line camelcase
userSchema.methods.changedPasswordAfterToken = function (JWT_timeStamp) {
  // Check if user has chnaged password
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // eslint-disable-next-line camelcase
    return JWT_timeStamp < changedTimeStamp;
  }

  // False means password not changed after token was issued
  return false;
};

userSchema.methods.createToken = function (operation) {
  const token = crypto.randomBytes(32).toString('hex');

  if (operation === 'confirmAccount') {
    this.confirmAccountToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    this.confirmAccountExpires = Date.now() + 60 * 60 * 1000;
  } else {
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  }

  return token;
};

module.exports = mongoose.model('User', userSchema);
