//src/services/UserService.ts
import { injectable, inject } from "tsyringe";
import { IEntityService } from "../interfaces/IEntityService";
import { User, CreateUser } from "../types";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { DatabaseService } from "./DatabaseService";
import bcrypt from 'bcrypt';

@injectable()
export class UserService implements IEntityService<User, CreateUser> {
  constructor(@inject(DatabaseService) private dbService: DatabaseService) {}

  // Create a new user
  async create(data: CreateUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);  // Hash the password
    const [insertedUser] = await this.dbService.getDb().insert(usersTable).values({
      ...data,
      password: hashedPassword
    }).returning();
    return insertedUser;
  }

  // Get all users
  async getAll(): Promise<User[]> {
    return await this.dbService.getDb().select().from(usersTable);
  }

  // Get user by ID
  async getById(id: number): Promise<User | null> {
    const [user] = await this.dbService.getDb().select().from(usersTable).where(eq(usersTable.user_id, id));
    return user ?? null;
  }

  // Update user
  async update(id: number, data: Partial<User>): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);  // Hash the new password if updated
    }
    const [updatedUser] = await this.dbService.getDb().update(usersTable).set(data).where(eq(usersTable.user_id, id)).returning();
    return updatedUser;
  }

  // Delete user
  async delete(id: number): Promise<void> {
    await this.dbService.getDb().delete(usersTable).where(eq(usersTable.user_id, id));
  }

  // Get user by username
  async getByUsername(username: string): Promise<User | null> {
    const [user] = await this.dbService.getDb().select().from(usersTable).where(eq(usersTable.username, username));
    return user ?? null;
  }

  // Create user helper method for controller
  async createUser(data: CreateUser): Promise<User> {
    return this.create(data);
  }

  // Validate user credentials
  async validate(username: string, password: string): Promise<User | null> {
    const user = await this.getByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }
}
