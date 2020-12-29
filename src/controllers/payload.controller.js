import catchAsync from '../utils/catchAsync';
import Hotel from '../models/payload.model';
import resHandler from './responseHandler';
import Features from '../utils/features';
// import upload from "./../utils/upload";

// TODO Delete this after refactoring
const document = 'hotel';

export const topFiveHotels = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-rating,price';
  req.query.fields = 'name,price,rating,summary,location[address]';
  next();
};

export const getAllHotels = catchAsync(async (req, res, next) => {
  const features = new Features(Hotel.find(), req.query)
    .filter()
    .sort()
    .project()
    .paginate();
  const doc = await features.query;

  res.status(200).json({
    status: 'Success',
    results: doc.length,
    data: doc,
  });
});

export const getHotel = catchAsync(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id)
    .populate('reviews')
    .populate('bookings')
    .populate('favourites')
    .populate('views');

  return res.status(200).json({
    status: 'sucess',
    data: {
      hotel,
    },
  });
});

export const updateHotel = resHandler.updateOne(Hotel, document);

export const deleteHotel = resHandler.deleteOne(Hotel, document);

export const createHotel = catchAsync(async (req, res, next) => {
  if (req.file) req.body.coverImage = req.file.filename;

  const newHotel = await Hotel.create({
    ...req.body,
  });

  res.status(201).json({
    status: 'Success',
    hotel: newHotel,
  });
});
