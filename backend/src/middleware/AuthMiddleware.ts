// src/middleware/AuthMiddleware.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express's Request interface to include a user property.
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authorizeRole = (requiredRole: string): RequestHandler => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || user.role_name !== requiredRole) {
      res.status(403).json({ error: 'Forbidden: You do not have the required permissions.' });
      return;
    }

    next();
  };
};

export class AuthMiddleware {
  static authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.VITE_JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set in the environment variables.');
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded; // Attach user data to request object.
      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      res.status(403).json({ error: 'Invalid or expired token' });
    }
  }
}
