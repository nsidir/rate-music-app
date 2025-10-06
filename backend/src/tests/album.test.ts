import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import { container } from 'tsyringe';

// Import Controllers and Services
import { AlbumController } from '../controllers/AlbumController';
import { DatabaseService } from '../services/DatabaseService';
import { AlbumService } from '../services/AlbumService';
import { ArtistService } from '../services/ArtistService';

// Import schema for setup/teardown
import { albumsTable, artistsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

// --- Test Setup ---
const app: Express = express();
app.use(express.json());

// Dependency Injection setup for the test environment
container.registerSingleton(DatabaseService);
container.register(ArtistService, { useClass: ArtistService });
container.register(AlbumService, { useClass: AlbumService });
container.register(AlbumController, { useClass: AlbumController });

// Resolve controllers from the container
const albumController = container.resolve(AlbumController);

// Define routes for the test app
app.get('/api/albums', (req, res, next) => {
  albumController
    .getAllAlbums()
    .then((albums) => res.json(albums))
    .catch(next);
});

// --- Test Suite ---
describe('Album API', () => {
    let dbService: DatabaseService;
    let testArtistId: number;
    let testAlbumId: number;

    beforeAll(async () => {
        dbService = container.resolve(DatabaseService);
        const db = dbService.getDb();

        // 1. Create a dummy artist for the test
        const [artist] = await db.insert(artistsTable).values({
            artist_name: 'Test Artist',
            image: 'http://example.com/artist.jpg',
            artist_slug: 'test-artist'
        }).returning();
        testArtistId = artist.artist_id;

        // 2. Create a dummy album linked to the artist
        const [album] = await db.insert(albumsTable).values({
            album_name: 'Test Album',
            artist_id: testArtistId,
            cover_url: 'http://example.com/cover.jpg',
            year: 2023,
            album_slug: 'test-album',
            spotify_embed: 'http://spotify.com/embed/test'

        }).returning();
        testAlbumId = album.album_id;
    });

    afterAll(async () => {
        const db = dbService.getDb();
        // Clean up the dummy data in reverse order of creation
        await db.delete(albumsTable).where(eq(albumsTable.album_id, testAlbumId));
        await db.delete(artistsTable).where(eq(artistsTable.artist_id, testArtistId));
        await dbService.close();
    });

    it('should fetch all albums with their artist names', async () => {
        const response = await request(app).get('/api/albums');

        // Assertions
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        
        // Find the test album in the response
        const testAlbum = response.body.find((a: { album_id: number; album_name: string; artist_name: string }) => a.album_id === testAlbumId);
        
        expect(testAlbum).toBeDefined();
        expect(testAlbum.album_name).toBe('Test Album');
        expect(testAlbum.artist_name).toBe('Test Artist');
    });
});
