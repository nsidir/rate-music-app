// src/controllers/UserController.ts
import { injectable, inject } from "tsyringe";
import { UserService } from "../services/UserService";
import { User, CreateUser } from "../types";

@injectable()
export class UserController {
  constructor(@inject(UserService) private userService: UserService) {}

  async createUser(data: CreateUser): Promise<User> {
    return await this.userService.createUser(data);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAll();
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userService.getById(id);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await this.userService.getByUsername(username);
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return await this.userService.update(id, data);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userService.delete(id);
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    return await this.userService.validate(username, password);
  }

  async getUserProfile(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const userId = Number(id);
      const user = await this.userService.getById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      const ratings = await this.userService.getUserRatings(userId);
      const favorites = await this.userService.getUserFavorites(userId);
      res.json({ user, ratings, favorites });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user profile' });
    }
  }

  async addFavorite(userId: number, albumId: number): Promise<void> {
    await this.userService.addFavorite(userId, albumId);
  }

  async addRating(userId: number, albumId: number, rating: number): Promise<void> {
    await this.userService.addRating(userId, albumId, rating);
  }

  async addReview(userId: number, albumId: number, comment: string) {
    await this.userService.addReview(userId, albumId, comment);
  }

  async removeFavorite(userId: number, albumId: number): Promise<void> {
    await this.userService.removeFavorite(userId, albumId);
  }

  async getAlbumUserData(userId: number, albumId: number): Promise<{ rating: number | null, favorite: boolean } | null> {
    return await this.userService.getAlbumUserData(userId, albumId);
  }


  async getUserRatings(userId: number): Promise<User[]> {
    return await this.userService.getUserRatings(userId);
  }

  async getUserFavorites(userId: number): Promise<User[]> {
    return await this.userService.getUserFavorites(userId);
  }
}