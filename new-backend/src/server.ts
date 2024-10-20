import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import 'reflect-metadata';
import { container } from 'tsyringe';
import { UserController } from './controllers/UserController';
import { AlbumController } from './controllers/AlbumController';
import { DatabaseService } from './services/DatabaseService';
import { UserService } from './services/UserService';
import { AlbumService } from './services/AlbumService';
import { AuthMiddleware } from './middleware/AuthMiddleware';
import session from 'express-session';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

// Session middleware
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || 'supersecretkey',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: process.env.NODE_ENV === 'production' }, // Set true if using HTTPS in production
//   })
// );

// Controllers
const userController = container.resolve(UserController);
const albumController = container.resolve(AlbumController);

// Public routes
app.post('/api/signup', async (req: Request, res: Response) => {
  try {
    const newUser = await userController.createUser(req.body);
    res.status(201).json({ message: 'User created', user: newUser });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

const loginHandler: express.RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;
  
      const user = await userController.validateUser(username, password);
  
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
  
      const token = jwt.sign(
        { id: user.user_id, username: user.username },
        process.env.JWT_SECRET || 'supersecretkey',
        { expiresIn: '1h' }
      );
  
      res.status(200).json({ message: 'Login successful', token, user: { id: user.user_id, username: user.username } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  };
  
app.post('/api/login', loginHandler);

// Protected routes
app.get('/api/albums', AuthMiddleware.authenticateJWT, async (req: Request, res: Response) => {
  try {
    const albums = await albumController.getAllAlbums();
    res.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
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
