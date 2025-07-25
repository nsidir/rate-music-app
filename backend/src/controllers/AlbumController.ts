// src/controllers/AlbumController.ts
import { injectable, inject } from "tsyringe";
import { AlbumService } from "../services/AlbumService";
import { Album, CreateAlbum, UserAlbumAssignment } from "../types";
import { NextFunction, Request, Response } from "express";

@injectable()
export class AlbumController {
  constructor(@inject(AlbumService) private albumService: AlbumService) {}

  async createAlbum(data: CreateAlbum): Promise<Album> {
    return await this.albumService.create(data);
  }

  async getAllAlbums(): Promise<Album[]> {
    return await this.albumService.getAll();
  }

  async getAllAlbumsWithStats(): Promise<any[]> {
    return await this.albumService.getAllAlbumsWithStats();
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
  
  async getAlbumWithStats(albumId: number): Promise<any | null> {
    return await this.albumService.getAlbumWithStats(albumId);
  }

  async getAlbumReviews(albumId: number) {
    return await this.albumService.getAlbumReviews(albumId);
  }

  async searchAlbum(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { keyword } = req.query;
      if (typeof keyword !== 'string') {
        res.status(400).json({ error: 'keyword query parameter is required' });
        return;
      }
      const albums = await this.albumService.searchAlbumsInfo(keyword);
      if (albums.length > 0) {
        res.json(albums);
      } else {
        res.status(404).json({ error: 'No albums found' });
      }
    } catch (error) {
      next(error);
    }
  }
  

}