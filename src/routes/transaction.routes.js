import express from 'express';

import {
  createTransaction,
  getAllTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller';

import { protect, restrictTo } from '../controllers/auth.controller';

import commentRouter from './comment.routes';

const router = express.Router({ mergeParams: true });

router.use('/:id/comments', commentRouter);

router
  .route('/')
  .get(
    protect,
    restrictTo('user', 'manager', 'accounts', 'finance', 'admin'),
    getAllTransactions
  )
  .post(protect, restrictTo('user'), createTransaction);

router
  .route('/:id')
  .get(protect, getTransaction)
  .patch(protect, updateTransaction)
  .delete(protect, restrictTo('admin'), deleteTransaction);

export default router;
