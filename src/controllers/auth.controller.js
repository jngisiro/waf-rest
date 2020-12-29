const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/app-error');
const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAuthToken = (user, statusCode, res) => {
  // Generate auth token using new user's id
  const token = signToken(user._id);
  const expiresIn = new Date(
    new Date().getTime() + process.env.JWT_COOKIE_EXPIRES * 60 * 60 * 1000
  );

  const cookieOptions = {
    expiresIn,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Hide password from the returned user data
  user.password = undefined;

  res.status(statusCode).json({
    status: 'Success',
    token,
    expiresIn,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // Check if email is already registered
  const user = await User.findOne({ email: req.body.email });

  if (user) return next(new AppError('Email is already registered', 403));

  const newUser = await User.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Generate account activation token
  // const token = newUser.createToken("confirmAccount");
  // await newUser.save({ validateBeforeSave: false });

  // const confirmationUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/users/confirmAccount/${token}`;

  // await new Email(newUser, confirmationUrl).sendWelcome();

  res.status(201).json({
    status: 'Success',
    data: {
      message: 'Account created',
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // Destructure the email and password for email and password fields
  const { email, password } = req.body;

  // Check if email and password have been submitted
  if (!email || !password)
    return next(new AppError('Email and Password required', 400));

  // Check if the user exists && password is correct
  const user = await User.findOne({ email }).select('+password'); // +password to select field not selected by default

  if (!user || !(await user.correctPassword(password, user.password)))
    // If call to compare passwords returns false generate AppError
    return next(new AppError('Incorrect Email or Password', 401));

  // If everything is ok, send jwt back to client
  createAuthToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // Get the token and check if it exists
  let token = '';

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError('Please login', 401));

  // Verify the token. jwt.verify requires a callback which is converted to an async function using promisify
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists
  const checkUser = await User.findById(decoded.id);
  if (!checkUser)
    return next(new AppError('User no longer exists. Please login again', 401));

  // Check if user changed password after the token was issued
  if (checkUser.changedPasswordAfterToken(decoded.iat))
    return next(
      new AppError('User recently changed password, Please login again', 401)
    );

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = checkUser;
  next();
});

// Logout the user
exports.logout = (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

// Restrict certain routes to authorized user roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ["user", "admin", "superadmin", "gm", "manager", "attendant"]
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );

    next();
  };
};

// Handle forgotten password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Check if user is registered with provided email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with that email address', 404));

  // Generate random reset token
  const resetToken = user.createToken('resetPassword');
  await user.save({ validateBeforeSave: false });

  try {
    // Send the token back as reset link
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'Success',
      message: 'Reset token sent to email address',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error sending email. Try again later', 500));
  }
});

// Handle password reset
exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user with token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // get user with the hashed token and check if token hasn't yet expiried
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If there is no user, then the token is invalid or has expired
  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  // Update user's new password and delete the reset token and reset exipry
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Sign in user and send an auth token
  createAuthToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user
  const user = await User.findById(req.user.id).select('+password');

  // Check is previous password ic correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(new AppError('Current password is incorrect', 401));

  // Update to new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Send new auth tokrn
  createAuthToken(user, 200, res);
});
