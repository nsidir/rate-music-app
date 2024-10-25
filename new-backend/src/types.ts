// src/types.ts
import { InferSelectModel } from 'drizzle-orm';
import { usersTable, albumsTable, usersToAlbumsTable, artistsTable } from './db/schema';

// User Types
export type User = InferSelectModel<typeof usersTable>;
export type CreateUser = Omit<User, 'user_id'>;

// Album Types
export type Album = InferSelectModel<typeof albumsTable>;
export type CreateAlbum = Omit<Album, 'album_id'>;

// User-Album Assignment Type (with rating included in schema)
export type UserAlbumAssignment = InferSelectModel<typeof usersToAlbumsTable>;

// Artist Types
export type Artist = InferSelectModel<typeof artistsTable>;
export type CreateArtist = Omit<Artist, 'artist_id'>;
