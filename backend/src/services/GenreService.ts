import { injectable, inject } from "tsyringe";
import { genresTable, genresToSubgenresTable } from "../db/schema";
import { DatabaseService } from "./DatabaseService";
import { eq } from "drizzle-orm";
import { Genre, CreateGenre } from "src/types";
import { IEntityService } from "src/interfaces/IEntityService";
import { toSlug } from "src/utility/toSlug";

@injectable()
export class GenreService implements IEntityService<Genre, CreateGenre> {
  constructor(@inject(DatabaseService) private dbService: DatabaseService) {}

  async create(data: CreateGenre): Promise<Genre> {
    const slug = toSlug(data.name);
    const [insertedGenre] = await this.dbService.getDb().insert(genresTable).values({ ...data, slug }).returning();
    return insertedGenre;
  }

  async getAll(): Promise<Genre[]> {
    return await this.dbService.getDb().select().from(genresTable);
  }

  async getById(id: number): Promise<Genre | null> {
    const [genre] = await this.dbService.getDb().select().from(genresTable).where(eq(genresTable.id, id));
    return genre ?? null;
  }

  async getByName(name: string): Promise<Genre | null> {
    const [genre] = await this.dbService.getDb().select().from(genresTable
    ).where(eq(genresTable.name, name));
    return genre ?? null;
  }

  async update(id: number, data: Partial<Genre>): Promise<Genre> {
    const [updatedGenre] = await this.dbService.getDb().update(genresTable).set(data).where(eq(genresTable.id, id)).returning();
    return updatedGenre;
  }

  async delete(id: number): Promise<void> {
    await this.dbService.getDb().delete(genresTable).where(eq(genresTable.id, id));
  }

  async assignSubgenre(parentId: number, childId: number): Promise<void> {
    await this.dbService.getDb().insert(genresToSubgenresTable).values({ genre_id: parentId, subgenre_id: childId });
  }
}