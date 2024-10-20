// src/db/index.ts
import 'dotenv/config';
import "reflect-metadata"
import { container } from "tsyringe";
import { UserController } from "../controllers/UserController";
import { AlbumController } from "../controllers/AlbumController";
import { DatabaseService } from "../services/DatabaseService";
import { UserService } from "../services/UserService";
import { AlbumService } from "../services/AlbumService";
import { CreateUser, CreateAlbum, UserAlbumAssignment } from "../types";

// Register services
container.registerSingleton(DatabaseService);
container.register(UserService, {useClass: UserService});
container.register(AlbumService, {useClass: AlbumService});

async function seedDatabase() {
    const userController = container.resolve(UserController);
    const albumController = container.resolve(AlbumController);

    console.log('--- User Operations ---');
    const usersToCreate: CreateUser[] = [
        { username: 'JohnDoe', password: 'password1', email: 'john@example.com' },
        { username: 'JaneDoe', password: 'password2', email: 'jane@example.com' },
        { username: 'Alice', password: 'password3', email: 'alice@example.com' }
    ];
    const createdUsers = await Promise.all(usersToCreate.map(user => userController.createUser(user)));
    console.log('Inserted users:', createdUsers);

    console.log('--- Album Operations ---');
    const albumsToCreate: CreateAlbum[] = [
        { album_name: 'Abbey Road', artist_name: 'The Beatles' },
        { album_name: 'Sticky Fingers', artist_name: 'The Rolling Stones' },
        { album_name: 'L.A. Woman', artist_name: 'The Doors' },
        { album_name: 'Led Zeppelin IV', artist_name: 'Led Zeppelin' },
        { album_name: 'Paranoid', artist_name: 'Black Sabbath' },
    ];
    const createdAlbums = await Promise.all(albumsToCreate.map(album => albumController.createAlbum(album)));
    console.log('Inserted albums:', createdAlbums);

    return { createdUsers, createdAlbums };
}

async function assignAlbums(userController: UserController, albumController: AlbumController, createdUsers: any[], createdAlbums: any[]) {
    const johnDoe = createdUsers.find(u => u.username === 'JohnDoe')!;
    const johnsAlbums: UserAlbumAssignment[] = [
        { user_id: johnDoe.user_id, album_id: createdAlbums[0].album_id },
        { user_id: johnDoe.user_id, album_id: createdAlbums[1].album_id }
    ];
    await albumController.assignAlbums(johnsAlbums);
    console.log('JohnDoe associated with multiple albums.');

    const sharedAlbum = createdAlbums.find(a => a.album_name === 'L.A. Woman')!;
    const sharedAlbumAssignments: UserAlbumAssignment[] = [
        { user_id: johnDoe.user_id, album_id: sharedAlbum.album_id },
        { user_id: createdUsers.find(u => u.username === 'JaneDoe')!.user_id, album_id: sharedAlbum.album_id }
    ];
    await albumController.assignAlbums(sharedAlbumAssignments);
    console.log('L.A. Woman assigned to multiple users.');
}

async function performQueries(userController: UserController, albumController: AlbumController, createdUsers: any[], createdAlbums: any[]) {
    console.log('All users:', await userController.getAllUsers());
    console.log('All albums:', await albumController.getAllAlbums());

    const janeDoe = createdUsers.find(u => u.username === 'JaneDoe');
    if (janeDoe) {
        console.log('JaneDoe details:', await userController.getUserById(janeDoe.user_id));
    }

    const stickyFingers = createdAlbums.find(a => a.album_name === 'Sticky Fingers');
    if (stickyFingers) {
        console.log('Sticky Fingers details:', await albumController.getAlbumById(stickyFingers.album_id));
    }

    const alice = createdUsers.find(u => u.username === 'Alice');
    if (alice) {
        console.log('Updated user Alice:', await userController.updateUser(alice.user_id, { email: 'newalice@example.com' }));
    }

    const abbeyRoad = createdAlbums.find(a => a.album_name === 'Abbey Road');
    if (abbeyRoad) {
        console.log('Updated album Abbey Road:', await albumController.updateAlbum(abbeyRoad.album_id, { artist_name: 'The Beatles' }));
    }
}

async function main() {
    const dbService = container.resolve(DatabaseService);
    
    try {
        const { createdUsers, createdAlbums } = await seedDatabase();
        const userController = container.resolve(UserController);
        const albumController = container.resolve(AlbumController);

        await assignAlbums(userController, albumController, createdUsers, createdAlbums);
        await performQueries(userController, albumController, createdUsers, createdAlbums);

    } catch (error) {
        console.error('Error running the script:', error);
    } finally {
        await dbService.close();
    }
}

main().catch(console.error);