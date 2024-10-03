import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TrackDetailsModal, ArtistTopTracksModal } from '../components/Modals'; // Adjust the path as needed

// Mocking LinearGradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => children,
}));

// Mocking @expo/vector-icons
jest.mock('@expo/vector-icons/AntDesign', () => 'AntDesign');

// Mocking AsyncStorage for potential future use
jest.mock('@react-native-async-storage/async-storage', () => {
  return {
    getItem: jest.fn(() => Promise.resolve('mocked_token')),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
});

// Mock API functions
jest.mock('../Api', () => ({
  fetchTrackDetails: jest.fn(() => Promise.resolve({ id: 'track1' })),
  fetchTrackAudioFeatures: jest.fn(() =>
    Promise.resolve({
      danceability: 0.55,
      energy: 0.77,
      acousticness: 0.15,
      liveness: 0.3,
      tempo: 110.0,
      loudness: 0.9,
      speechiness: 0.12,
      valence: 0.35,
    })
  ),
  fetchArtistTopTracks: jest.fn(() =>
    Promise.resolve([
      { id: 'track1', name: 'Track 1', album: { name: 'Album 1' } },
      { id: 'track2', name: 'Track 2', album: { name: 'Album 2' } },
    ])
  ),
}));

describe('Modals', () => {
  const mockTrack = {
    name: 'Track Name',
    album: {
      images: [{ url: 'https://example.com/album.jpg' }],
    },
    artists: [{ name: 'Artist Name' }],
  };

  const mockAudioFeatures = {
    danceability: 0.55,
    energy: 0.77,
    acousticness: 0.15,
    liveness: 0.3,
    tempo: 110.0,
    loudness: 0.9,
    speechiness: 0.12,
    valence: 0.35,
  };

  const mockArtist = {
    name: 'Artist Name',
    images: [{ url: 'https://example.com/artist.jpg' }],
  };

  const mockTracks = [
    { id: 'track1', name: 'Track 1', album: { name: 'Album 1' } },
    { id: 'track2', name: 'Track 2', album: { name: 'Album 2' } },
  ];

  // Tests for TrackDetailsModal
  describe('TrackDetailsModal', () => {
    it('should render track details modal with correct information when visible', async () => {
      const { getByText, getByTestId } = render(
        <TrackDetailsModal
          visible={true}
          selectedTrack={mockTrack}
          trackDetails={{ id: 'track1' }}
          audioFeatures={mockAudioFeatures}
          onClose={jest.fn()}
        />
      );

      // Check if track name and artist name are rendered
      expect(getByText('Track Name')).toBeTruthy();
      expect(getByText('Artist Name')).toBeTruthy();

      // Check if audio features are displayed using regex for floating-point numbers
      expect(getByText(/Danceability:\s+0\.55/)).toBeTruthy();
      expect(getByText(/Energy:\s+0\.77/)).toBeTruthy();

      // Check if modal renders the close button
      const closeButton = getByTestId('close-button');
      fireEvent.press(closeButton);
    });

    it('shouldnt render modal when visible is false', () => {
      const { queryByText } = render(
        <TrackDetailsModal
          visible={false}
          selectedTrack={mockTrack}
          trackDetails={{ id: 'track1' }}
          audioFeatures={mockAudioFeatures}
          onClose={jest.fn()}
        />
      );

      // modal should not be in the document when visible is false
      expect(queryByText('Track Name')).toBeNull();
    });
  });

  // Tests for ArtistTopTracksModal
  describe('ArtistTopTracksModal', () => {
    it('should render artist top tracks modal with correct information when visible', async () => {
      const { getByText, getByTestId } = render(
        <ArtistTopTracksModal
          visible={true}
          selectedArtist={mockArtist}
          selectedArtistTracks={mockTracks}
          onClose={jest.fn()}
        />
      );

      // Check if artist name and top tracks are rendered
      expect(getByText("Artist Name's Top Tracks")).toBeTruthy();
      expect(getByText('Track 1')).toBeTruthy();
      expect(getByText('Album 1')).toBeTruthy();
      expect(getByText('Track 2')).toBeTruthy();
      expect(getByText('Album 2')).toBeTruthy();

      // Check if modal renders the close button
      const closeButton = getByTestId('close-button');
      fireEvent.press(closeButton);
    });

    it('should not render the modal when visible is false', () => {
      const { queryByText } = render(
        <ArtistTopTracksModal
          visible={false}
          selectedArtist={mockArtist}
          selectedArtistTracks={mockTracks}
          onClose={jest.fn()}
        />
      );

      // The modal should not be in the document when visible is false
      expect(queryByText("Artist Name's Top Tracks")).toBeNull();
      expect(queryByText('Track 1')).toBeNull();
    });
  });
});
