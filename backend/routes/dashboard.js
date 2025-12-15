const express = require('express');
const dashboardRouter = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

dashboardRouter.use(authenticate);

dashboardRouter.get('/overview', dashboardController.getOverview);
dashboardRouter.get('/sales-trend', dashboardController.getSalesTrend);
dashboardRouter.get('/order-status-stats', dashboardController.getOrderStatusStats);

module.exports = dashboardRouter;
