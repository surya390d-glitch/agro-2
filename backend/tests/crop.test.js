const request = require('supertest');
const path = require('path');
const fs = require('fs');

const app = require('../index');
const { initDB } = require('../database/db');

beforeAll(() => {
    process.env.DB_PATH = path.join(__dirname, '..', 'data', 'agroguardian-test.db');
    try { fs.unlinkSync(process.env.DB_PATH); } catch (err) {}
    initDB();
});

afterAll(() => {
    try { fs.unlinkSync(process.env.DB_PATH); } catch (err) {}
});

describe('Crop endpoints', () => {
    const testUser = {
        name: 'cropuser',
        phone: `998${Date.now().toString().slice(-7)}`,
        email: 'crop@example.com',
        password: 'pass1234'
    };
    let token;

    beforeAll(async() => {
        await request(app).post('/api/auth/register').send(testUser);
        const login = await request(app).post('/api/auth/login').send({ phone: testUser.phone, password: testUser.password });
        token = login.body.token;
    });

    it('should advise on crop selection', async() => {
        const res = await request(app)
            .post('/api/crop/advise')
            .set('Authorization', `Bearer ${token}`)
            .send({ soilType: 'loamy', landSize: 2, waterAvailability: 'moderate', waterSource: 'canal', season: 'kharif' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.recommendations)).toBe(true);
    });

    it('should select a crop and show mentorship tasks', async() => {
        const sel = await request(app)
            .post('/api/crop/select')
            .set('Authorization', `Bearer ${token}`)
            .send({ cropName: 'rice', soilType: 'loamy', landSize: 2, season: 'kharif', waterSource: 'canal' });

        expect(sel.statusCode).toBe(200);
        expect(sel.body.success).toBe(true);
        expect(sel.body.cropId).toBeGreaterThan(0);

        const tasksRes = await request(app)
            .get(`/api/crop/mentorship/${sel.body.cropId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(tasksRes.statusCode).toBe(200);
        expect(Array.isArray(tasksRes.body.tasks)).toBe(true);
    });
});