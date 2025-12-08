const express = require('express');
const categoryRouter = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, checkPermission } = require('../middleware/auth');

categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.get('/tree', categoryController.getCategoryTree);
// categoryRouter.get('/:id', categoryController.getCategoryById); // getCategoryById 方法未定义

categoryRouter.use(authenticate);

categoryRouter.post('/',
    checkPermission('category', 'create'),
    categoryController.createCategory
);

categoryRouter.put('/:id',
    checkPermission('category', 'update'),
    categoryController.updateCategory
);

categoryRouter.delete('/:id',
    checkPermission('category', 'delete'),
    categoryController.deleteCategory
);

module.exports = categoryRouter;
