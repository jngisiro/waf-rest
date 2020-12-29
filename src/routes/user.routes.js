const express = require('express');

// Cretae a User router
const router = express.Router();

// Import Controllers for the user routes
const controller = require('../controllers/user.controller');

// Import Authentication controllers
const authController = require('../controllers/auth.controller');

// Import the Transaction route for getting all transactions for a given user
// const transactionRouter = require("./transaction.routes");

// Routes for Authentication and Resetting passwords
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

// Protects all routes below this middleware
router.use(authController.protect);

// Use the transaction route when a user queries for all trasactions using their userid
// router.use("/:userid/transactions", transactionRouter);

// Routes users to queries for their info, update and delete their accounts
router.get('/me', controller.me, controller.getUser);
router.patch('/updateMe', controller.updateMe);
router.delete('/deleteMe', controller.deleteMe);

// Restrict the routes below to only the admin
router.use(authController.restrictTo('admin'));

// Admin specific routes for getting users, updating user information and deleting user accounts
router.route('/').get(controller.getAllUsers).post(controller.createUser);

router
  .route('/:id')
  .get(controller.getUser)
  .patch(controller.updateUser)
  .delete(authController.restrictTo('superadmin'), controller.deleteUser);

module.exports = router;
