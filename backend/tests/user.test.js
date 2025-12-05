const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

describe('User API', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
        await User.deleteMany({});

        const user = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: 'Admin123456'
        });

        userId = user._id;
        authToken = generateToken(userId);
    });

    describe('GET /api/users', () => {
        it('should get all users', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.users).toBeInstanceOf(Array);
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .get('/api/users');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/users/:id', () => {
        it('should get user by id', async () => {
            const res = await request(app)
                .get(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.user.email).toBe('admin@example.com');
        });
    });
});