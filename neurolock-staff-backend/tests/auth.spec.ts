import request from 'supertest';
import { createServer } from '../src/server';

const app = createServer();

describe('Auth Endpoints', () => {
    it('should register a user', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({ email: 'test@example.com', password: 'password' });
        expect(response.status).toBe(201);
    });

    it('should log in a user', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'password' });
        expect(response.status).toBe(200);
    });
});