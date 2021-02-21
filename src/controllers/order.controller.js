import Orders from '../models/order.model';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/app-error';
import Features from '../utils/features';

export const getAllOrders = catchAsync(async (req, res) => {
  const features = new Features(Orders.find(), req.query)
    .filter()
    .sort()
    .project();

  const orders = await features.query.populate('user');

  res.status(200).json({
    status: 'success',
    data: {
      orders,
    },
  });
});

export const getOrdersForUser = catchAsync(async (req, res) => {
  console.log(req.user)
  const features = new Features(
    Orders.find({ user: req.user.id }).populate('products').populate('user'),
    req.query
  )
    .filter()
    .sort()
    .project();

  const orders = await features.query;

  res.status(200).json({
    status: 'success',
    data: {
      orders,
    },
  });
});

export const getOrder = catchAsync(async (req, res) => {
  const order = await Orders.findById(req.params.id)
    .populate('user')
    .populate('products');

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

export const createOrder = catchAsync(async (req, res) => {
  req.body.userid = req.user.id;
  const order = await Orders.create({products: req.body.products, ...req.body.userInfo});


  res.status(201).json({
    status: 'success',
    data: {
      order,
    },
  });
});

export const deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Orders.findByIdAndDelete(req.params.id);

  if (!order)
    return next(new AppError(`No order found with ID: ${req.params.id}`, 404));

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

export const updateOrder = catchAsync(async (req, res, next) => {
  const order = await Orders.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('user')
    .populate('products');

  if (!order)
    return next(new AppError(`No view found with ID: ${req.params.id}`, 404));

  res.status(200).json({
    status: 'Success',
    data: {
      order,
    },
  });
});
