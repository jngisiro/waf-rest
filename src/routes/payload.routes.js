import express from 'express';

import {
  getAllHotels,
  createHotel,
  getHotel,
  updateHotel,
  deleteHotel,
  topFiveHotels,
} from '../controllers/payload.controller';

import bookingRouter from './transaction.routes';

const router = express.Router();

router.use('/:hotelId/bookings', bookingRouter);

router.route('/').get(getAllHotels).post(createHotel);

router.route('/top-5-cheap').get(topFiveHotels, getAllHotels);

router.route('/:id').get(getHotel).patch(updateHotel).delete(deleteHotel);

export default router;
