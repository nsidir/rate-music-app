// src/services/ArtistService.ts
import { injectable, inject } from "tsyringe";
import { IEntityService } from "../interfaces/IEntityService";
import { Artist, CreateArtist } from "../types";
import { artistsTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { DatabaseService } from "./DatabaseService";
import { albumsTable } from "../db/schema";

@injectable()
export class ArtistService implements IEntityService<Artist, CreateArtist> {
 
  constructor(@inject(DatabaseService) private dbService: DatabaseService) {}

  async create(data: CreateArtist): Promise<Artist> {
    const [insertedArtist] = await this.dbService.getDb().insert(artistsTable).values(data).returning();
    return insertedArtist;
  }

  async getAll(): Promise<Artist[]> {
    return await this.dbService.getDb().select().from(artistsTable);
  }

  async getById(id: number): Promise<Artist | null> {
    const [artist] = await this.dbService.getDb().select().from(artistsTable).where(eq(artistsTable.artist_id, id));
    return artist ?? null;
  }

  async update(id: number, data: Partial<Artist>): Promise<Artist> {
    const [updatedArtist] = await this.dbService.getDb().update(artistsTable).set(data).where(eq(artistsTable.artist_id, id)).returning();
    return updatedArtist;
  }

  async delete(id: number): Promise<void> {
    await this.dbService.getDb().delete(artistsTable).where(eq(artistsTable.artist_id, id));
  }

  async getBySlug(slug: string): Promise<Artist & { albums: any[] } | null> {
  const db = this.dbService.getDb();

  const [artist] = await db
    .select()
    .from(artistsTable)
    .where(eq(artistsTable.artist_slug, slug));

  if (!artist) return null;

  const albums = await db
    .select()
    .from(albumsTable)
    .where(eq(albumsTable.artist_id, artist.artist_id));

  return { ...artist, albums };
}


}

