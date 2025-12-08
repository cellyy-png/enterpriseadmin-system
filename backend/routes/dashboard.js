const express = require('express');
const dashboardRouter = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

dashboardRouter.use(authenticate);

dashboardRouter.get('/overview', dashboardController.getOverview);
dashboardRouter.get('/sales-trend', dashboardController.getSalesTrend);
// dashboardRouter.get('/user-stats', dashboardController.getUserStats);
// dashboardRouter.get('/product-stats', dashboardController.getProductStats);
// dashboardRouter.get('/order-stats', dashboardController.getOrderStats);

module.exports = dashboardRouter;
