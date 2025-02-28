// src/services/AlbumService.ts
import { injectable, inject } from "tsyringe";
import { IEntityService } from "../interfaces/IEntityService";
import { Album, CreateAlbum, UserAlbumAssignment } from "../types";
import { albumsTable, artistsTable, usersToAlbumsTable } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { DatabaseService } from "./DatabaseService";
import { searchAlbumCover, searchAlbumsByKeyword } from './MusicBrainzService';

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
  async getOrFetchAlbumsInfo(keyword: string): Promise<Album[]> {
    const db = this.dbService.getDb();
    // Call the MusicBrainz API to search for albums matching the keyword
    const releases = await searchAlbumsByKeyword(keyword);
    const albums: Album[] = [];

    for (const release of releases) {
      // Extract album title and artist name. MusicBrainz releases usually include an "artist-credit" array.
      const albumName = release.title;
      const artistCredit = release["artist-credit"];
      const artistName = Array.isArray(artistCredit) && artistCredit.length > 0 ? artistCredit[0].name : null;
      if (!albumName || !artistName) continue;

      // Check if the album already exists in your local cache (database)
      let album = await this.findAlbumByNameAndArtist(albumName, artistName);
      if (!album) {
        // Fetch cover art for this album from the external API
        const coverUrl = await searchAlbumCover(albumName, artistName);
        if (!coverUrl) {
          // If no cover art is found, skip this album
          continue;
        }

        // Ensure the artist exists in the database (create if necessary)
        let [artist] = await db.select().from(artistsTable).where(eq(artistsTable.artist_name, artistName));
        if (!artist) {
          [artist] = await db.insert(artistsTable).values({ artist_name: artistName }).returning();
        }

        // Insert the new album into the database
        const newAlbumData: CreateAlbum = {
          album_name: albumName,
          artist_id: artist.artist_id,
          cover_url: coverUrl,
        };

        [album] = await db.insert(albumsTable).values(newAlbumData).returning();
      }
      albums.push(album);
    }
    return albums;
  }
}