// src/middleware/AuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export class AuthMiddleware {
  static authenticateJWT(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
      (req as any).user = decoded; // Attach user data to request object
      next();
    } catch (error) {
      res.status(403).json({ error: 'Invalid or expired token' });
    }
  }
}
