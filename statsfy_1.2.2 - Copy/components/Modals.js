// Modals.js
import { fetchTopTracks, fetchTopArtists, fetchTopGenres, fetchSummary, fetchTrackDetails, fetchTrackAudioFeatures, fetchArtistTopTracks } from '../Api'; // Ensure the import path is correct
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Dimensions, Image, TouchableOpacity, Modal, Alert, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');
const scaleFont = (size) => (width / 375) * size;

////////// logic behind the cards ///////
export const handleTrackPress = async (
  track,
  setSelectedTrack,
  setTrackDetails,
  setAudioFeatures,
  setIsModalVisible
) => {
  try {
    const details = await fetchTrackDetails(track.id);
    const features = await fetchTrackAudioFeatures(track.id);

    setSelectedTrack(track);
    setTrackDetails(details);
    setAudioFeatures(features);
    setIsModalVisible(true);
  } catch (error) {
    console.error('Error fetching track details:', error);
  }
};

export const handleArtistPress = async (
  artist,
  setSelectedArtist,
  setSelectedArtistTracks,
  setIsArtistModalVisible
) => {
  try {
    const tracks = await fetchArtistTopTracks(artist.id);
    setSelectedArtist(artist);
    setSelectedArtistTracks(tracks);
    setIsArtistModalVisible(true);
  } catch (error) {
    console.error('Error fetching artist top tracks:', error);
  }
};


///////////// displaying and rendering the modals////
export const TrackDetailsModal = ({
  visible,
  selectedTrack,
  trackDetails,
  audioFeatures,
  onClose
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <LinearGradient 
          colors={['#4d356b', '#516395']}
          start={[0,0.9]}
          end={[0, 0]}
          style={styles.modalContent}>
          {selectedTrack && trackDetails && audioFeatures && (
            <>
              <Image source={{ uri: selectedTrack.album.images[0].url }} style={styles.modalImage} />
              <Text style={styles.modalTitle} numberOfLines={1} ellipsizeMode="tail">
                {selectedTrack.name}
              </Text>
              <Text style={styles.modalSubtitle} numberOfLines={1} ellipsizeMode="tail">
                {selectedTrack.artists.map((artist) => artist.name).join(', ')}
              </Text>
              <View style={styles.audioFeaturesContainer}>
                <View style={styles.audioFeatureColumn}>
                  <Text style={styles.modalSubtitle}>Danceability: {audioFeatures.danceability.toFixed(2)}</Text>
                  <Text style={styles.modalSubtitle}>Energy: {audioFeatures.energy.toFixed(2)}</Text>
                  <Text style={styles.modalSubtitle}>Acousticness: {audioFeatures.acousticness.toFixed(2)}</Text>
                  <Text style={styles.modalSubtitle}>Liveness: {audioFeatures.liveness.toFixed(2)}</Text>
                </View>
                <View style={styles.audioFeatureColumn}>
                  <Text style={styles.modalSubtitle}>Tempo: {audioFeatures.tempo.toFixed(2)}</Text>
                  <Text style={styles.modalSubtitle}>Loudness: {audioFeatures.loudness.toFixed(2)}</Text>
                  <Text style={styles.modalSubtitle}>Speechiness: {audioFeatures.speechiness.toFixed(2)}</Text>
                  <Text style={styles.modalSubtitle}>Valence: {audioFeatures.valence.toFixed(2)}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.modalButton} testID="close-button">
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
};


export const ArtistTopTracksModal = ({
  visible,
  selectedArtist,
  selectedArtistTracks,
  onClose
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <LinearGradient colors={['#4d356b', '#516395']} style={styles.modalContent}>
          {selectedArtist && (
            <>
              <Image source={{ uri: selectedArtist.images[0].url }} style={styles.artistModalImage} />
              <Text style={styles.modalTitle}>{selectedArtist.name}'s Top Tracks</Text>
            </>
          )}

          <FlatList
            data={selectedArtistTracks}
            renderItem={({ item, index }) => (
              <View style={styles.modalCard}>
                <Text style={styles.indexText}>{index + 1}</Text>
                <View style={styles.info}>
                  <Text style={styles.modalTitleText} numberOfLines={1} ellipsizeMode="tail">
                    {item.name}
                  </Text>
                  <Text style={styles.modalSubText} numberOfLines={1} ellipsizeMode="tail">
                    {item.album.name}
                  </Text>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
            style={styles.flatList}
          />
          <TouchableOpacity onPress={onClose} style={styles.modalButton} testID="close-button">
            <Text style={styles.modalButtonText}>Close</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

// StyleSheet (use the existing styles from your original file or update as needed)
const styles = {
  // Define your styles here, for example:
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 10,
    padding: '7%',
    alignItems: 'center',
  },
  modalImage: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: '2%',
    borderRadius: 10,
  },
  artistModalImage: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.2, // Circular image
    marginBottom: '3%',
  },
  modalTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',
  },
  modalSubtitle: {
    fontSize: scaleFont(12),
    color: '#fff',
    marginBottom: '2%',
    textAlign: 'center',
  },
  audioFeaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '4%',
  },
  audioFeatureColumn: {
    flex: 1,
    alignItems: 'flex-start',
    marginHorizontal: '3%',
  },
  modalButton: {
    marginTop: '3%',
    backgroundColor: '#1DB954',
    paddingHorizontal: '6%',
    paddingVertical: '2.5%',
    borderRadius: 20,
  },
  modalButtonText: {
    color: 'black',
    fontSize: scaleFont(14),
    fontWeight: 'bold',
  },
  modalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 10,
    padding: '1%',
    marginVertical: '1%',
    width: width * 0.7,
    height: width * 0.1,
  },
  indexText: {
    color: 'white',
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    width: '10%',
    textAlign: 'center',
    flexWrap: 'nowrap',
  },
  modalTitleText: {
    color: 'white',
    fontSize: scaleFont(12),
    fontWeight: 'bold',
    maxWidth: '85%',
  },
  modalSubText: {
    color: 'white',
    fontSize: scaleFont(9),
    maxWidth: '85%',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: '3%',
  },
  flatList: {
    flexGrow: 0,
  },
};

