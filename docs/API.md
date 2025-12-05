
API 接口文档
基础信息

Base URL: http://localhost:5000/api
认证方式: JWT Bearer Token
请求头:

Content-Type: application/json
Authorization: Bearer {token}




认证接口
用户注册
httpPOST /auth/register
请求体:
json{
"username": "string",
"email": "string",
"password": "string"
}
响应:
json{
"message": "注册成功",
"token": "jwt_token",
"user": {
"id": "user_id",
"username": "username",
"email": "email",
"role": "role_name"
}
}
用户登录
httpPOST /auth/login
请求体:
json{
"email": "string",
"password": "string"
}

用户管理
获取用户列表
httpGET /users?page=1&limit=10&search=&status=
查询参数:

page: 页码（默认1）
limit: 每页数量（默认10）
search: 搜索关键词
status: 用户状态

获取用户详情
httpGET /users/:id
创建用户
httpPOST /users
更新用户
httpPUT /users/:id
删除用户
httpDELETE /users/:id

商品管理
获取商品列表
httpGET /products?page=1&limit=10&category=&status=
创建商品
httpPOST /products
请求体:
json{
"name": "string",
"sku": "string",
"price": number,
"stock": number,
"category": "category_id"
}

订单管理
获取订单列表
httpGET /orders?page=1&limit=10&status=
创建订单
httpPOST /orders
更新订单状态
httpPUT /orders/:id/status

数据统计
获取数据概览
httpGET /dashboard/overview
获取销售趋势
httpGET /dashboard/sales-trend?period=7days
