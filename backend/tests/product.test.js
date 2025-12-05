const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');
const Category = require('../models/Category');

describe('Product API', () => {
    let categoryId;

    beforeEach(async () => {
        await Product.deleteMany({});
        await Category.deleteMany({});

        const category = await Category.create({
            name: '电子产品',
            slug: 'electronics'
        });
        categoryId = category._id;
    });

    describe('GET /api/products', () => {
        it('should get all products', async () => {
            await Product.create({
                name: 'iPhone 15',
                sku: 'IP15-001',
                price: 6999,
                stock: 100,
                category: categoryId
            });

            const res = await request(app).get('/api/products');

            expect(res.statusCode).toBe(200);
            expect(res.body.products).toHaveLength(1);
            expect(res.body.products[0].name).toBe('iPhone 15');
        });
    });

    describe('POST /api/products', () => {
        it('should create a new product', async () => {
            const res = await request(app)
                .post('/api/products')
                .send({
                    name: 'MacBook Pro',
                    sku: 'MBP-001',
                    price: 12999,
                    stock: 50,
                    category: categoryId
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.product.name).toBe('MacBook Pro');
        });
    });
});