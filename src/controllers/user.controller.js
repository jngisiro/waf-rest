const catchAsync = require('../utils/catchAsync'); // Error Handling wrapper for aysnc operations
const AppError = require('../utils/app-error'); // Custom Error Handling Class
const User = require('../models/user.model');
const resHandler = require('./responseHandler');

const filterRequestBody = (inputData, ...allowedFields) => {
  const fields = {};
  Object.keys(inputData).forEach((el) => {
    if (allowedFields.includes(el)) fields[el] = inputData[el];
  });
  return fields;
};

exports.getAllUsers = resHandler.getAll(User);

exports.getUser = resHandler.getOne(User, 'User');

exports.me = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateUser = resHandler.updateOne(User, 'User');

exports.deleteUser = resHandler.deleteOne(User, 'User');

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Prevent user from posting password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'Cannot update password from theis route. Use /updatePassword',
        400
      )
    );

  // filter unwanted data from the request object
  const filteredData = filterRequestBody(req.body, 'firstname', 'lastname');

  // Update User document
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { ...filteredData },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
