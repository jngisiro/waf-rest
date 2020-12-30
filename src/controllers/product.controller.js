import catchAsync from '../utils/catchAsync';
import Product from '../models/product.model';
import resHandler from './responseHandler';
import Features from '../utils/features';
// import upload from "./../utils/upload";

// TODO Delete this after refactoring
const document = 'hotel';

export const topFiveProducts = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-rating,price';
  req.query.fields = 'name,price,rating,description';
  next();
};

export const getAllProducts = catchAsync(async (req, res, next) => {
  const features = new Features(Product.find(), req.query)
    .filter()
    .sort()
    .project()
    .paginate();
  const products = await features.query;

  res.status(200).json({
    status: 'Success',
    results: products.length,
    data: { products },
  });
});

export const getProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id)

  return res.status(200).json({
    status: 'Success',
    data: {
      product,
    },
  });
});

export const updateProduct = resHandler.updateOne(Product, document);

export const deleteProduct = resHandler.deleteOne(Product, document);

export const createProduct = catchAsync(async (req, res, next) => {
  if (req.file) req.body.coverImage = req.file.filename;

  const product = await Product.create({
    ...req.body,
  });

  res.status(201).json({
    status: 'Success',
    product,
  });
});
