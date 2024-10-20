import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { container } from 'tsyringe';
import { UserController } from './controllers/UserController';
import { AlbumController } from './controllers/AlbumController';
import { AuthController } from './controllers/AuthController';
import { DatabaseService } from './services/DatabaseService';
import { UserService } from './services/UserService';
import { AlbumService } from './services/AlbumService';
import { AuthMiddleware } from './middleware/AuthMiddleware';

// Dependency Injection setup
container.registerSingleton(DatabaseService);
container.register(UserService, { useClass: UserService });
container.register(AlbumService, { useClass: AlbumService });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Controllers
const userController = container.resolve(UserController);
const albumController = container.resolve(AlbumController);
const authController = container.resolve(AuthController);

// Public routes
app.post('/api/signup', (req, res, next) => {
  authController.signup(req, res).catch(next); // Use the AuthController for signup
});

app.post('/api/login', (req, res, next) => {
  authController.login(req, res).catch(next); // Use the AuthController for login
});

// Protected routes
app.get('/api/albums', AuthMiddleware.authenticateJWT, (req, res, next) => {
  albumController.getAllAlbums().then(albums => res.json(albums)).catch(next); // Handle errors and return response
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  const dbService = container.resolve(DatabaseService);
  await dbService.close();
  process.exit(0);
});
