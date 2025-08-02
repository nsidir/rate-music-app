// src/controllers/ArtistController.ts
import { injectable, inject } from "tsyringe";
import { ArtistService } from "../services/ArtistService";
import { Artist, CreateArtist } from "../types";





@injectable()
export class ArtistController {
  constructor(@inject(ArtistService) private artistService: ArtistService) {}

  async createArtist(data: CreateArtist): Promise<Artist> {
    return await this.artistService.create(data);
  }

  async getAllArtists(): Promise<Artist[]> {
    return await this.artistService.getAll();
  }

  async artistExists(artistName: string): Promise<boolean> {
    return await this.artistService.exists(artistName);
  }

  async getArtistById(id: number): Promise<Artist | null> {
    return await this.artistService.getById(id);
  }

  async updateArtist(id: number, data: Partial<Artist>): Promise<Artist> {
    return await this.artistService.update(id, data);
  }

  async deleteArtist(id: number): Promise<void> {
    await this.artistService.delete(id);
  }

  async getArtistBySlug(slug: string): Promise<Artist | null> {
    return await this.artistService.getBySlug(slug); 
  }

  
}


