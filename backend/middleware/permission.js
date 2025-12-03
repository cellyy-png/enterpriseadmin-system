// 检查用户角色
exports.requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: '无权限访问' });
        }

        const userRole = req.user.role.name;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: '权限不足',
                required: allowedRoles,
                current: userRole
            });
        }

        next();
    };
};

// 检查具体资源权限
exports.checkPermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                return res.status(403).json({ error: '无权限访问' });
            }

            // 超级管理员拥有所有权限
            if (req.user.role.name === 'super_admin') {
                return next();
            }

            const role = await Role.findById(req.user.role._id);

            if (!role) {
                return res.status(403).json({ error: '角色不存在' });
            }

            // 查找资源权限
            const permission = role.permissions.find(p => p.resource === resource);

            if (!permission || !permission.actions.includes(action)) {
                return res.status(403).json({
                    error: '无此操作权限',
                    resource,
                    action,
                    message: `需要 ${resource}:${action} 权限`
                });
            }

            next();
        } catch (error) {
            console.error('权限检查错误:', error);
            return res.status(500).json({ error: '权限检查失败' });
        }
    };
};

// 检查是否为资源所有者或管理员
exports.checkOwnership = (Model, paramName = 'id') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[paramName];
            const resource = await Model.findById(resourceId);

            if (!resource) {
                return res.status(404).json({ error: '资源不存在' });
            }

            // 超级管理员和管理员可以访问
            if (['super_admin', 'admin'].includes(req.user.role.name)) {
                return next();
            }

            // 检查是否为资源所有者
            const ownerId = resource.user || resource.createdBy;
            if (ownerId && ownerId.toString() === req.user._id.toString()) {
                return next();
            }

            return res.status(403).json({ error: '无权访问此资源' });
        } catch (error) {
            return res.status(500).json({ error: '权限验证失败' });
        }
    };
};