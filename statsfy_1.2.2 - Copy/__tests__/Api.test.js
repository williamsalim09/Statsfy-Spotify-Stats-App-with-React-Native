// import some stuff
import {
    fetchTopTracks,
    fetchTopArtists,
    saveTrackToLikedSongs,
  } from '../Api'; 
  import fetchMock from 'jest-fetch-mock';
  
  jest.mock('@react-native-async-storage/async-storage', () => {
    return {
      getItem: jest.fn(() => Promise.resolve('mocked_token')),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
  });
  
  describe('API calls', () => {
    beforeEach(() => {
      fetchMock.resetMocks(); // Reset fetch mocks before each test
    });
  
    it('fetchTopTracks should return top tracks on success', async () => {
      const mockTracks = [{ id: 'track1', name: 'Track 1' }, { id: 'track2', name: 'Track 2' }];
      
      fetchMock.mockResponseOnce(JSON.stringify({ items: mockTracks }));
  
      const tracks = await fetchTopTracks('short_term', null); // You can pass a mock navigation object if needed
  
      expect(tracks).toEqual(mockTracks);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10',
        {
          headers: {
            Authorization: 'Bearer mocked_token',
          },
        }
      );
    });
  
    it('fetchTopArtists should return top artists on success', async () => {
      const mockArtists = [{ id: 'artist1', name: 'Artist 1' }, { id: 'artist2', name: 'Artist 2' }];
      
      fetchMock.mockResponseOnce(JSON.stringify({ items: mockArtists }));
  
      const artists = await fetchTopArtists('short_term', null); // You can pass a mock navigation object if needed
  
      expect(artists).toEqual(mockArtists);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10',
        {
          headers: {
            Authorization: 'Bearer mocked_token',
          },
        }
      );
    });
    
      it('saveTrackToLikedSongs should save a track to liked songs on success', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({}));
    
        const response = await saveTrackToLikedSongs('track1', null); // Pass mock navigation if needed
    
        expect(response).toBe(true); // Expect the response to be OK
        expect(fetchMock).toHaveBeenCalledWith(
          'https://api.spotify.com/v1/me/tracks?ids=track1',
          {
            method: 'PUT',
            headers: {
              Authorization: 'Bearer mocked_token',
              'Content-Type': 'application/json',
            },
          }
        );
      });
  });
  