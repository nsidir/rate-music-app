// src/services/AlbumService.ts
import { injectable, inject } from "tsyringe";
import { IEntityService } from "../interfaces/IEntityService";
import { Album, CreateAlbum, UserAlbumAssignment } from "../types";
import { albumsTable, artistsTable, usersToAlbumsTable } from "../db/schema";
import { eq, and, avg, count, sql } from "drizzle-orm";
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

  async getAlbumWithStats(albumId: number): Promise<any | null> {
  // First, get the album's core details and artist name
  const [albumDetails] = await this.dbService.getDb().select({
      album_id: albumsTable.album_id,
      album_name: albumsTable.album_name,
      artist_id: albumsTable.artist_id,
      cover_url: albumsTable.cover_url,
      artist_name: artistsTable.artist_name,
    })
    .from(albumsTable)
    .innerJoin(artistsTable, eq(albumsTable.artist_id, artistsTable.artist_id))
    .where(eq(albumsTable.album_id, albumId));

  if (!albumDetails) {
    return null;
  }

  // Then, calculate the aggregate stats for that album
  const [albumStats] = await this.dbService.getDb()
    .select({
      // Calculate the average of non-null ratings
      avgRating: avg(usersToAlbumsTable.rating),
      // Count rows where 'favorite' is true
      favoriteCount: count(sql`CASE WHEN ${usersToAlbumsTable.favorite} = true THEN 1 END`),
    })
    .from(usersToAlbumsTable)
    .where(eq(usersToAlbumsTable.album_id, albumId));

  // Combine the results
  return {
    ...albumDetails,
    avgRating: albumStats.avgRating ? parseFloat(albumStats.avgRating).toFixed(2) : null,
    favoriteCount: Number(albumStats.favoriteCount) || 0,
  };
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

  // Search for album using cache aside approach
// This function returns up to 10 album objects matching the keyword,
// including cover art obtained via the external API.
// It does NOT insert albums into the database.
async searchAlbumsInfo(keyword: string): Promise<Album[]> {
  const db = this.dbService.getDb();
  // Call the MusicBrainz API to search for albums matching the keyword
  const releases = await searchAlbumsByKeyword(keyword);
  const albums: Album[] = [];

  for (const release of releases) {
    // Extract album title and artist name. MusicBrainz releases usually include an "artist-credit" array.
    const albumName: string = release.title;
    const artistCredit = release["artist-credit"];
    const artistName: string | null =
      Array.isArray(artistCredit) && artistCredit.length > 0
        ? artistCredit[0].name
        : null;
    if (!albumName || !artistName) continue;

    // Check if the album already exists in the local cache (database)
    let album = await this.findAlbumByNameAndArtist(albumName, artistName);
    if (!album) {
      // Fetch cover art for this album from the external API
      const coverUrl = await searchAlbumCover(albumName, artistName);
      if (!coverUrl) {
        // If no cover art is found, skip this album
        continue;
      }

      // Instead of inserting the album into the DB,
      // create a temporary album object with dummy IDs (e.g., album_id and artist_id set to 0)
      album = {
        album_id: 0, // Indicates not persisted in DB
        album_name: albumName,
        artist_id: 0, // No associated artist record in DB yet
        cover_url: coverUrl,
        // You can include additional joined info like artist_name if your Album type expects it.
        artist_name: artistName,
      } as Album;
    }
    albums.push(album);
  }
  return albums;
}

}