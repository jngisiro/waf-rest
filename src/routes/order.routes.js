import express from 'express';

import {
  createOrder,
  getAllOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  getOrdersForUser,
} from '../controllers/order.controller';

import { protect, restrictTo } from '../controllers/auth.controller';

const router = express.Router();

router
  .route('/')
  .get(protect, restrictTo('admin'), getAllOrders)
  .post(protect, restrictTo('user'), createOrder);

router.route('/user').get(protect, restrictTo('user'), getOrdersForUser);

router
  .route('/:id')
  .get(protect, getOrder)
  .patch(protect, restrictTo('admin'), updateOrder)
  .delete(protect, restrictTo('admin'), deleteOrder);

export default router;
