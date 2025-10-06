import { injectable, inject } from "tsyringe";
import { IEntityService } from "../interfaces/IEntityService";
import { Album, CreateAlbum, UserAlbumAssignment } from "../types";
import {
  albumsTable,
  artistsTable,
  usersToAlbumsTable,
  usersTable,
  genresTable,
  albumsToGenresTable,
} from "../db/schema";
import {
  eq,
  and,
  avg,
  count,
  sql,
  isNotNull,
  desc,
} from "drizzle-orm";
import { DatabaseService } from "./DatabaseService";
import { toSlug } from "../utility/toSlug";

@injectable()
export class AlbumService implements IEntityService<Album, CreateAlbum> {
  constructor(@inject(DatabaseService) private dbService: DatabaseService) {}

  async create(data: CreateAlbum): Promise<Album> {
    const album_slug = toSlug(data.album_name);
    const [insertedAlbum] = await this.dbService
      .getDb()
      .insert(albumsTable)
      .values({ ...data, album_slug })
      .returning();
    return insertedAlbum;
  }

  async createWithArtistName(
    data: Omit<CreateAlbum, "artist_id" | "genre_id"> & {
      artist_name: string;
      genre_ids?: number[];
    }
  ): Promise<Album> {
    const db = this.dbService.getDb();

    // Handle artist
    let [artist] = await db
      .select()
      .from(artistsTable)
      .where(eq(artistsTable.artist_name, data.artist_name));

    if (!artist) {
      const artist_slug = toSlug(data.artist_name);
      [artist] = await db
        .insert(artistsTable)
        .values({
          artist_name: data.artist_name,
          artist_slug,
        })
        .returning();
    }

    // Insert album
    const album_slug = toSlug(data.album_name);
    const [insertedAlbum] = await db
      .insert(albumsTable)
      .values({
        album_name: data.album_name,
        cover_url: data.cover_url,
        album_slug,
        artist_id: artist.artist_id,
        year: data.year,
      })
      .returning();

    // Insert genres (many-to-many)
    if (data.genre_ids && data.genre_ids.length > 0) {
      const genreLinks = data.genre_ids.map((genre_id) => ({
        album_id: insertedAlbum.album_id,
        genre_id,
      }));
      await db.insert(albumsToGenresTable).values(genreLinks);
    }

    return insertedAlbum;
  }

  async getAll(): Promise<Album[]> {
    const db = this.dbService.getDb();

    const albums = await db
      .select({
        album_id: albumsTable.album_id,
        album_name: albumsTable.album_name,
        artist_id: albumsTable.artist_id,
        cover_url: albumsTable.cover_url,
        album_slug: albumsTable.album_slug,
        year: albumsTable.year,
        artist_name: artistsTable.artist_name,
        spotify_embed: albumsTable.spotify_embed,
      })
      .from(albumsTable)
      .innerJoin(artistsTable, eq(albumsTable.artist_id, artistsTable.artist_id));

    return albums;
  }

  async getById(id: number): Promise<Album | null> {
    const db = this.dbService.getDb();

    const [album] = await db
      .select({
        album_id: albumsTable.album_id,
        album_name: albumsTable.album_name,
        artist_id: albumsTable.artist_id,
        cover_url: albumsTable.cover_url,
        album_slug: albumsTable.album_slug,
        year: albumsTable.year,
        spotify_embed: albumsTable.spotify_embed,
      })
      .from(albumsTable)
      .where(eq(albumsTable.album_id, id));

    return album ?? null;
  }

  async getByName(name: string): Promise<Album | null> {
    const db = this.dbService.getDb();

    const [album] = await db
      .select({
        album_id: albumsTable.album_id,
        album_name: albumsTable.album_name,
        artist_id: albumsTable.artist_id,
        cover_url: albumsTable.cover_url,
        album_slug: albumsTable.album_slug,
        year: albumsTable.year,
        spotify_embed: albumsTable.spotify_embed,
      })
      .from(albumsTable)
      .where(eq(albumsTable.album_name, name));

    return album ?? null;
  }

  async update(id: number, data: Partial<Album>): Promise<Album> {
    const [updatedAlbum] = await this.dbService
      .getDb()
      .update(albumsTable)
      .set(data)
      .where(eq(albumsTable.album_id, id))
      .returning();
    return updatedAlbum;
  }

  async delete(id: number): Promise<void> {
    await this.dbService.getDb().delete(albumsTable).where(eq(albumsTable.album_id, id));
  }

  async assignAlbums(assignments: UserAlbumAssignment[]): Promise<void> {
    await this.dbService.getDb().insert(usersToAlbumsTable).values(assignments);
  }

