// src/services/AlbumService.ts
import { injectable, inject } from "tsyringe";
import { IEntityService } from "../interfaces/IEntityService";
import { Album, CreateAlbum, UserAlbumAssignment } from "../types";
import { albumsTable, artistsTable, usersToAlbumsTable } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { DatabaseService } from "./DatabaseService";
import { searchAlbumCover } from './MusicBrainzService';

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

  async findAlbumByNameAndArtist(albumName: string, artistName: string): Promise<Album | null> {
    const db = this.dbService.getDb();
    const [album] = await db.select({
        album_id: albumsTable.album_id,
        album_name: albumsTable.album_name,
        artist_id: albumsTable.artist_id,
        cover_url: albumsTable.cover_url,
      })
      .from(albumsTable)
      .innerJoin(artistsTable, eq(albumsTable.artist_id, artistsTable.artist_id))
      .where(and(eq(albumsTable.album_name, albumName), eq(artistsTable.artist_name, artistName)));
    return album ?? null;
  }

  // New method: search for album using cache aside approach
  async getOrFetchAlbumInfo(albumName: string, artistName: string): Promise<Album | null> {
    // 1. Try to find the album in the local database
    let album = await this.findAlbumByNameAndArtist(albumName, artistName);
    if (album) {
      return album;
    }
    
    // 2. Album not in DB; fetch from external API
    const coverUrl = await searchAlbumCover(albumName, artistName);
    if (!coverUrl) {
      return null; // Album does not exist as per external API
    }

    // 3. Ensure artist exists in the database (create if needed)
    const db = this.dbService.getDb();
    let [artist] = await db.select().from(artistsTable).where(eq(artistsTable.artist_name, artistName));
    if (!artist) {
      [artist] = await db.insert(artistsTable).values({ artist_name: artistName }).returning();
    }

    // 4. Insert the new album into the database
    const newAlbumData: CreateAlbum = {
      album_name: albumName,
      artist_id: artist.artist_id,
      cover_url: coverUrl,
    };

    [album] = await db.insert(albumsTable).values(newAlbumData).returning();
    return album;
  }
}