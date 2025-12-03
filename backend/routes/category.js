const categoryRouter = express.Router();
const categoryController = require('../controllers/categoryController');

categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.get('/tree', categoryController.getCategoryTree);
categoryRouter.get('/:id', categoryController.getCategoryById);

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
