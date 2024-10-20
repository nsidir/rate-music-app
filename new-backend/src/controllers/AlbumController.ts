// src/controllers/AlbumController.ts
import { injectable, inject } from "tsyringe";
import { AlbumService } from "../services/AlbumService";
import { Album, CreateAlbum, UserAlbumAssignment } from "../types";

@injectable()
export class AlbumController {
  constructor(@inject(AlbumService) private albumService: AlbumService) {}

  async createAlbum(data: CreateAlbum): Promise<Album> {
    return await this.albumService.create(data);
  }

  async getAllAlbums(): Promise<Album[]> {
    return await this.albumService.getAll();
  }

  async getAlbumById(id: number): Promise<Album | null> {
    return await this.albumService.getById(id);
  }

  async updateAlbum(id: number, data: Partial<Album>): Promise<Album> {
    return await this.albumService.update(id, data);
  }

  async deleteAlbum(id: number): Promise<void> {
    await this.albumService.delete(id);
  }

  async assignAlbums(assignments: UserAlbumAssignment[]): Promise<void> {
    await this.albumService.assignAlbums(assignments);
  }
}