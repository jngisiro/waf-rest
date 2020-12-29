import express from 'express';

import {
  getAllComments,
  createComment,
} from '../controllers/comment.controller';

import { protect, restrictTo } from '../controllers/auth.controller';

const router = express.Router({ mergeParams: true });

router.route('/').get(protect, getAllComments).post(protect, createComment);

export default router;
