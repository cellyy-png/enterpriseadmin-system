const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请输入轮播图标题'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, '请上传图片'],
    trim: true
  },
  linkUrl: {
    type: String,
    default: ''
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Carousel', carouselSchema);
