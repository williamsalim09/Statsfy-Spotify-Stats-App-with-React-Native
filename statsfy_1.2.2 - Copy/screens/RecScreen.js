import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, ActivityIndicator, Image, TouchableOpacity, StatusBar, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-deck-swiper';
import { fetchRecommendations, saveTrackToLikedSongs } from '../Api'; // Ensure the import path is correct
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import PlayPauseButton from '../components/PlayPauseButton'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage


const { width, height } = Dimensions.get('window');
const scaleFont = (size) => (width / 375) * size;

const RecScreen = ({ navigation }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const soundRef = useRef(null);
  const swiperRef = useRef(null);
  const currentPreviewUrl = useRef(null);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [allSwiped, setAllSwiped] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Hide status bar
  useEffect(() => {
    StatusBar.setHidden(true); // Hide status bar when the component is mounted
    return () => StatusBar.setHidden(false); // Show status bar again when the component is unmounted
  }, []);

  ///load recs from api
  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const recs = await fetchRecommendations([], [], ['pop'], navigation);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [navigation]);

 //// user instruction
 useEffect(() => {
  const showAlertIfNeeded = async () => {
      const hasSeenAlert = await AsyncStorage.getItem('hasSeenSwipeAlert');
      
      if (!hasSeenAlert) {
          setIsModalVisible(true);
          setTimeout(async () => {
            setIsModalVisible(false);
            await AsyncStorage.setItem('hasSeenSwipeAlert', 'true');
          }, 5000); // Adjust the time (in milliseconds) before the modal disappears
      }
  };

  showAlertIfNeeded();
}, []);

  ////////////////////////////play sample //////////
  const togglePlayback = async (previewUrl) => {
    try {
      if (soundRef.current && currentPreviewUrl.current === previewUrl) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setShouldPlay(false);
        } else if (status.isLoaded && !status.isPlaying) {
          await soundRef.current.playAsync();
          setShouldPlay(true);
        }
      } else {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
        currentPreviewUrl.current = previewUrl;
        const { sound } = await Audio.Sound.createAsync(
          { uri: previewUrl },
          { shouldPlay: true, volume: 0.12 }
        );
        soundRef.current = sound;
        setShouldPlay(true);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isPlaying) {
            setShouldPlay(false);
          }
        });
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  useEffect(() => {
    console.log("shouldPlay updated value:", shouldPlay);
  }, [shouldPlay]);

  /////////////////////////////////////////swiping logic////////////////////////////////////
  const handleSwipeRight = async (cardIndex) => {
    const track = recommendations[cardIndex];
    try {
      const rightSwipes = JSON.parse(await AsyncStorage.getItem('rightSwipes')) || [];
      await AsyncStorage.setItem('rightSwipes', JSON.stringify([...rightSwipes, track]));
      await saveTrackToLikedSongs(track.id, navigation);
      console.log(`Track saved to liked songs: ${track.name}`);
    } catch (error) {
      console.error('Error saving right swipe: ', error);
    }
  };

  const handleSwipeLeft = async (cardIndex) => {
    const track = recommendations[cardIndex];
    try {
      const leftSwipes = JSON.parse(await AsyncStorage.getItem('leftSwipes')) || [];
      await AsyncStorage.setItem('leftSwipes', JSON.stringify([...leftSwipes, track]));
      console.log(`Track swiped left: ${track.name}`);
    } catch (error) {
      console.error('Error saving left swipe: ', error);
    }
  };

  ////////////////////////////////////////////////refresh if swiped all///

  const refreshRecommendations = async () => {
    setIsLoading(true);
    setError(false);
    setAllSwiped(false);
    try {
      const recs = await fetchRecommendations([], [], ['pop'], navigation);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  ///render rec cards
  const renderCard = (song) => {
    return (
      <View style={styles.card}>
        <Image source={{ uri: song.album.images[0].url }} style={styles.image} />
        <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">{song.name}</Text>
        <Text style={styles.smallerText} numberOfLines={1} ellipsizeMode="tail">{song.artists.map((artist) => artist.name).join(', ')}</Text>
  
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.swipeButton}
            onPress={() => swiperRef.current.swipeLeft()}
          >
            <Ionicons name="close-circle" size={scaleFont(40)} color="red" />
          </TouchableOpacity>
  
          {song.preview_url ? (
            <PlayPauseButton 
              onTogglePlayback={() => togglePlayback(song.preview_url)} 
              initialIsPlaying={shouldPlay && currentPreviewUrl.current === song.preview_url} 
            />
          ) : (
            <MaterialIcons name="play-disabled" size={scaleFont(50)} color="white" style={styles.playButton} />
          )}
  
          <TouchableOpacity
            style={styles.swipeButton}
            onPress={() => swiperRef.current.swipeRight()}
          >
            <Ionicons name="heart-circle" size={scaleFont(42)} color="#1DB954" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </SafeAreaView>
    );
  }

  // if error (service unavailable)
  if (error) {
    return (
      <LinearGradient colors={['#040306', '#131624']} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.errorText}>Service is currently unavailable. Please try again later.</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refreshRecommendations}>
            <Ionicons name="reload-circle" size={scaleFont(50)} color="white" />
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  /// render screen when no cards
  if (allSwiped) {
    return (
      <LinearGradient colors={['#040306', '#131624']} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.sectionHeader}>DISCOVER YOUR TUNES !</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refreshRecommendations}>
            <Ionicons name="reload-circle" size={scaleFont(50)} color="white" />
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  /// the screen
  return (
    <LinearGradient colors={['#040306', '#131624']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="black" barStyle="light-content" />

        <Text style={styles.sectionHeader}>DISCOVER YOUR TUNES !</Text>
        <Swiper
          ref={swiperRef}
          cards={recommendations}
          renderCard={(song) => renderCard(song)}
          onSwiped={() => {
            if (soundRef.current) {
              soundRef.current.unloadAsync();
              soundRef.current = null;
              setShouldPlay(false);
              currentPreviewUrl.current = null;
            }
          }}
          onSwipedLeft={(cardIndex) => handleSwipeLeft(cardIndex)}
          onSwipedRight={(cardIndex) => handleSwipeRight(cardIndex)}
          onSwipedAll={() => {
            setAllSwiped(true);
          }}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={5}
          verticalSwipe={false} // Disable vertical swiping
        />

                {/* Instruction Modal */}
                <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Swipe left to discard a song and swipe right to save it to your liked songs.
              </Text>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#040306',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    top: '5%',
    color: 'white',
    fontSize: scaleFont(20),
    textAlign: 'center',
    marginBottom: '12%',
  },
  
  // rec cards
  card: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: '#303030',
    alignItems: 'center',
    height: height * 0.67,
    paddingBottom: '50%', // Add padding at the bottom
    paddingHorizontal: '5%',    justifyContent: 'flex-start', // Align content at the top
    top: '10%',
    overflow: 'hidden', // Ensure image stays within card boundaries

  },
  text: {
    color: 'white',
    textAlign: 'left', // Align text to the left
    fontSize: scaleFont(17),
    backgroundColor: 'transparent',
    maxWidth: width * 0.8,
    fontWeight: 'bold'
  },
  smallerText: {
    color: 'white',
    maxWidth: width * 0.8,
    textAlign: 'left', // Align text to the left
    fontSize: scaleFont(13),
    backgroundColor: 'transparent',
  },
  image: {
    width: width * 0.9,
    height: width * 0.9,
    marginBottom: '2%',
    // borderRadius: 10,
  },
  sectionHeader: {
    color: 'white',
    fontSize: scaleFont(30),
    fontWeight: 'bold',
    // marginBottom: '3%',
    top: '3%',
    zIndex: 10,
    fontStyle: 'italic',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    marginTop: '20%',
    marginBottom: '20%',
  },
  playButton: {
    marginHorizontal: '5%',
    bottom: '15%'
  },
  swipeButton: {
    backgroundColor: 'transparent',
    borderRadius: 5,
    bottom: '15%'
  },

  // little alert
  modalContainer: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    backgroundColor: '#303030',
    top: '80%',
    // bottom: '30%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: width * 0.9
  },
  modalText: {
    color: 'white',
    fontSize: scaleFont(14),
    textAlign: 'center',
  },
});

export default RecScreen;
