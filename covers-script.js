async function searchAlbumCover(albumName, artistName) {
    try {
        console.log("Step 1: Searching for the album in MusicBrainz...");

        // Step 1: Search for the album in MusicBrainz
        const musicbrainzUrl = "https://musicbrainz.org/ws/2/release/";
        const params = new URLSearchParams({
            query: `release:${albumName} AND artist:${artistName}`,
            fmt: "json",
            limit: 1
        });

        const musicbrainzResponse = await fetch(`${musicbrainzUrl}?${params.toString()}`, {
            headers: {
                "User-Agent": "MyMusicApp/1.0" // Add a User-Agent header
            }
        });
        console.log("MusicBrainz Response Status:", musicbrainzResponse.status);

        if (musicbrainzResponse.status !== 200) {
            console.log("Error fetching album data:", musicbrainzResponse.status);
            return null;
        }

        const musicbrainzData = await musicbrainzResponse.json();
        // console.log("MusicBrainz Data:", JSON.stringify(musicbrainzData, null, 2));

        if (!musicbrainzData.releases || musicbrainzData.releases.length === 0) {
            console.log("No album found.");
            return null;
        }

        // Get the MusicBrainz Release ID (MBID)
        const mbid = musicbrainzData.releases[0].id;
        console.log(`Found Album: ${musicbrainzData.releases[0].title} (MBID: ${mbid})`);

        // Step 2: Fetch the cover art from Cover Art Archive
        console.log("\nStep 2: Fetching cover art from Cover Art Archive...");
        const coverArtUrl = `https://coverartarchive.org/release/${mbid}`;

        const coverArtResponse = await fetch(coverArtUrl);
        // console.log("Cover Art Archive Response Status:", coverArtResponse.status);

        if (coverArtResponse.status === 200) {
            try {
                const coverArtData = await coverArtResponse.json();
                // console.log("Cover Art Data:", JSON.stringify(coverArtData, null, 2));

                if (coverArtData.images && coverArtData.images.length > 0) {
                    const frontCoverUrl = coverArtData.images[0].image;
                    // console.log("Front Cover URL:", frontCoverUrl);
                    return frontCoverUrl;
                } else {
                    console.log("No cover art images found.");
                }
            } catch (error) {
                console.log("Error parsing cover art data:", error.message);
            }
        } else if (coverArtResponse.status === 404) {
            console.log("Cover art not found.");
        } else {
            console.log("Error fetching cover art:", coverArtResponse.status);
        }
    } catch (error) {
        console.log("Error fetching album data:", error.message);
    }
    return null;
}

// Example usage
const albumName = "King of Limbs";
const artistName = "Radiohead";

searchAlbumCover(albumName, artistName)
    .then((coverUrl) => {
        if (coverUrl) {
            console.log("\nFinal Result: Cover art found at", coverUrl);
        } else {
            console.log("\nFinal Result: No cover art found.");
        }
    });