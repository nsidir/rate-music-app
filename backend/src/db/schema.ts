import { sql } from "drizzle-orm";
import { integer, pgTable, primaryKey, varchar, check, boolean, timestamp, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Roles table
export const rolesTable = pgTable("roles", {
  role_name: varchar({ length: 50 }).primaryKey().notNull(),
});

// Users table
export const usersTable = pgTable("users", {
  user_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role_name: varchar({ length: 50 }).notNull().references(() => rolesTable.role_name, { onDelete: "cascade" }),
});

// Artists table
export const artistsTable = pgTable("artists", {
  artist_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  artist_name: varchar({ length: 255 }).notNull().unique(),
  artist_slug: varchar({length: 255}).notNull().unique(),
  image: varchar({ length: 255 })
});

// Albums table
export const albumsTable = pgTable(
  "albums",
  {
    album_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    album_name: varchar({ length: 255 }).notNull(),
    artist_id: integer("artist_id")
      .notNull()
      .references(() => artistsTable.artist_id),
    cover_url: varchar({ length: 255 }).notNull(),
    album_slug: varchar({ length: 255 }).notNull().unique(),
    year: integer("year").notNull(),
    spotify_embed: varchar({ length: 255 }).unique(),
},
  (table) => ({
    yearCheck: check(
      "year_check",
      sql`${table.year} >= 1890 AND ${table.year} <= ${new Date().getFullYear()}`
    ),
  })
);

// Junction table with rating and check constraint
export const usersToAlbumsTable = pgTable(
  "users_to_albums",
  {
    user_id: integer("user_id")
      .notNull()
      .references(() => usersTable.user_id, { onDelete: "cascade" }),
    album_id: integer("album_id")
      .notNull()
      .references(() => albumsTable.album_id, { onDelete: "cascade" }),
    rating: integer("rating"),
    favorite: boolean("favorite").notNull().default(false),
    review: varchar({ length: 2000 }).default(''),
    created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.album_id] }),
    ratingCheck: check("rating_check", sql`${table.rating} >= 1 AND ${table.rating} <= 5`), // Check constraint for rating between 1 and 5
  })
);

// Genres table
export const genresTable = pgTable('genres', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('genre_name', { length: 255 }).notNull(),
  slug: varchar('genre_slug', { length: 255 }).notNull().unique(),
  description: varchar('description').notNull(),
  imageUrl: varchar('cover_url', { length: 500 }),
})

export const albumsToGenresTable = pgTable(
  'albums_to_genres',
  {
    album_id: integer('album_id')
      .notNull()
      .references(() => albumsTable.album_id, { onDelete: "cascade" }),
    genre_id: integer('genre_id')
      .notNull()
      .references(() => genresTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.album_id, table.genre_id] }),
  })
);

export const genresToSubgenresTable = pgTable(
  'genres_to_subgenres',
  {
    genre_id: integer('genre_id')
      .notNull()
      .references(() => genresTable.id, { onDelete: "cascade" }),
    subgenre_id: integer('subgenre_id')
      .notNull()
      .references(() => genresTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.genre_id, table.subgenre_id] }),
  })
);

export const genresRelations = relations(genresTable, ({ many }) => ({
  subgenres: many(genresToSubgenresTable, {
    relationName: "subgenres",
  }),
  albumsToGenres: many(albumsToGenresTable),
}));

export const albumsToGenresRelations = relations(albumsToGenresTable, ({ one }) => ({
  album: one(albumsTable, {
    fields: [albumsToGenresTable.album_id],
    references: [albumsTable.album_id],
  }),
  genre: one(genresTable, {
    fields: [albumsToGenresTable.genre_id],
    references: [genresTable.id],
  }),
}));

// Relations for roles
export const rolesRelations = relations(rolesTable, ({ many }) => ({
  users: many(usersTable),
}));

// Relations for users
export const usersRelations = relations(usersTable, ({ many }) => ({
  usersToAlbums: many(usersToAlbumsTable),
}));

// Relations for artists
export const artistsRelations = relations(artistsTable, ({ many }) => ({
  albums: many(albumsTable),
}));

// Relations for albums
export const albumsRelations = relations(albumsTable, ({ many, one }) => ({
  usersToAlbums: many(usersToAlbumsTable),
  artist: one(artistsTable, {
    fields: [albumsTable.artist_id],
    references: [artistsTable.artist_id],
  }),
  albumsToGenres: many(albumsToGenresTable),
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
