import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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
const port = process.env.VITE_PORT || 3000;

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

// Album details with stats
app.get('/api/albums/:id', (req, res, next) => {
  const albumId = parseInt(req.params.id, 10);
  albumController
    .getAlbumWithStats(albumId)
    .then((album) => {
      if (album) {
        res.json(album);
      } else {
        res.status(404).json({ error: 'Album not found' });
      }
    })
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

// Remove album from favorites
app.delete('/api/albums/:id/favorites', AuthMiddleware.authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const albumId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const result = await userController.removeFavorite(userId, albumId);
    res.json({ message: `Album with id:${albumId} removed from favorites of user with id:${userId} `, result });
  } catch (error) {
    next(error);
  }
});

// Add/update album rating
app.post('/api/albums/:id/ratings', AuthMiddleware.authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
    try {
        const albumId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const { rating } = req.body;
        const result = await userController.addRating(userId, albumId, rating);
        res.json({ message: `Rating for album with id:${albumId} updated for user with id:${userId} `, result });
    } catch (error) {
        next(error);
    }
});

// Get user-specific album data (rating and favorite status)
app.get('/api/user/albums/:albumId/status', AuthMiddleware.authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
    try {
        const albumId = parseInt(req.params.albumId, 10);
        const userId = req.user.id;
        const result = await userController.getAlbumUserData(userId, albumId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

//Get a user's profile info (favorites and ratings)
app.get('/api/user/profile/:id', (req: Request, res: Response, next: NextFunction) => {
  userController.getUserProfile(req, res).catch(next);
});

// Search for an album
app.get('/api/albums/search', (req, res, next) => {
  albumController.searchAlbum(req, res, next).catch(next);
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
