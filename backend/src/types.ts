// src/types.ts
// DTO equivalents
import { InferSelectModel } from 'drizzle-orm';
import { usersTable, albumsTable, usersToAlbumsTable, artistsTable, genresTable } from './db/schema';

// User Types
export type User = InferSelectModel<typeof usersTable>;
export type CreateUser = Omit<User, 'user_id'>;

// Album Types
export type Album = InferSelectModel<typeof albumsTable>;
export type CreateAlbum = Omit<Album, 'album_id' | 'album_slug'>;

// User-Album Assignment Type (with rating included in schema)
export type UserAlbumAssignment = InferSelectModel<typeof usersToAlbumsTable>;

// Artist Types
export type Artist = InferSelectModel<typeof artistsTable>;
export type CreateArtist = Omit<Artist, 'artist_id' | 'artist_slug'>;

export type Genre = InferSelectModel<typeof genresTable>;
export type CreateGenre = Omit<Genre, 'id' | 'slug'>;
