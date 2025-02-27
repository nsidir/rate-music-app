// src/services/AlbumService.ts
import { injectable, inject } from "tsyringe";
import { IEntityService } from "../interfaces/IEntityService";
import { Album, CreateAlbum, UserAlbumAssignment } from "../types";
import { albumsTable, artistsTable, usersToAlbumsTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { DatabaseService } from "./DatabaseService";

@injectable()
export class AlbumService implements IEntityService<Album, CreateAlbum> {
  constructor(@inject(DatabaseService) private dbService: DatabaseService) {}

  async create(data: CreateAlbum): Promise<Album> {
    const [insertedAlbum] = await this.dbService.getDb().insert(albumsTable).values(data).returning();
    return insertedAlbum;
  }

  // async getAll(): Promise<Album[]> {
  //   return await this.dbService.getDb().select().from(albumsTable);
  // }

  async getAll(): Promise<Album[]> {
    return await this.dbService.getDb().select({
      album_id: albumsTable.album_id,
      album_name: albumsTable.album_name,
      artist_id: albumsTable.artist_id,
      cover_url: albumsTable.cover_url,
      artist_name: artistsTable.artist_name,
    })
    .from(albumsTable)
    .innerJoin(artistsTable, eq(albumsTable.artist_id, artistsTable.artist_id));
  }

  async getById(id: number): Promise<Album | null> {
    const [album] = await this.dbService.getDb().select().from(albumsTable).where(eq(albumsTable.album_id, id));
    return album ?? null;
  }

  async update(id: number, data: Partial<Album>): Promise<Album> {
    const [updatedAlbum] = await this.dbService.getDb().update(albumsTable).set(data).where(eq(albumsTable.album_id, id)).returning();
    return updatedAlbum;
  }

  async delete(id: number): Promise<void> {
    await this.dbService.getDb().delete(albumsTable).where(eq(albumsTable.album_id, id));
  }

  async assignAlbums(assignments: UserAlbumAssignment[]): Promise<void> {
    await this.dbService.getDb().insert(usersToAlbumsTable).values(assignments);
  }
}