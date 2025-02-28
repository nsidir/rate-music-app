// src/services/MusicBrainzService.ts
export async function searchAlbumCover(albumName: string, artistName: string): Promise<string | null> {
    try {
      console.log("Step 1: Searching for the album in MusicBrainz...");
  
      const musicbrainzUrl = "https://musicbrainz.org/ws/2/release/";
      const params = new URLSearchParams({
        query: `release:${albumName} AND artist:${artistName}`,
        fmt: "json",
        limit: "1"
      });
  
      const musicbrainzResponse = await fetch(`${musicbrainzUrl}?${params.toString()}`, {
        headers: {
          "User-Agent": "MyMusicApp/1.0"
        }
      });
  
      console.log("MusicBrainz Response Status:", musicbrainzResponse.status);
  
      if (musicbrainzResponse.status !== 200) {
        console.log("Error fetching album data:", musicbrainzResponse.status);
        return null;
      }
  
      const musicbrainzData = await musicbrainzResponse.json();
  
      if (!musicbrainzData.releases || musicbrainzData.releases.length === 0) {
        console.log("No album found.");
        return null;
      }
  
      // Get the MusicBrainz Release ID (MBID)
      const mbid = musicbrainzData.releases[0].id;
      console.log(`Found Album: ${musicbrainzData.releases[0].title} (MBID: ${mbid})`);
  
      console.log("\nStep 2: Fetching cover art from Cover Art Archive...");
      const coverArtUrl = `https://coverartarchive.org/release/${mbid}`;
  
      const coverArtResponse = await fetch(coverArtUrl);
  
      if (coverArtResponse.status === 200) {
        try {
          const coverArtData = await coverArtResponse.json();
          if (coverArtData.images && coverArtData.images.length > 0) {
            const frontCoverUrl = coverArtData.images[0].image;
            return frontCoverUrl;
          } else {
            console.log("No cover art images found.");
          }
        } catch (error: any) {
          console.log("Error parsing cover art data:", error.message);
        }
      } else if (coverArtResponse.status === 404) {
        console.log("Cover art not found.");
      } else {
        console.log("Error fetching cover art:", coverArtResponse.status);
      }
    } catch (error: any) {
      console.log("Error fetching album data:", error.message);
    }
    return null;
  }
  