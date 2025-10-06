import 'dotenv/config';
import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'path';
import { container } from 'tsyringe';
import { fileURLToPath } from 'url';

import { UserController } from '../controllers/UserController';
import { AlbumController } from '../controllers/AlbumController';
import { ArtistController } from '../controllers/ArtistController';
import { RoleController } from '../controllers/RoleController';
import { GenreController } from '../controllers/GenreController';
import { DatabaseService } from '../services/DatabaseService';
import { UserService } from '../services/UserService';
import { AlbumService } from '../services/AlbumService';
import { ArtistService } from '../services/ArtistService';
import { RoleService } from '../services/RoleService';
import { GenreService } from '../services/GenreService';

import { CreateUser, CreateAlbum, CreateArtist, UserAlbumAssignment, Genre, CreateGenre } from '../types';

// Setup __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Dependency injection
container.registerSingleton(DatabaseService);
container.register(UserService, { useClass: UserService });
container.register(AlbumService, { useClass: AlbumService });
container.register(ArtistService, { useClass: ArtistService });
container.register(RoleService, { useClass: RoleService });
container.register(GenreService, { useClass: GenreService });

interface SeedResult {
    createdUsers: Array<{ user_id: number; username: string; email: string }>;
    createdAlbums: Array<{ album_id: number; album_name: string; artist_id: number }>;
    createdArtists: Array<{ artist_id: number; artist_name: string; artist_slug: string }>;
    createdGenres: Genre[];
}

// Define a type for album seed data that omits artist_id but includes genre_id
type AlbumSeed = Omit<CreateAlbum, 'artist_id'> & { genre_id: number | number[] };

async function createGenreIfNotExists(genreController: GenreController, name: string, description: string, imageUrl: string | null): Promise<Genre> {
    const existingGenre = await genreController.getGenreByName(name);
    if (existingGenre) {
        return existingGenre;
    }

    return genreController.createGenre({ name, description, imageUrl });
}

