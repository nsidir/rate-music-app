// src/services/AlbumService.ts
import { injectable, inject } from "tsyringe";
import { IEntityService } from "../interfaces/IEntityService";
import { Album, CreateAlbum, UserAlbumAssignment } from "../types";
import { albumsTable, artistsTable, usersToAlbumsTable, usersTable } from "../db/schema";
import { eq, and, avg, count, sql, isNotNull, desc } from "drizzle-orm";
import { DatabaseService } from "./DatabaseService";
import { searchAlbumCover, searchAlbumsByKeyword } from './MusicBrainzService';
import { toSlug } from '../utility/toSlug';

@injectable()
export class AlbumService implements IEntityService<Album, CreateAlbum> {
  constructor(@inject(DatabaseService) private dbService: DatabaseService) {}

  async create(data: CreateAlbum): Promise<Album> {
    const album_slug = toSlug(data.album_name);
    const [insertedAlbum] = await this.dbService.getDb().insert(albumsTable).values({ ...data, album_slug }).returning();
    return insertedAlbum;
  }

  async createWithArtistName(data: Omit<CreateAlbum, 'artist_id'> & { artist_name: string }): Promise<Album> {
    const db = this.dbService.getDb();

    // if artist exists
    let [artist] = await db
      .select()
      .from(artistsTable)
      .where(eq(artistsTable.artist_name, data.artist_name));

    // if artist doesn't exist, insert
    if (!artist) {
      const artist_slug = toSlug(data.artist_name);
      [artist] = await db.insert(artistsTable)
        .values({
          artist_name: data.artist_name,
          artist_slug,
        })
        .returning();
    }

    // insert the album using artist_id
    const album_slug = toSlug(data.album_name);
    const [insertedAlbum] = await db.insert(albumsTable)
      .values({
        album_name: data.album_name,
        cover_url: data.cover_url,
        album_slug,
        artist_id: artist.artist_id,
      })
      .returning();

    return insertedAlbum;
  }

  async getAll(): Promise<Album[]> {
    return await this.dbService.getDb().select({
      album_id: albumsTable.album_id,
      album_name: albumsTable.album_name,
      artist_id: albumsTable.artist_id,
      cover_url: albumsTable.cover_url,
      album_slug: albumsTable.album_slug,
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
    const [albumDetails] = await this.dbService.getDb().select({
        album_id: albumsTable.album_id,
        album_name: albumsTable.album_name,
        artist_id: albumsTable.artist_id,
        cover_url: albumsTable.cover_url,
        artist_name: artistsTable.artist_name,
        artist_slug: artistsTable.artist_slug,
      })
      .from(albumsTable)
      .innerJoin(artistsTable, eq(albumsTable.artist_id, artistsTable.artist_id))
      .where(eq(albumsTable.album_id, albumId));

    if (!albumDetails) {
      return null;
    }

    const [albumStats] = await this.dbService.getDb()
      .select({
        avgRating: avg(usersToAlbumsTable.rating),
        favoriteCount: count(sql`CASE WHEN ${usersToAlbumsTable.favorite} = true THEN 1 END`),
      })
      .from(usersToAlbumsTable)
      .where(eq(usersToAlbumsTable.album_id, albumId));

    return {
      ...albumDetails,
      avgRating: albumStats.avgRating ? parseFloat(albumStats.avgRating).toFixed(2) : null,
      favoriteCount: Number(albumStats.favoriteCount) || 0,
    };
  }

  async getAllAlbumsWithStats(): Promise<any[]> {
    const albumsWithStats = await this.dbService.getDb()
      .select({
        album_id: albumsTable.album_id,
        album_name: albumsTable.album_name,
        artist_name: artistsTable.artist_name,
        cover_url: albumsTable.cover_url,
        avgRating: avg(usersToAlbumsTable.rating),
        ratingCount: count(usersToAlbumsTable.rating),
      })
      .from(albumsTable)
      .innerJoin(artistsTable, eq(albumsTable.artist_id, artistsTable.artist_id))
      .leftJoin(usersToAlbumsTable, eq(albumsTable.album_id, usersToAlbumsTable.album_id))
      .groupBy(albumsTable.album_id, artistsTable.artist_name)
      .orderBy(desc(sql`(${avg(usersToAlbumsTable.rating)})`));

    return albumsWithStats.map(album => ({
      ...album,
      avgRating: album.avgRating ? parseFloat(album.avgRating).toFixed(2) : null,
      ratingCount: Number(album.ratingCount) || 0,
    }));
  }


  async findAlbumByNameAndArtist(albumName: string, artistName: string): Promise<Album | null> {
    const db = this.dbService.getDb();
    const [album] = await db.select({
        album_id: albumsTable.album_id,
        album_name: albumsTable.album_name,
        artist_id: albumsTable.artist_id,
        cover_url: albumsTable.cover_url,
        album_slug: albumsTable.album_slug,
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
          album_slug: toSlug(albumName),
          // You can include additional joined info like artist_name if your Album type expects it.
          artist_name: artistName,
        } as Album;
      }
      albums.push(album);
    }
    return albums;
  }

  // Get all reviews for a specific album
  async getAlbumReviews(albumId: number): Promise<any[]> {
      const db = this.dbService.getDb();
      
      const reviews = await db
          .select({
              review_id: usersToAlbumsTable.user_id,
              username: usersTable.username,
              comment: usersToAlbumsTable.review,
              created_at: usersToAlbumsTable.created_at
          })
          .from(usersToAlbumsTable)
          .innerJoin(usersTable, eq(usersToAlbumsTable.user_id, usersTable.user_id))
          .innerJoin(albumsTable, eq(usersToAlbumsTable.album_id, albumsTable.album_id))
          .where(and(
              eq(usersToAlbumsTable.album_id, albumId),
              isNotNull(usersToAlbumsTable.review),
              sql`${usersToAlbumsTable.review} != ''`
          ))
          .orderBy(desc(usersToAlbumsTable.created_at));      
      return reviews;
  }
}