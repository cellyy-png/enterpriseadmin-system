import axios from '@/utils/axios';

// 获取轮播图列表
export const getCarouselList = () => {
  return axios.get('/carousels');
};

// 新增轮播图
export const createCarousel = (data) => {
  // 如果是FormData对象，不进行解构，直接传递
  if (data instanceof FormData) {
    return axios.post('/carousels', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  // 过滤掉 id 字段，避免传递给后端
  const { id, ...carouselData } = data;
  return axios.post('/carousels', carouselData);
};

// 更新轮播图
export const updateCarousel = (id, data) => {
  // 如果是FormData对象，不进行解构，直接传递
  if (data instanceof FormData) {
    return axios.put(`/carousels/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  // 过滤掉 id 字段，避免传递给后端
  const { id: _, ...carouselData } = data;
  return axios.put(`/carousels/${id}`, carouselData);
};

// 删除轮播图
export const deleteCarousel = (id) => {
  return axios.delete(`/carousels/${id}`);
};
