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
}