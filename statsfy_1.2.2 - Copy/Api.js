import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const spotify_base_url = 'https://api.spotify.com/v1';

const getAccessToken = async () => {
  const token = await AsyncStorage.getItem('token');
  return token;
};

let isSessionExpired = false; // Add a global flag to track session expiration

// Function to fetch top tracks with a given timeframe
export const fetchTopTracks = async (timeRange = 'short_term', navigation) => {
  const token = await getAccessToken();
  const response = await fetch(`${spotify_base_url}/me/top/tracks?time_range=${timeRange}&limit=10`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    await handleSessionExpiration(navigation);
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch top tracks');
  }
  const data = await response.json();
  return data.items;
};

// Function to fetch top artists with a given timeframe
export const fetchTopArtists = async (timeRange = 'short_term', navigation) => {
  const token = await getAccessToken();
  const response = await fetch(`${spotify_base_url}/me/top/artists?time_range=${timeRange}&limit=10`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    await handleSessionExpiration(navigation);
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch top artists');
  }
  const data = await response.json();
  return data.items;
};

// Function to fetch top genres by aggregating the genres from top artists
export const fetchTopGenres = async (timeRange = 'short_term', navigation) => {
  const topArtists = await fetchTopArtists(timeRange, navigation);
  const genres = topArtists.reduce((acc, artist) => {
    artist.genres.forEach(genre => {
      if (!acc[genre]) {
        acc[genre] = 0;
      }
      acc[genre]++;
    });
    return acc;
  }, {});

  const sortedGenres = Object.keys(genres).sort((a, b) => genres[b] - genres[a]);
  return sortedGenres.slice(0, 5);
};

// Function to fetch summary data limited to top 5
export const fetchSummary = async (timeRange = 'short_term', limit = 5, navigation) => {
  const [topTracks, topArtists] = await Promise.all([
    fetchTopTracks(timeRange, navigation),
    fetchTopArtists(timeRange, navigation)
  ]);

  return {
    topTracks: topTracks.slice(0, limit),
    topArtists: topArtists.slice(0, limit)
  };
};

// Fetch track details using fetch API
export const fetchTrackDetails = async (trackId, navigation) => {
  const token = await getAccessToken();
  const response = await fetch(`${spotify_base_url}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    await handleSessionExpiration(navigation);
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch track details');
  }
  return await response.json();
};

// Fetch track audio features using fetch API
export const fetchTrackAudioFeatures = async (trackId, navigation) => {
  const token = await getAccessToken();
  const response = await fetch(`${spotify_base_url}/audio-features/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    await handleSessionExpiration(navigation);
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch track audio features');
  }
  return await response.json();
};

// Function to fetch artist's top tracks
export const fetchArtistTopTracks = async (artistId, navigation) => {
  const token = await getAccessToken();
  const response = await fetch(`${spotify_base_url}/artists/${artistId}/top-tracks?market=US`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    await handleSessionExpiration(navigation);
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch artist top tracks');
  }
  
  const data = await response.json();
  return data.tracks; // Return the tracks array directly
};

const handleSessionExpiration = async (navigation) => {
  if (isSessionExpired) return; // Prevent multiple alerts
  isSessionExpired = true;

  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('expirationDate');
  await AsyncStorage.removeItem('hasSeenSwipeAlert'); // Remove the swipe alert flag


  Alert.alert(
    'Session Expired',
    'Your session has expired. Please sign in again.',
    [
      {
        text: 'OK',
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
          isSessionExpired = false; // Reset flag after handling
        },
      },
    ]
  );
};



/////////////////////////RECOMMENDATION FETCH////////////////////////////////////
// Function to fetch recommendations based on seed tracks, artists, or genres
export const fetchLikedSongs = async (navigation) => {
  const token = await getAccessToken();
  let likedSongs = [];
  let url = `${spotify_base_url}/me/tracks?limit=50`; // Start with a limit of 50

  while (url) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await handleSessionExpiration(navigation);
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch liked songs');
    }

    const data = await response.json();

    // Safely check if data.items exists before mapping
    if (data.items && Array.isArray(data.items)) {
      likedSongs = likedSongs.concat(data.items.map(item => item.track.id));
    }

    url = data.next;
  }

  return likedSongs;
};




export const fetchRecommendations = async (seedTracks = [], seedArtists = [], seedGenres = [], navigation) => {
  const token = await getAccessToken();
  const likedSongs = await fetchLikedSongs(navigation);

  const params = new URLSearchParams({
    seed_tracks: seedTracks.join(','),
    seed_artists: seedArtists.join(','),
    seed_genres: seedGenres.join(','),
    limit: 30,
  });

  const response = await fetch(`${spotify_base_url}/recommendations?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    await handleSessionExpiration(navigation);
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  const data = await response.json();
  const recommendations = data.tracks;

  const filteredRecommendations = recommendations.filter(track => !likedSongs.includes(track.id));

  return filteredRecommendations;
};



/////////////// PUT INTO LIKED SONGS LIBRARY //////////////////
// Function to save a track to the user's liked songs
export const saveTrackToLikedSongs = async (trackId, navigation) => {
  const token = await getAccessToken();
  const response = await fetch(`${spotify_base_url}/me/tracks?ids=${trackId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    await handleSessionExpiration(navigation);
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error('Failed to save track to liked songs');
  }

  return response.ok;
};


// function to fetch recently played songs
export const fetchRecentlyPlayedTracks = async ( limit = 20, navigation) => {
  const token = await getAccessToken();
  const response = await fetch(`${spotify_base_url}/me/player/recently-played?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    await handleSessionExpiration(navigation);
    throw new Error('Session expired. Please log in again');
  }

  if(!response.ok) {
    throw new Error('Failed to fetch recently played tracks');
  }
  const data = await response.json();
  return data.items.map(item => item.track);
};


