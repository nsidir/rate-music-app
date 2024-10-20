// src/db/schema.ts
import { integer, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const usersTable = pgTable("users", {
  user_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

// Albums table
export const albumsTable = pgTable("albums", {
  album_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  album_name: varchar({ length: 255 }).notNull(),
  artist_name: varchar({ length: 255 }).notNull(),
});

// Junction table to represent the many-to-many relationship between users and albums
export const usersToAlbumsTable = pgTable(
  "users_to_albums",
  {
    user_id: integer("user_id")
      .notNull()
      .references(() => usersTable.user_id),
    album_id: integer("album_id")
      .notNull()
      .references(() => albumsTable.album_id),
  },
  (t) => ({
    pk: primaryKey(t.user_id, t.album_id), // Composite primary key
  })
);

// Relations for users
export const usersRelations = relations(usersTable, ({ many }) => ({
  usersToAlbums: many(usersToAlbumsTable),
}));

// Relations for albums
export const albumsRelations = relations(albumsTable, ({ many }) => ({
  usersToAlbums: many(usersToAlbumsTable),
}));

// Relations for usersToAlbums junction table
export const usersToAlbumsRelations = relations(usersToAlbumsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [usersToAlbumsTable.user_id],
    references: [usersTable.user_id],
  }),
  album: one(albumsTable, {
    fields: [usersToAlbumsTable.album_id],
    references: [albumsTable.album_id],
  }),
}));
