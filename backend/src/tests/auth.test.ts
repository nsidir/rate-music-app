import "reflect-metadata";
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/AuthController';
import { UserController } from '../controllers/UserController';
import { DatabaseService } from '../services/DatabaseService';
import { UserService } from '../services/UserService';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = express();
app.use(express.json());

container.registerSingleton(DatabaseService);
container.register(UserService, { useClass: UserService });
container.register(UserController, { useClass: UserController });
container.register(AuthController, { useClass: AuthController });

const authController = container.resolve(AuthController);

app.post('/api/signup', async (req, res) => {
    try {
        await authController.signup(req, res);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/api/login', async (req, res) => {
    try {
        await authController.login(req, res);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

describe('Auth API', () => {
    let dbService: DatabaseService;

    beforeAll(() => {
        dbService = container.resolve(DatabaseService);
    });

    afterAll(async () => {
        // Clean up test user
        await dbService.getDb().delete(usersTable).where(eq(usersTable.username, 'testuser'));
        await dbService.close();
    });

    it('should allow a user to sign up', async () => {
        const response = await request(app)
            .post('/api/signup')
            .send({
                username: 'testuser',
                password: 'password123',
                email: 'testuser@example.com',
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User created');
    });

    it('should allow a registered user to log in', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.token).toBeDefined();
    });
});