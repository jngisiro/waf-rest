import express from 'express';

import {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  topFiveProducts,
} from '../controllers/product.controller';

const router = express.Router();

router.route('/').get(getAllProducts).post(createProduct);

router.route('/top-5-cheap').get(topFiveProducts, getAllProducts);

router.route('/:id').get(getProduct).patch(updateProduct).delete(deleteProduct);

export default router;
