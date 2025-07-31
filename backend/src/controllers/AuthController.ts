// src/controllers/AuthController.ts
import { injectable, inject } from 'tsyringe';
import { Request, Response } from 'express';
import { UserController } from './UserController';
import jwt from 'jsonwebtoken';

@injectable()
export class AuthController {
  constructor(
    @inject(UserController) private userController: UserController
  ) {}

  async signup(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password, email } = req.body;

      // Check if user already exists
      const existingUser = await this.userController.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const newUser = await this.userController.createUser({ 
        username, 
        password, // Pass plain password, UserService will hash it
        email,
        role_name: 'user' // Default to user role
      });

      return res.status(201).json({ message: 'User created', user: newUser });
    } catch (error) {
      console.error('Error during signup:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Login function remains the same
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;

      // Validate user credentials using UserController
      const user = await this.userController.validateUser(username, password);
      console.log(user);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.user_id, username: user.username, role_name: user.role_name },
        process.env.VITE_JWT_SECRET || 'supersecretkey',
        { expiresIn: '24h' }
      );

      return res.status(200).json({ 
        message: 'Login successful', 
        token, 
        user: { id: user.user_id, username: user.username, role_name: user.role_name }
      });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}