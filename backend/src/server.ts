import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { container } from 'tsyringe';

// Controller and Service imports
import { UserController } from './controllers/UserController';
import { AlbumController } from './controllers/AlbumController';
import { ArtistController } from './controllers/ArtistController';
import { AuthController } from './controllers/AuthController';
import { DatabaseService } from './services/DatabaseService';
import { UserService } from './services/UserService';
import { AlbumService } from './services/AlbumService';
import { ArtistService } from './services/ArtistService';
import { AuthenticatedRequest, AuthMiddleware } from './middleware/AuthMiddleware';

// Environment setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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

// --- Public Routes ---

// Authentication
app.post('/api/signup', (req, res, next) => {
    authController.signup(req, res).catch(next);
});

app.post('/api/login', (req, res, next) => {
    authController.login(req, res).catch(next);
});

// Albums
app.get('/api/albums', (req, res, next) => {
    albumController.getAllAlbums()
        .then(albums => res.json(albums))
        .catch(next);
});

app.get('/api/album-stats', (req, res, next) => {
    albumController.getAllAlbumsWithStats()
        .then(albums => res.json(albums))
        .catch(next);
});

// Search for an album
app.get('/api/albums/search', (req, res, next) => {
    albumController.searchAlbum(req, res, next).catch(next);
});


// Get all reviews for an album
app.get('/api/albums/:id/reviews', async (req, res, next) => {
    try {
        const albumId = parseInt(req.params.id, 10);
        const reviews = await albumController.getAlbumReviews(albumId);
        res.json(reviews);
    } catch (error) {
        next(error);
    }
});

// Album details with stats
app.get('/api/albums/:id', (req, res, next) => {
    const albumId = parseInt(req.params.id, 10);
    albumController.getAlbumWithStats(albumId)
        .then(album => {
            if (album) {
                res.json(album);
            } else {
                res.status(404).json({ error: 'Album not found' });
            }
        })
        .catch(next);
});


// --- Authenticated Routes ---

// Add/update a review for an album
app.post('/api/albums/:id/reviews', AuthMiddleware.authenticateJWT, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const albumId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const { comment } = req.body;

        if (comment.trim().length > 2000) {
            res.status(400).json({ error: 'Review comment must be less than 2000 characters' });
            return;
        }

        await userController.addReview(userId, albumId, comment.trim());
        res.json({ message: `Review added for album with id:${albumId} by user with id:${userId}` });
    } catch (error) {
        next(error);
    }
});

// Add album to favorites
app.post('/api/albums/:id/favorites', AuthMiddleware.authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
    try {
        const albumId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const result = await userController.addFavorite(userId, albumId);
        res.json({ message: `Album with id:${albumId} added to favorites for user with id:${userId}`, result });
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
        res.json({ message: `Album with id:${albumId} removed from favorites for user with id:${userId}`, result });
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

        //Should be able to send null rating to remove a rating
        if (rating === null) {
            await userController.removeRating(userId, albumId);
            res.json({ message: `Rating for album with id:${albumId} removed for user with id:${userId}` });
            return;
        }

        else if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
            return;
        }

        const result = await userController.addRating(userId, albumId, rating);
        res.json({ message: `Rating for album with id:${albumId} updated for user with id:${userId}`, result });
    } catch (error) {
        next(error);
    }
});

// Get user-specific album data (rating, favorite status, and review)
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

// Get a user's profile info (favorites and ratings)
app.get('/api/user/profile/:id', (req, res, next) => {
    userController.getUserProfile(req, res).catch(next);
});

//// Returns user profile data for a given username

app.get('/api/user/profile/username/:username', (req, res, next) => {
  userController.getUserProfileByUsername(req, res).catch(next);
});


// --- Error Handling ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// --- Server Start ---
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