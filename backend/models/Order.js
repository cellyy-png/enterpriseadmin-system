const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        default: () => `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        subtotal: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'alipay', 'wechat', 'cash']
    },
    shippingAddress: {
        recipientName: String,
        phone: String,
        province: String,
        city: String,
        district: String,
        address: String,
        postalCode: String
    },
    trackingNumber: String,
    notes: String,
    paidAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// 索引
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// 计算小计
orderSchema.pre('save', function(next) {
    this.items.forEach(item => {
        item.subtotal = item.price * item.quantity;
    });
    next();
});

module.exports = mongoose.model('Order', orderSchema);