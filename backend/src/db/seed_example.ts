import 'dotenv/config';
import "reflect-metadata";
import dotenv from 'dotenv';
import path from 'path';

import { container } from "tsyringe";
import { UserController } from "../controllers/UserController";
import { AlbumController } from "../controllers/AlbumController";
import { ArtistController } from "../controllers/ArtistController";
import { DatabaseService } from "../services/DatabaseService";
import { UserService } from "../services/UserService";
import { AlbumService } from "../services/AlbumService";
import { ArtistService } from "../services/ArtistService";
import { CreateUser, CreateAlbum, CreateArtist, UserAlbumAssignment } from "../types";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Register services
container.registerSingleton(DatabaseService);
container.register(UserService, { useClass: UserService });
container.register(AlbumService, { useClass: AlbumService });
container.register(ArtistService, { useClass: ArtistService });

interface SeedResult {
    createdUsers: Array<{ user_id: number; username: string; email: string }>;
    createdAlbums: Array<{ album_id: number; album_name: string; artist_id: number }>;
    createdArtists: Array<{ artist_id: number; artist_name: string }>;
}

async function seedDatabase(): Promise<SeedResult> {
    const userController = container.resolve(UserController);
    const albumController = container.resolve(AlbumController);
    const artistController = container.resolve(ArtistController);

    try {
        console.log('--- Artist Operations ---');
        const artistsToCreate: CreateArtist[] = [
            { artist_name: 'The Beatles' },
            { artist_name: 'The Rolling Stones' },
            { artist_name: 'The Doors' },
            { artist_name: 'Led Zeppelin' },
            { artist_name: 'Black Sabbath' }
        ];
        const createdArtists = await Promise.all(
            artistsToCreate.map(artist => artistController.createArtist(artist))
        );
        console.log('Inserted artists:', createdArtists);

        console.log('--- User Operations ---');
        const usersToCreate: CreateUser[] = [
            { username: 'JohnDoe', password: 'password1', email: 'john@example.com' },
            { username: 'JaneDoe', password: 'password2', email: 'jane@example.com' },
            { username: 'Alice', password: 'password3', email: 'alice@example.com' }
        ];
        const createdUsers = await Promise.all(
            usersToCreate.map(user => userController.createUser(user))
        );
        console.log('Inserted users:', createdUsers);

        console.log('--- Album Operations ---');
        const albumsToCreate: CreateAlbum[] = createdArtists.map(artist => {
            switch (artist.artist_name) {
                case 'The Beatles':
                    return { album_name: 'Abbey Road', artist_id: artist.artist_id, cover_url: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25' };
                case 'The Rolling Stones':
                    return { album_name: 'Sticky Fingers', artist_id: artist.artist_id, cover_url: 'https://m.media-amazon.com/images/I/616sVyzbOHL._UF1000,1000_QL80_.jpg' };
                case 'The Doors':
                    return { album_name: 'L.A. Woman', artist_id: artist.artist_id, cover_url: 'https://portalpopline.com.br/wp-content/uploads/2021/09/the-doors-la-woman-2.jpg' };
                case 'Led Zeppelin':
                    return { album_name: 'Led Zeppelin IV', artist_id: artist.artist_id, cover_url: 'https://i.scdn.co/image/ab67616d00001e02cd25ce73e3eddeedb995fcee' };
                case 'Black Sabbath':
                    return { album_name: 'Paranoid', artist_id: artist.artist_id, cover_url: 'https://i.scdn.co/image/ab67616d0000b273cfa6ec6d5374ce8aec1a73f5' };
                default:
                    throw new Error(`Unexpected artist: ${artist.artist_name}`);
            }
        });

        const createdAlbums = await Promise.all(
            albumsToCreate.map(album => albumController.createAlbum(album))
        );
        console.log('Inserted albums:', createdAlbums);

        return { createdUsers, createdAlbums, createdArtists };
    } catch (error) {
        console.error('Error in seedDatabase:', error);
        throw error;
    }
}

async function assignAlbums(
    userController: UserController,
    albumController: AlbumController,
    { createdUsers, createdAlbums }: SeedResult
): Promise<void> {
    try {
        const johnDoe = createdUsers.find(u => u.username === 'JohnDoe');
        const laWoman = createdAlbums.find(a => a.album_name === 'L.A. Woman');
        const abbeyRoad = createdAlbums.find(a => a.album_name === 'Abbey Road');
        const stickyFingers = createdAlbums.find(a => a.album_name === 'Sticky Fingers');
        const janeDoe = createdUsers.find(u => u.username === 'JaneDoe');

        if (!johnDoe || !laWoman || !abbeyRoad || !stickyFingers || !janeDoe) {
            throw new Error('Required records not found for album assignments');
        }

        const now = new Date();
        const assignments: UserAlbumAssignment[] = [
            { user_id: johnDoe.user_id, album_id: abbeyRoad.album_id, rating: 5, favorite: true, review: 'A masterpiece of rock music.', created_at: now },
            { user_id: johnDoe.user_id, album_id: stickyFingers.album_id, rating: 4, favorite: true, review: 'Great album with classic hits.', created_at: now },
            { user_id: johnDoe.user_id, album_id: laWoman.album_id, rating: 3, favorite: false, review: 'Good, but not their best work.', created_at: now },
            { user_id: janeDoe.user_id, album_id: laWoman.album_id, rating: 5, favorite: true, review: 'Absolutely love this album!', created_at: now }
        ];

        await albumController.assignAlbums(assignments);
        console.log('Album assignments completed successfully');
    } catch (error) {
        console.error('Error in assignAlbums:', error);
        throw error;
    }
}

async function performQueries(
    userController: UserController,
    albumController: AlbumController,
    { createdUsers, createdAlbums, createdArtists }: SeedResult
): Promise<void> {
    try {
        console.log('--- Performing Queries ---');
        
        const allUsers = await userController.getAllUsers();
        console.log('All users:', allUsers);

        const allAlbums = await albumController.getAllAlbums();
        console.log('All albums:', allAlbums);

        const janeDoe = createdUsers.find(u => u.username === 'JaneDoe');
        if (janeDoe) {
            const janeDetails = await userController.getUserById(janeDoe.user_id);
            console.log('JaneDoe details:', janeDetails);
        }

        const stickyFingers = createdAlbums.find(a => a.album_name === 'Sticky Fingers');
        if (stickyFingers) {
            const albumDetails = await albumController.getAlbumById(stickyFingers.album_id);
            console.log('Sticky Fingers details:', albumDetails);
        }

        const alice = createdUsers.find(u => u.username === 'Alice');
        if (alice) {
            const updatedAlice = await userController.updateUser(alice.user_id, {
                email: 'newalice@example.com'
            });
            console.log('Updated user Alice:', updatedAlice);
        }

        const abbeyRoad = createdAlbums.find(a => a.album_name === 'Abbey Road');
        const beatles = createdArtists.find(a => a.artist_name === 'The Beatles');
        if (abbeyRoad && beatles) {
            const updatedAlbum = await albumController.updateAlbum(abbeyRoad.album_id, {
                artist_id: beatles.artist_id
            });
            console.log('Updated album Abbey Road:', updatedAlbum);
        }
    } catch (error) {
        console.error('Error in performQueries:', error);
        throw error;
    }
}

async function main() {
    const dbService = container.resolve(DatabaseService);
    
    try {
        const seedResult = await seedDatabase();
        const userController = container.resolve(UserController);
        const albumController = container.resolve(AlbumController);

        await assignAlbums(userController, albumController, seedResult);
        await performQueries(userController, albumController, seedResult);

    } catch (error) {
        console.error('Error running the script:', error);
    } finally {
        await dbService.close();
    }
}

main().catch(console.error);