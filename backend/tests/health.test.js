const request = require('supertest');
const app = require('../index');

describe('Healthcheck', () => {
    it('should return API status', async() => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('AgroGuardian API Running');
        expect(res.body.version).toBe('1.0.0');
    });
});