  async getAlbumWithStats(albumId: number): Promise<any | null> {
    const db = this.dbService.getDb();

    const [albumDetails] = await db
      .select({
        album_id: albumsTable.album_id,
        album_name: albumsTable.album_name,
        artist_id: albumsTable.artist_id,
        cover_url: albumsTable.cover_url,
        album_slug: albumsTable.album_slug,
        year: albumsTable.year,
        artist_name: artistsTable.artist_name,
        artist_slug: artistsTable.artist_slug,
        spotify_embed: albumsTable.spotify_embed,
      })
      .from(albumsTable)
      .innerJoin(artistsTable, eq(albumsTable.artist_id, artistsTable.artist_id))
      .where(eq(albumsTable.album_id, albumId));

    if (!albumDetails) return null;

    const [albumStats] = await db
      .select({
        avgRating: avg(usersToAlbumsTable.rating),
        favoriteCount: count(sql`CASE WHEN ${usersToAlbumsTable.favorite} = true THEN 1 END`),
      })
      .from(usersToAlbumsTable)
      .where(eq(usersToAlbumsTable.album_id, albumId));

    const genres = await db
      .select({
        genre_id: genresTable.id,
        genre_name: genresTable.name,
      })
      .from(albumsToGenresTable)
      .innerJoin(genresTable, eq(albumsToGenresTable.genre_id, genresTable.id))
      .where(eq(albumsToGenresTable.album_id, albumId));

    return {
      ...albumDetails,
      avgRating: albumStats.avgRating ? parseFloat(albumStats.avgRating).toFixed(2) : null,
      favoriteCount: Number(albumStats.favoriteCount) || 0,
      genres,
    };
  }

  async getAllAlbumsWithStats(): Promise<any[]> {
    const db = this.dbService.getDb();

    const albums = await db
      .select({
        album_id: albumsTable.album_id,
        album_name: albumsTable.album_name,
        artist_name: artistsTable.artist_name,
        cover_url: albumsTable.cover_url,
        album_slug: albumsTable.album_slug,
        year: albumsTable.year,
        avgRating: avg(usersToAlbumsTable.rating),
        ratingCount: count(usersToAlbumsTable.rating),
      })
      .from(albumsTable)
      .innerJoin(artistsTable, eq(albumsTable.artist_id, artistsTable.artist_id))
      .leftJoin(usersToAlbumsTable, eq(albumsTable.album_id, usersToAlbumsTable.album_id))
      .groupBy(albumsTable.album_id, artistsTable.artist_name)
      .orderBy(desc(sql`(${avg(usersToAlbumsTable.rating)})`));

    // fetch genres for each album
    const allGenres = await db
      .select({
        album_id: albumsToGenresTable.album_id,
        genre_id: genresTable.id,
        genre_name: genresTable.name,
      })
      .from(albumsToGenresTable)
      .innerJoin(genresTable, eq(albumsToGenresTable.genre_id, genresTable.id));

    return albums.map((album) => ({
      ...album,
      avgRating: album.avgRating ? parseFloat(album.avgRating).toFixed(2) : null,
      ratingCount: Number(album.ratingCount) || 0,
      genres: allGenres
        .filter((g) => g.album_id === album.album_id)
        .map((g) => ({ id: g.genre_id, name: g.genre_name })),
    }));
  }

  async findAlbumByNameAndArtist(albumName: string, artistName: string): Promise<Album | null> {
    const db = this.dbService.getDb();
    const [album] = await db
      .select({
        album_id: albumsTable.album_id,
        album_name: albumsTable.album_name,
        artist_id: albumsTable.artist_id,
        cover_url: albumsTable.cover_url,
        album_slug: albumsTable.album_slug,
        year: albumsTable.year,
        spotify_embed: albumsTable.spotify_embed,
      })
      .from(albumsTable)
      .innerJoin(artistsTable, eq(albumsTable.artist_id, artistsTable.artist_id))
      .where(and(eq(albumsTable.album_name, albumName), eq(artistsTable.artist_name, artistName)));
    return album ?? null;
  }

  async getAlbumReviews(albumId: number): Promise<any[]> {
    const db = this.dbService.getDb();

    const reviews = await db
      .select({
        review_id: usersToAlbumsTable.user_id,
        username: usersTable.username,
        comment: usersToAlbumsTable.review,
        created_at: usersToAlbumsTable.created_at,
      })
      .from(usersToAlbumsTable)
      .innerJoin(usersTable, eq(usersToAlbumsTable.user_id, usersTable.user_id))
      .innerJoin(albumsTable, eq(usersToAlbumsTable.album_id, albumsTable.album_id))
      .where(
        and(
          eq(usersToAlbumsTable.album_id, albumId),
          isNotNull(usersToAlbumsTable.review),
          sql`${usersToAlbumsTable.review} != ''`
        )
      )
      .orderBy(desc(usersToAlbumsTable.created_at));

    return reviews;
  }
}
