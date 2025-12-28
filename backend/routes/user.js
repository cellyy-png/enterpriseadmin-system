const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission');

// 商家入驻申请路由（公开接口，无需认证）
userRouter.post('/merchant-application', 
    userController.createMerchantApplication
);

userRouter.use(authenticate); // 所有用户路由都需要认证

// 将具体的路由放在参数化路由之前，避免冲突
userRouter.get('/roles',
    checkPermission('user', 'read'),
    userController.getAllRoles
);

userRouter.get('/merchant-applications', 
    checkPermission('user', 'read'),
    userController.getMerchantApplications
);

userRouter.put('/merchant-audit/:id', 
    checkPermission('user', 'update'),
    userController.auditMerchant
);

// 删除商家入驻申请路由
userRouter.delete('/merchant-application/:id', 
    checkPermission('user', 'delete'),
    userController.deleteMerchantApplication
);

userRouter.post('/',
    checkPermission('user', 'create'),
    userController.createUser
);

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