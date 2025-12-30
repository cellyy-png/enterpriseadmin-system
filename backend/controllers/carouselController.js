const Carousel = require('../models/Carousel');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 获取轮播图列表
exports.getCarousels = async (req, res) => {
  try {
    console.log('开始获取轮播图列表...');
    
    // 只获取数据库中的轮播图，移除测试数据的干扰
    const carousels = await Carousel.find().sort({ sortOrder: 1, createdAt: -1 });
    
    console.log('轮播图列表:', carousels);
    console.log('返回的数据:', carousels);
    res.json({ success: true, data: carousels });
  } catch (error) {
    console.error('获取轮播图列表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 创建轮播图
exports.createCarousel = async (req, res) => {
  try {
    console.log('创建轮播图 - 请求体:', req.body);
    console.log('创建轮播图 - 文件对象:', req.file);
    console.log('创建轮播图 - 文件信息:', req.file ? req.file.originalname : 'No file uploaded');
    
    let imageUrl = req.body.imageUrl;
    
    // 如果有文件上传，处理图片上传 (使用 single 中间件，文件在 req.file)
    if (req.file) {
      const file = req.file;
      console.log('处理上传文件:', file);
      // 从Multer获取文件信息
      const originalName = file.originalname;
      const fileExtension = path.extname(originalName);
      const fileName = `${uuidv4()}${fileExtension}`;
      const uploadPath = path.join(__dirname, '../../public/uploads', fileName);
      
      // 确保上传目录存在
      if (!fs.existsSync(path.dirname(uploadPath))) {
        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
      }
      
      // 对于diskStorage，文件已经保存到file.path，无需额外处理，因为Multer已处理
      // 但是，如果需要自定义文件名，我们需要重命名
      if (file.path && fs.existsSync(file.path)) {
        // 重命名文件到目标位置
        fs.renameSync(file.path, uploadPath);
      }
      
      // 设置图片URL为相对路径
      imageUrl = `/uploads/${fileName}`;
      console.log('设置的图片URL:', imageUrl);
    }
    
    // 如果没有提供imageUrl且没有上传文件，返回错误
    if (!imageUrl) {
      console.log('没有找到imageUrl，返回错误');
      return res.status(400).json({ success: false, message: '请上传图片或提供图片URL' });
    }
    
    // 创建新的轮播图对象并保存到数据库，让MongoDB自动生成_id
    const newCarousel = new Carousel({
      title: req.body.title,
      imageUrl: imageUrl,
      linkUrl: req.body.linkUrl || '',
      sortOrder: req.body.sortOrder || 0,
      status: req.body.status || 'active'
    });
    
    await newCarousel.save();
    
    console.log('创建的新轮播图:', newCarousel);
    res.status(201).json({ success: true, message: '创建成功', data: newCarousel });
  } catch (error) {
    console.error('创建轮播图失败:', error);
    // 如果是验证错误，提供更具体的错误信息
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: '数据验证失败', details: validationErrors });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// 更新轮播图
exports.updateCarousel = async (req, res) => {
  try {
    console.log('开始更新轮播图，ID:', req.params.id);
    console.log('更新的数据:', req.body);
    
    // 验证ID格式
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: '无效的轮播图ID格式' });
    }
    
    // 检查是否有新的图片上传
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      const file = req.file;
      // 从Multer获取文件信息
      const originalName = file.originalname;
      const fileExtension = path.extname(originalName);
      const fileName = `carousel-${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
      const uploadPath = path.join(__dirname, '../../public/uploads', fileName);
      
      // 确保上传目录存在
      if (!fs.existsSync(path.dirname(uploadPath))) {
        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
      }
      
      // 对于diskStorage，文件已经保存到file.path，我们只需移动或重命名它
      if (file.path && fs.existsSync(file.path)) {
        // 重命名文件到目标位置
        fs.renameSync(file.path, uploadPath);
      }
      
      // 设置图片URL为相对路径
      imageUrl = `/uploads/${fileName}`;
      
      // 如果原来有图片，删除旧图片
      const oldCarousel = await Carousel.findById(req.params.id);
      if (oldCarousel && oldCarousel.imageUrl && oldCarousel.imageUrl.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '../..', oldCarousel.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    // 准备更新数据
    const updateData = { ...req.body };
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }
    
    // 更新数据库中的轮播图
    const carousel = await Carousel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // 返回更新后的文档并运行验证
    );
    
    if (!carousel) {
      return res.status(404).json({ success: false, message: '轮播图不存在' });
    }
    
    console.log('更新后的轮播图数据:', carousel);
    res.json({ success: true, message: '更新成功', data: carousel });
  } catch (error) {
    console.error('更新轮播图失败:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 删除轮播图
exports.deleteCarousel = async (req, res) => {
  try {
    // 验证ID格式
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: '无效的轮播图ID格式' });
    }
    
    const carousel = await Carousel.findByIdAndDelete(req.params.id);
    if (!carousel) {
      return res.status(404).json({ success: false, message: '轮播图不存在' });
    }
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};