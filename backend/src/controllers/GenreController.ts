import { injectable, inject } from "tsyringe";
import { GenreService } from "../services/GenreService";
import { Genre, CreateGenre } from "../types";

@injectable()
export class GenreController {
  constructor(@inject(GenreService) private genreService: GenreService) {}

  async createGenre(data: CreateGenre): Promise<Genre> {
    return await this.genreService.create(data);
  }

  async getAllGenres(): Promise<Genre[]> {
    return await this.genreService.getAll();
  }

  async getGenreById(id: number): Promise<Genre | null> {
    return await this.genreService.getById(id);
  }

async getGenreByName(name: string): Promise<Genre | null> {
    return await this.genreService.getByName(name);
}

  async updateGenre(id: number, data: Partial<Genre>): Promise<Genre> {
    return await this.genreService.update(id, data);
  }

  async deleteGenre(id: number): Promise<void> {
    await this.genreService.delete(id);
  }

  async assignSubgenre(parentId: number, childId: number): Promise<void> {
    await this.genreService.assignSubgenre(parentId, childId);
  }
}