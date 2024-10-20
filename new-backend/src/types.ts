// src/types.ts
import { InferSelectModel } from 'drizzle-orm';
import { usersTable, albumsTable, usersToAlbumsTable } from './db/schema';

export type User = InferSelectModel<typeof usersTable>;
export type CreateUser = Omit<User, 'user_id'>;

export type Album = InferSelectModel<typeof albumsTable>;
export type CreateAlbum = Omit<Album, 'album_id'>;

export type UserAlbumAssignment = InferSelectModel<typeof usersToAlbumsTable>;