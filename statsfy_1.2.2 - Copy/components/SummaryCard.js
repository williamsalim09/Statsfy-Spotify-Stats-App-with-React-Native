import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import ViewShot from 'react-native-view-shot';
import { handleTrackPress, handleArtistPress,  TrackDetailsModal, ArtistTopTracksModal  } from './Modals'
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system'; // Import FileSystem to save the image
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');
const scaleFont = (size) => (width / 375) * size;

// import props
const SummaryCard = ({
    summary,
    timeRange,
    handleTrackPress,
    setSelectedTrack,
    setTrackDetails,
    setAudioFeatures,
    setIsModalVisible,
    setSelectedArtist,
    setSelectedArtistTracks,
    setIsArtistModalVisible,
    ViewShotRef,
}) => {

  const topTrack = summary.topTracks[0];
  let recapText = '';

  switch (timeRange) {
    case 'short_term':
      recapText = "Last Month's Recap";
      break;
    case 'medium_term':
      recapText = "Last 6 Months' Recap";
      break;
    case 'long_term':
      recapText = "All-Time Recap";
      break;
  }

  // save the recap card
  const handleSaveSummary = async () => {
    try {
      const uri = await ViewShotRef.current.capture(); // Capture the view as an image
      const newPath = `${FileSystem.cacheDirectory}recap.jpg`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
  
      Alert.alert('Success', 'Recap saved successfully!');
  
      // Optionally, share the image using Expo's Sharing module
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newPath);
      }
    } catch (error) {
      console.error('Error saving summary:', error);
    }
  };

  // render recap
  return (
    <View style={styles.section}>
      <ViewShot ref={ViewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
        <LinearGradient
          colors={['#614385', '#516395']}
          start={[0, 0]}
          end={[0.7, 0.7]}
          style={styles.summaryCard}
        >
          {topTrack && (
            <Image source={{ uri: topTrack.album.images[0].url }} style={styles.topTrackImage} />
          )}
          <Text style={styles.recapText}>{recapText}</Text>
          <View style={styles.summaryContent}>
            <View style={styles.column}>
              <Text style={styles.subHeaderText}>Your Top Tracks</Text>
              {summary.topTracks.map((track, index) => (
                <View key={track.id} style={styles.summaryItem}>
                  <TouchableOpacity onPress={() => handleTrackPress(track, setSelectedTrack, setTrackDetails, setAudioFeatures, setIsModalVisible)}>

                    <Text style={styles.summaryItemText} numberOfLines={1} ellipsizeMode="tail">
                      {index + 1}. {track.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.column}>
              <Text style={styles.subHeaderText}>Your Top Artists</Text>
              {summary.topArtists.map((artist, index) => (
                <View key={artist.id} style={styles.summaryItem}>
                  <TouchableOpacity onPress={() => handleArtistPress(artist, setSelectedArtist, setSelectedArtistTracks, setIsArtistModalVisible)}>
                    <Text style={styles.summaryItemText} numberOfLines={1} ellipsizeMode="tail">
                      {index + 1}. {artist.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.sumButton}>
            <AntDesign name="stepbackward" size={scaleFont(25)} color="#000" style={styles.prevButton} />
            <AntDesign name="playcircleo" size={scaleFont(40)} color="#000" style={styles.playButton} />
            <AntDesign name="stepforward" size={scaleFont(25)} color="#000" style={styles.skipButton} />
          </View>
        </LinearGradient>
      </ViewShot>
      <TouchableOpacity onPress={handleSaveSummary} style={styles.saveButton}>
        <MaterialIcons name="download" size={scaleFont(20)} color="black" />
        <Text style={styles.saveButtonText}>   Download Summary Card</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  section: {
    width,
    alignItems: 'center',
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 10,
    width: width * 0.9,
    height: 'auto',
    padding: '5%',
  },
  topTrackImage: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: '3%',
    borderRadius: 10,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  column: {
    flex: 1,
    marginHorizontal: '2%',
  },
  summaryItem: {
    marginBottom: '3%',
  },
  summaryItemText: {
    fontSize: scaleFont(12),
    marginBottom: '1%',
    // fontWeight: 'bold',
    color: 'white',
  },
  subHeaderText: {
    color: 'white',
    fontSize: scaleFont(14),
    marginBottom: '2%',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  playButton: {
    marginTop: '5%',
  },
  skipButton: {
    marginTop: '7%',
    marginLeft: '5%',
  },
  prevButton: {
    marginTop: '7%',
    marginRight: '5%',
  },
  sumButton: {
    flexDirection: 'row',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#1DB954',
    paddingVertical: '2%',
    paddingHorizontal: '10%',
    borderRadius: 20,
    marginTop: '5%',
  },
  saveButtonText: {
    color: 'black',
    fontSize: scaleFont(14),
    fontWeight: 'bold',
  },
  recapText: {
    fontSize: scaleFont(15),
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default SummaryCard;
