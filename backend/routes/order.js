const orderRouter = express.Router();
const orderController = require('../controllers/orderController');

orderRouter.use(authenticate);

orderRouter.get('/', orderController.getAllOrders);
orderRouter.get('/:id', orderController.getOrderById);
orderRouter.post('/',
    validate(orderValidation.create),
    orderController.createOrder
);
orderRouter.put('/:id/status', orderController.updateOrderStatus);
orderRouter.put('/:id/payment', orderController.updatePaymentStatus);
orderRouter.delete('/:id',
    checkPermission('order', 'delete'),
    orderController.cancelOrder
);
orderRouter.get('/:id/tracking', orderController.getOrderTracking);

module.exports = orderRouter;