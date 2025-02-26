import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { container } from 'tsyringe';
import { UserController } from './controllers/UserController';
import { AlbumController } from './controllers/AlbumController';
import { ArtistController } from './controllers/ArtistController';
import { AuthController } from './controllers/AuthController';
import { DatabaseService } from './services/DatabaseService';
import { UserService } from './services/UserService';
import { AlbumService } from './services/AlbumService';
import { ArtistService } from './services/ArtistService';
import { AuthenticatedRequest, AuthMiddleware } from './middleware/AuthMiddleware';

// Dependency Injection setup
container.registerSingleton(DatabaseService);
container.register(UserService, { useClass: UserService });
container.register(AlbumService, { useClass: AlbumService });
container.register(ArtistService, { useClass: ArtistService });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Controllers
const userController = container.resolve(UserController);
const albumController = container.resolve(AlbumController);
const artistController = container.resolve(ArtistController);
const authController = container.resolve(AuthController);

// Public routes
app.post('/api/signup', (req, res, next) => {
  authController.signup(req, res).catch(next);
});

app.post('/api/login', (req, res, next) => {
  authController.login(req, res).catch(next);
});

// Albums (public endpoint)
app.get('/api/albums', (req, res, next) => {
  albumController
    .getAllAlbums()
    .then((albums) => res.json(albums))
    .catch(next);
});

// Add album to favorites
app.post('/api/albums/:id/favorites', AuthMiddleware.authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const albumId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const result = await userController.addFavorite(userId, albumId);
    res.json({ message: `Album with id:${albumId} added to favorites of user with id:${userId} `, result });
  } catch (error) {
    next(error);
  }
});

//Get a user's profile info (favorites and ratings)
app.get('/api/user/profile/:id', (req: Request, res: Response, next: NextFunction) => {
  userController.getUserProfile(req, res).catch(next);
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