async function seedDatabase(): Promise<SeedResult> {
    const userController = container.resolve(UserController);
    const albumController = container.resolve(AlbumController);
    const artistController = container.resolve(ArtistController);
    const roleController = container.resolve(RoleController);
    const genreController = container.resolve(GenreController);

    try {
        console.log('--- Genre Setup ---');

        // Create all genres and get their IDs
        const rockGenre = await createGenreIfNotExists(genreController, 'Rock', 'Typically uses a verse-chorus structure with a backbeat rhythm and the electric guitar at the forefront; generally heavier and/or faster than its predecessors.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Rock_music.svg/1200px-Rock_music.svg.png');
        const heavyMetalGenre = await createGenreIfNotExists(genreController, 'Heavy Metal', 'Characterized by a thick, massive sound, highly amplified distortion, and extended guitar solos.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Heavy_metal_music.svg/1200px-Heavy_metal_music.svg.png');
        const psychedelicRockGenre = await createGenreIfNotExists(genreController, 'Psychedelic Rock', 'Rock which emerged in the mid-1960s that often attempts to emulate or enhance the effects of psychedelic drugs.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Psychedelic_rock.svg/1200px-Psychedelic_rock.svg.png');
        const hardRockGenre = await createGenreIfNotExists(genreController, 'Hard Rock', 'Characterized by aggressive vocals, distorted electric guitars, and a strong rhythm section.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Hard_rock_music.svg/1200px-Hard_rock_music.svg.png');
        const jazzGenre = await createGenreIfNotExists(genreController, 'Jazz', 'Characterized by swing and blue notes, call and response vocals, polyrhythms and improvisation.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Jazz_music.svg/1200px-Jazz_music.svg.png');
        
        console.log('Created/found genres:', {
            rock: rockGenre.id,
            heavyMetal: heavyMetalGenre.id,
            psychedelicRock: psychedelicRockGenre.id,
            hardRock: hardRockGenre.id,
            jazz: jazzGenre.id
        });

        // Artists with their images
        const [beatles, rollingStones, doors, ledZeppelin, milesDavis, blackSabbath] = await Promise.all([
            artistController.createArtist({ artist_name: 'The Beatles', image: 'https://static.wikia.nocookie.net/disney/images/9/9a/The_Beatles.jpg/revision/latest?cb=20231219085050' }),
            artistController.createArtist({ artist_name: 'The Rolling Stones', image: 'https://cdn-images.dzcdn.net/images/artist/2ceac184bc846327f60c5b0d4247cc7a/1900x1900-000000-81-0-0.jpg' }),
            artistController.createArtist({ artist_name: 'The Doors', image: 'https://upload.wikimedia.org/wikipedia/commons/6/69/The_Doors_1968.JPG' }),
            artistController.createArtist({ artist_name: 'Led Zeppelin', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Led_Zeppelin_-_promotional_image_%281971%29.jpg/1200px-Led_Zeppelin_-_promotional_image_%281971%29.jpg' }),
            artistController.createArtist({ artist_name: 'Miles Davis', image: 'https://media.npr.org/assets/img/2019/08/21/gettyimages-84843312_wide-dcd53b58c0978aaa8fa8939bd50cca9f462fa922.jpg' }),
            artistController.createArtist({ artist_name: 'Black Sabbath', image: 'https://www.rollingstone.com/wp-content/uploads/2019/09/black-sabbath-box-set-band.jpg?w=1581&h=1054&crop=1' })
        ]);
        const createdArtists = [beatles, rollingStones, doors, ledZeppelin, milesDavis, blackSabbath];
        console.log('Created artists:', createdArtists);


        // Now define album data with actual genre IDs
        const albumData: Record<string, Array<AlbumSeed>> = {
            'The Beatles': [
                {
                    album_name: 'Abbey Road',
                    cover_url: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25',
                    year: 1969,
                    genre_id: rockGenre.id,
                    spotify_embed: '0ETFjACtuP2ADo6LFhL6HN',
                },
            ],
            'The Rolling Stones': [
                {
                    album_name: 'Sticky Fingers',
                    cover_url: 'https://m.media-amazon.com/images/I/616sVyzbOHL._UF1000,1000_QL80_.jpg',
                    year: 1971,
                    genre_id: rockGenre.id,
                    spotify_embed: '29m6DinzdaD0OPqWKGyMdz',
                },
            ],
            'The Doors': [
                {
                    album_name: 'L.A. Woman',
                    cover_url: 'https://portalpopline.com.br/wp-content/uploads/2021/09/the-doors-la-woman-2.jpg',
                    year: 1971,
                    genre_id: psychedelicRockGenre.id,
                    spotify_embed: '7IKUTIc9UWuVngyGPtqNHS',

                },
            ],
            'Led Zeppelin': [
                {
                    album_name: 'Led Zeppelin IV',
                    cover_url: 'https://i.scdn.co/image/ab67616d00001e02cd25ce73e3eddeedb995fcee',
                    year: 1971,
                    genre_id: hardRockGenre.id,
                    spotify_embed: '5EyIDBAqhnlkAHqvPRwdbX',
                },
            ],
            'Miles Davis': [
                {
                    album_name: 'In a Silent Way',
                    cover_url: 'https://e.snmc.io/i/300/w/07455f99c5cfaff9f1ba99a1b4ba5e47/9687885',
                    year: 1969,
                    genre_id: jazzGenre.id,
                    spotify_embed: '0Hs3BomCdwIWRhgT57x22T',
                },
            ],
            'Black Sabbath': [
                {
                    album_name: 'Paranoid',
                    cover_url: 'https://i.scdn.co/image/ab67616d0000b273cfa6ec6d5374ce8aec1a73f5',
                    year: 1970,
                    genre_id: [heavyMetalGenre.id, hardRockGenre.id],
                    spotify_embed: '7LGVdC9fFwgWYaIrZwsSv6',
                },
                {
                    album_name: 'Master of Reality',
                    cover_url: 'https://e.snmc.io/i/600/w/917829d5a491f497ac79f5031d3870eb/2918156/black-sabbath-master-of-reality-Cover-Art.jpg',
                    year: 1971,
                    genre_id: heavyMetalGenre.id,
                    spotify_embed: '24fNwoIq4NLDf4ARJYAFN9',
                },
            ],
        };

        console.log('--- Role Setup ---');
        // Ensure roles exist
        const rolesToInsert = ['admin', 'user'];
        for (const role of rolesToInsert) {
            await roleController.createRole(role);
        }

        // console.log('--- Artist Operations ---');
        // const artistNames = Object.keys(albumData);
        // const createdArtists = await Promise.all(
        //     artistNames.map(name => artistController.createArtist({ artist_name: name }))
        // );
        // console.log('Inserted artists:', createdArtists);

        console.log('--- User Operations ---');
        const usersToCreate: CreateUser[] = [
            { username: 'Admin', password: 'admin123', email: 'admin@example.com', role_name: 'admin' },
            { username: 'JohnDoe', password: 'password1', email: 'john@example.com', role_name: 'user' },
            { username: 'JaneDoe', password: 'password2', email: 'jane@example.com', role_name: 'user' },
            { username: 'Alice', password: 'password3', email: 'alice@example.com', role_name: 'user' },
            { username: 'h1den', password: 'h1den123', email: 'h1den@example.com', role_name: 'user' }
        ];
        const createdUsers = await Promise.all(
            usersToCreate.map(user => userController.createUser(user))
        );
        console.log('Inserted users:', createdUsers);

        console.log('--- Album Operations ---');
        const albumsToCreate: CreateAlbum[] = createdArtists.flatMap(artist => {
            const albums = albumData[artist.artist_name];
            if (!albums) throw new Error(`No album data for artist: ${artist.artist_name}`);
            return albums.map(album => ({
                ...album,
                artist_id: artist.artist_id,
            }));
        });

        const createdAlbums = await Promise.all(
            albumsToCreate.map(album => albumController.createAlbum(album))
        );
        console.log('Inserted albums:', createdAlbums);

        // Assign genres to albums
        for (const createdAlbum of createdAlbums) {
            // Find the corresponding AlbumSeed to get the genre_id
            const artist = createdArtists.find(a => a.artist_id === createdAlbum.artist_id);
            if (!artist) continue;
            const albumSeeds = albumData[artist.artist_name];
            if (!albumSeeds) continue;
            const albumSeed = albumSeeds.find(a => a.album_name === createdAlbum.album_name);
            if (!albumSeed) continue;

            // If genre_id is an array, assign each genre
            if (Array.isArray(albumSeed.genre_id)) {
                for (const genreId of albumSeed.genre_id) {
                    await genreController.assignAlbumToGenre(createdAlbum.album_id, genreId);
                }
            }
            else {
                await genreController.assignAlbumToGenre(createdAlbum.album_id, albumSeed.genre_id);
            }

        }

        return { createdUsers, createdAlbums, createdArtists, createdGenres: [
            rockGenre, heavyMetalGenre, psychedelicRockGenre, hardRockGenre, jazzGenre
        ] };
    } catch (error) {
        console.error('Error in seedDatabase:', error);
        throw error;
    }
}

async function assignSubgenres(
    genreController: GenreController,
    { createdGenres }: { createdGenres: Genre[] }
): Promise<void> {
    try {
        console.log('--- Assigning Subgenres ---');

        const rockGenre = createdGenres.find(g => g.name === 'Rock');
        const heavyMetalGenre = createdGenres.find(g => g.name === 'Heavy Metal');
        const psychedelicRockGenre = createdGenres.find(g => g.name === 'Psychedelic Rock');
        const hardRockGenre = createdGenres.find(g => g.name === 'Hard Rock');
        const jazzGenre = createdGenres.find(g => g.name === 'Jazz');

        if (!rockGenre || !heavyMetalGenre || !psychedelicRockGenre || !hardRockGenre || !jazzGenre) {
            throw new Error('Required genres not found for subgenre assignments');
        }

        // Assign subgenres
        await genreController.assignSubgenre(rockGenre.id, psychedelicRockGenre.id);
        await genreController.assignSubgenre(rockGenre.id, hardRockGenre.id);

        console.log('Subgenres assigned successfully');
    } catch (error) {
        console.error('Error in assignSubgenres:', error);
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
        const janeDoe = createdUsers.find(u => u.username === 'JaneDoe');
        const h1den = createdUsers.find(u => u.username === 'h1den');

        const findAlbum = (name: string) => createdAlbums.find(a => a.album_name === name);

        const abbeyRoad = findAlbum('Abbey Road');
        const paranoid = findAlbum('Paranoid');
        const masterOfReality = findAlbum('Master of Reality');
        const stickyFingers = findAlbum('Sticky Fingers');
        const laWoman = findAlbum('L.A. Woman');
        const inASilentWay = findAlbum('In a Silent Way');

        if (!johnDoe || !janeDoe || !h1den || !abbeyRoad || !paranoid || !stickyFingers || !laWoman || !inASilentWay || !masterOfReality) {
            throw new Error('Required records not found for album assignments');
        }

        const now = new Date();
        const assignments: UserAlbumAssignment[] = [
            { user_id: johnDoe.user_id, album_id: abbeyRoad.album_id, rating: 5, favorite: true, review: 'A masterpiece of rock music.', created_at: now },
            { user_id: johnDoe.user_id, album_id: paranoid.album_id, rating: 5, favorite: true, review: 'RIP Ozzy.', created_at: now },
            { user_id: johnDoe.user_id, album_id: stickyFingers.album_id, rating: 4, favorite: true, review: 'Great album with classic hits.', created_at: now },
            { user_id: johnDoe.user_id, album_id: laWoman.album_id, rating: 4, favorite: false, review: 'Good, but not their best work.', created_at: now },
            { user_id: janeDoe.user_id, album_id: laWoman.album_id, rating: 5, favorite: true, review: 'Absolutely love this album!', created_at: now },
            { user_id: h1den.user_id, album_id: paranoid.album_id, rating: 5, favorite: true, review: 'Absolute masterpiece, RIP OZZY.', created_at: now },
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
        const genreController = container.resolve(GenreController);

        await assignAlbums(userController, albumController, seedResult);
        await performQueries(userController, albumController, seedResult);
        await assignSubgenres(genreController, { createdGenres: seedResult.createdGenres });
    } catch (error) {
        console.error('Error running the script:', error);
    } finally {
        await dbService.close();
    }
}

main().catch(console.error);