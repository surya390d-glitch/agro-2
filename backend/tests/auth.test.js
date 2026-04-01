const request = require('supertest');
const path = require('path');
const fs = require('fs');

const app = require('../index');
const { initDB } = require('../database/db');

beforeAll(() => {
    // Use test DB path so production DB isn't polluted
    process.env.DB_PATH = path.join(__dirname, '..', 'data', 'agroguardian-test.db');
    // Remove existing test DB file from previous runs
    try { fs.unlinkSync(process.env.DB_PATH); } catch (err) {}
    initDB();
});

afterAll(() => {
    try { fs.unlinkSync(process.env.DB_PATH); } catch (err) {}
});

describe('Auth endpoints', () => {
    const testUser = {
        name: 'test user',
        phone: `999${Date.now().toString().slice(-7)}`,
        email: 'test@example.com',
        password: 'pass1234'
    };

    let token;

    it('should register a new user', async() => {
        const res = await request(app).post('/api/auth/register').send(testUser);
        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeTruthy();
        expect(res.body.user.phone).toBe(testUser.phone);
        token = res.body.token;
    });

    it('should login with registered user', async() => {
        const res = await request(app).post('/api/auth/login').send({ phone: testUser.phone, password: testUser.password });
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeTruthy();
        token = res.body.token;
    });

    it('should get current user profile using token', async() => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.user.phone).toBe(testUser.phone);
    });
});