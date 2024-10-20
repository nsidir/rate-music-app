// src/controllers/AuthController.ts
import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import bcrypt from 'bcryptjs';

@injectable()
export class AuthController {
  constructor(private userService: UserService) {}

  // Signup function
  async signup(req: Request, res: Response) {
    try {
      const { username, password, email } = req.body;

      // Check if user already exists
      const existingUser = await this.userService.getByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await this.userService.createUser({ username, password: hashedPassword, email });

      return res.status(201).json({ message: 'User created', user: newUser });
    } catch (error) {
      console.error('Error during signup:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Login function
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      // Find user by username
      const user = await this.userService.getByUsername(username);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      return res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
