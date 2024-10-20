import { injectable, inject } from 'tsyringe';
import { Request, Response } from 'express';
import { UserController } from './UserController'; // Inject UserController
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

@injectable()
export class AuthController {
  constructor(
    @inject(UserController) private userController: UserController // Injecting UserController
  ) {}

  // Signup function
  async signup(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password, email } = req.body;

      // Check if user already exists
      const existingUser = await this.userController.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await this.userController.createUser({ username, password: hashedPassword, email });

      return res.status(201).json({ message: 'User created', user: newUser });
    } catch (error) {
      console.error('Error during signup:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Login function using userController.validateUser
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;

      // Validate user credentials using UserController
      const user = await this.userController.validateUser(username, password);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.user_id, username: user.username },
        process.env.JWT_SECRET || 'supersecretkey',
        { expiresIn: '1h' }
      );

      return res.status(200).json({ 
        message: 'Login successful', 
        token, 
        user: { id: user.user_id, username: user.username }
      });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
