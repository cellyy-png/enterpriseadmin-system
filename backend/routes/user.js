const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireRole, checkPermission } = require('../middleware/auth');

userRouter.use(authenticate); // 所有用户路由都需要认证

userRouter.get('/',
    checkPermission('user', 'read'),
    userController.getAllUsers
);

userRouter.get('/:id',
    checkPermission('user', 'read'),
    userController.getUserById
);

userRouter.put('/:id',
    checkPermission('user', 'update'),
    userController.updateUser
);

userRouter.delete('/:id',
    checkPermission('user', 'delete'),
    userController.deleteUser
);

userRouter.get('/:id/stats', userController.getUserStats);

module.exports = userRouter;