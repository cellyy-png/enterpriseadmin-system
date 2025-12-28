const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['super_admin', 'admin', 'user', 'merchant']
    },
    displayName: {
        type: String,
        required: true
    },
    permissions: [{
        resource: String, // 'user', 'order', 'product', 'category'
        actions: [String] // ['create', 'read', 'update', 'delete']
    }],
    description: String,
    level: { type: Number, default: 0 }, // 权限等级
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Role', roleSchema);