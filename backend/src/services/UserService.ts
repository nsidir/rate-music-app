// src/services/UserService.ts
import { injectable, inject } from "tsyringe";
import { IEntityService } from "../interfaces/IEntityService";
import { User, CreateUser } from "../types";
import { usersTable, usersToAlbumsTable, albumsTable, artistsTable } from "../db/schema";
import { eq, and } from "drizzle-orm";
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

  // Fetch all rating records for the given user.
  async getUserRatings(userId: number): Promise<any[]> {
    return await this.dbService.getDb()
      .select({
        album_id: albumsTable.album_id,
        album_name: albumsTable.album_name,
        artist_name: artistsTable.artist_name,
        cover_url: albumsTable.cover_url,
        rating: usersToAlbumsTable.rating,
      })
      .from(usersToAlbumsTable)
      .innerJoin(albumsTable, eq(usersToAlbumsTable.album_id, albumsTable.album_id))
      .innerJoin(artistsTable, eq(albumsTable.artist_id, artistsTable.artist_id))
      .where(eq(usersToAlbumsTable.user_id, userId))
      .execute();
  }

  // Add album rating for user using an upsert
  async addRating(userId: number, albumId: number, rating: number): Promise<void> {
    await this.dbService.getDb()
      .insert(usersToAlbumsTable)
      .values({
        user_id: userId,
        album_id: albumId,
        rating: rating,
      })
      .onConflictDoUpdate({
        target: [usersToAlbumsTable.user_id, usersToAlbumsTable.album_id],
        set: { rating: rating },
      });
  }

  // Remove album from user's favorites
  async removeFavorite(userId: number, albumId: number): Promise<void> {
    await this.dbService.getDb()
      .insert(usersToAlbumsTable)
      .values({
          user_id: userId,
          album_id: albumId,
          favorite: false,
      })
      .onConflictDoUpdate({
          target: [usersToAlbumsTable.user_id, usersToAlbumsTable.album_id],
          set: { favorite: false },
      });
  }

  // Get user-specific data for an album
  async getAlbumUserData(userId: number, albumId: number): Promise<{ rating: number | null, favorite: boolean, review: string | null } | null> {
      const [data] = await this.dbService.getDb()
          .select({
              rating: usersToAlbumsTable.rating,
              favorite: usersToAlbumsTable.favorite,
              review: usersToAlbumsTable.review,
          })
          .from(usersToAlbumsTable)
          .where(and(
              eq(usersToAlbumsTable.user_id, userId),
              eq(usersToAlbumsTable.album_id, albumId)
          ));

      return data ? { rating: data.rating, favorite: data.favorite, review: data.review } : null;
  }

  // Fetch only favorite albums (where favorite is true) for the given user.
  async getUserFavorites(userId: number): Promise<any[]> {
    return await this.dbService.getDb()
      .select({
        album_id: albumsTable.album_id,
        album_name: albumsTable.album_name,
        artist_name: artistsTable.artist_name,
        cover_url: albumsTable.cover_url,
      })
      .from(usersToAlbumsTable)
      .innerJoin(albumsTable, eq(usersToAlbumsTable.album_id, albumsTable.album_id))
      .innerJoin(artistsTable, eq(albumsTable.artist_id, artistsTable.artist_id))
      .where(
        and(
          eq(usersToAlbumsTable.user_id, userId),
          eq(usersToAlbumsTable.favorite, true)
        )
      )
      .execute();
  }

  // Add album to user's favorites using an upsert
  async addFavorite(userId: number, albumId: number): Promise<void> {
    await this.dbService.getDb()
      .insert(usersToAlbumsTable)
      .values({
        user_id: userId,
        album_id: albumId,
        favorite: true,
      })
      .onConflictDoUpdate({
        target: [usersToAlbumsTable.user_id, usersToAlbumsTable.album_id],
        set: { favorite: true },
      });
  }

  // Add/update a review for an album
  async addReview(userId: number, albumId: number, comment: string): Promise<void> {
    await this.dbService.getDb()
      .insert(usersToAlbumsTable)
      .values({
        user_id: userId,
        album_id: albumId,
        review: comment,
      })
      .onConflictDoUpdate({
        target: [usersToAlbumsTable.user_id, usersToAlbumsTable.album_id],
        set: { 
          review: comment,
        },
      });
  }
}