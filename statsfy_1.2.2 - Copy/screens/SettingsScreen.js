import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, ScrollView, Modal, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchRecentlyPlayedTracks, fetchLikedSongs } from '../Api'; // Adjust the import path as needed
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';

const { width } = Dimensions.get('window');
const scaleFont = (size) => (width / 375) * size;

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [leftSwipes, setLeftSwipes] = useState([]);
  const [rightSwipes, setRightSwipes] = useState([]);
  const [isLeftSwipeModalVisible, setLeftSwipeModalVisible] = useState(false);
  const [isRightSwipeModalVisible, setRightSwipeModalVisible] = useState(false);

    // Hide status bar
  useEffect(() => {
    StatusBar.setHidden(true); // Hide status bar when the component is mounted
    return () => StatusBar.setHidden(false); // Show status bar again when the component is unmounted
  }, []);
  
  useEffect(() => {
    // Account section
    const fetchUserData = async () => {
      const accessToken = await AsyncStorage.getItem('token');
      if (accessToken) {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data:', response.status);
        }
      }
    };

    fetchUserData();
  }, []);

  // Recently played section logic
  useEffect(() => {
    const loadRecentlyPlayed = async () => {
      try {
        const tracks = await fetchRecentlyPlayedTracks(20, navigation);
        setRecentlyPlayed(tracks);
      } catch (error) {
        console.error('Error fetching recently played tracks:', error);
      }
    };

    loadRecentlyPlayed();
  }, [navigation]);

  // Swipe history
  useFocusEffect(
    React.useCallback(() => {
      const loadSwipeHistory = async () => {
        try {
          const leftSwipes = JSON.parse(await AsyncStorage.getItem('leftSwipes')) || [];
          const rightSwipes = JSON.parse(await AsyncStorage.getItem('rightSwipes')) || [];

          // Validate the structure of rightSwipes items
          const validRightSwipes = rightSwipes.filter((item) => {
            if (item && item.album && item.album.images && item.artists) {
              return true;
            } else {
              console.warn('Invalid item structure:', item);
              return false;
            }
          });

          const validLeftSwipes = leftSwipes.filter((item) => {
            if (item && item.album && item.album.images && item.artists) {
              return true;
            } else {
              console.warn('Invalid item structure:', item);
              return false;
            }
          });

          setLeftSwipes(validLeftSwipes);
          setRightSwipes(validRightSwipes);

          if (rightSwipes.length !== validRightSwipes.length) {
            await AsyncStorage.setItem('rightSwipes', JSON.stringify(validRightSwipes));
          }
          if (leftSwipes.length !== validLeftSwipes.length) {
            await AsyncStorage.setItem('leftSwipes', JSON.stringify(validLeftSwipes));
          }
        } catch (error) {
          console.error('Error loading swipe history:', error);
        }
      };

      loadSwipeHistory();
    }, [])
  );

  const renderSwipeHistoryItem = (item, index) => {
    // Check if item, album, and images are defined before rendering
    if (!item || !item.album || !item.album.images || !item.album.images[0]) {
      console.warn('Invalid item structure:', item);
      return null; // If any property is missing, return null to avoid rendering
    }

    return (
      <View key={index} style={styles.swipeHistoryItem}>
        <Image source={{ uri: item.album.images[0].url }} style={styles.swipeHistoryImage} />
        <View style={styles.swipeHistoryTextContainer}>
          <Text style={styles.swipeHistoryTrackName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.swipeHistoryArtistName} numberOfLines={1}>
            {item.artists ? item.artists.map(artist => artist.name).join(', ') : 'Unknown Artist'}
          </Text>
        </View>
      </View>
    );
  };

  // Logout logic 
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('expirationDate');
    await AsyncStorage.removeItem('hasSeenSwipeAlert'); // Remove the swipe alert flag

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  // Frontend
  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.settingsPage}>
          <View style={styles.accountSection}>
            {/* Account section */}
            <Text style={styles.sectionHeader}>YOUR ACCOUNT</Text>
            {userData && (
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  {userData.images && userData.images.length > 0 ? (
                    <Image source={{ uri: userData.images[0].url }} style={styles.profileImage} />
                  ) : (
                    <FontAwesome name="user-circle" size={width * 0.12} color="white" style={styles.profileIcon} />
                  )}
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{userData.display_name}</Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style = {styles.recentlyPlayedSection}>
          {/* Recently played */}
          <Text style={styles.recentlyPlayed}>Recently Played</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.recentlyPlayedScroll}
            contentContainerStyle={{ paddingBottom: '5%' }} // Add padding if needed to avoid overlap
          >
            {recentlyPlayed.map((track, index) => (
              <View key={index} style={styles.recentlyPlayedCard}>
                <Image source={{ uri: track.album.images[0].url }} style={styles.albumCover} />
                <Text style={styles.trackName} numberOfLines={1} ellipsizeMode="tail">{track.name}</Text>
                <Text style={styles.artistName} numberOfLines={1} ellipsizeMode="tail">{track.artists[0].name}</Text>
              </View>
            ))}
          </ScrollView>
    </View>
          {/* Swipe History */}
          <Text style={styles.swipeHistoryText}>Your Swiping History</Text>
          {/* Swipe History Cards */}
          <View style={styles.swipeHistoryContainer}>
            <TouchableOpacity style={styles.swipeHistoryCard} onPress={() => setLeftSwipeModalVisible(true)}>
              <Text style={styles.swipeHistoryCardText}>Left Swipes</Text>
              <AntDesign name="minuscircle" size={scaleFont(90)} color="rgba(200,0,0, 0.5)" style = {styles.iconStyle}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.swipeHistoryCard} onPress={() => setRightSwipeModalVisible(true)}>
              <Text style={styles.swipeHistoryCardText}>Right Swipes</Text>
              <AntDesign name="pluscircle" size={scaleFont(90)} color="rgba(29, 185, 84, 0.5)" style = {styles.iconStyle}/>
            </TouchableOpacity>
          </View>             
        
        {/* Left Swipe Modal */}
        <Modal
          visible={isLeftSwipeModalVisible}
          transparent={true}
          onRequestClose={() => setLeftSwipeModalVisible(false)}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Left Swipes</Text>
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {leftSwipes.map(renderSwipeHistoryItem)}
              </ScrollView>
              <TouchableOpacity onPress={() => setLeftSwipeModalVisible(false)} style={styles.closeModalButton}>
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Right Swipe Modal */}
        <Modal
          visible={isRightSwipeModalVisible}
          transparent={true}
          onRequestClose={() => setRightSwipeModalVisible(false)}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Right Swipes</Text>
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {rightSwipes.map(renderSwipeHistoryItem)}
              </ScrollView>
              <TouchableOpacity onPress={() => setRightSwipeModalVisible(false)} style={styles.closeModalButton}>
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
          
          {/* Logout Button */}
          <TouchableOpacity onPress={handleLogout} style={styles.button}>
            <View style={styles.buttonContent}>
              <Entypo name="spotify" size={scaleFont(16)} color="black" />
              <Text style={styles.buttonText}>Logout</Text>
            </View>
          </TouchableOpacity>
          {/* End of Logout Button */}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingsPage: {
    flex: 1,
    width: '100%',
    paddingHorizontal: '5%',
  },
  // acc section
  accountSection: {
    top: '3%',
    width: '100%',
    marginBottom: '5%',
  },
  sectionHeader: {
    color: 'white',
    fontSize: scaleFont(30),
    fontStyle: 'italic',
    fontWeight: 'bold',
    marginBottom: '5%',
    top: '3%'
  },
  card: {
    marginTop: '3%',
    width: '100%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#282828',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: '8%'
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: 50,
    marginBottom: '3%',
  },
  profileIcon: {
    alignItems: 'center',
    marginRight: '3%',
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    color: 'white',
    fontSize: scaleFont(14),
    fontWeight: 'bold',
  },
  userEmail: {
    color: 'white',
    fontSize: scaleFont(11),
    marginBottom: '3%',
  },

  ///// recently played section
  recentlyPlayedSection:{
    // marginBottom: '0%'
  },
  recentlyPlayed: {
    color: 'white',
    fontSize: scaleFont(16),
    marginBottom: '3%',
  },
  recentlyPlayedScroll: {
    width: '100%',
    marginBottom: '5%',
  },
  recentlyPlayedCard: {
    alignItems: 'center',
    width: width * 0.22,
  },
  albumCover: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: 5,
    marginBottom: '5%',
  },
  trackName: {
    color: 'white',
    fontSize: scaleFont(10),
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: width * 0.17,
  },
  artistName: {
    color: 'white',
    fontSize: scaleFont(8),
    textAlign: 'center',
    maxWidth: width * 0.17,
  },
  button: {
    backgroundColor: '#1DB954',
    padding: '1%',
    width: width * 0.65,
    borderRadius: 35,
    alignSelf: 'center',
    // bottom: '10%'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '3%',
    paddingBottom: '3%',
  },
  buttonText: {
    color: 'black',
    fontSize: scaleFont(14),
    marginLeft: '2%',
  },

  // the 2 cards below recently played
  swipeHistoryText: {
    color: 'white',
    fontSize: scaleFont(16),
    marginBottom: '3%',
    // bottom: '36%'
  },
  swipeHistoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: '5%',
    marginBottom: '45%'
  },
  swipeHistoryCard: {
    backgroundColor: '#282828',
    width: width * 0.42,
    height: width * 0.3,
    borderRadius: 10,
    padding: '3%',
    // bottom: '90%',
    overflow: 'hidden', // Ensure image stays within card boundaries
    position: 'relative', // Ensure absolute positioning works within this card

  },

  iconStyle: {
    position: 'absolute',
    bottom: '-12%', // Distance from the bottom
    right: '-12%',  // Distance from the right
  },
  swipeHistoryCardText: {
    color: 'white',
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    fontStyle: 'italic'
  },

  // modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#282828',
    borderRadius: 10,
    padding: '4%',
    width: '90%',
    height: '70%',
    alignItems: 'left',
  },
  modalTitle: {
    color: 'white',
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    marginBottom: '5%',
    fontStyle: 'italic'
  },
  swipeHistoryItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  swipeHistoryImage: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: 5,
    marginRight: 10,
  },
  swipeHistoryTextContainer: {
    flex: 1,

  },
  swipeHistoryTrackName: {
    color: 'white',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    textAlign: 'left', // Align text to the left

  },
  swipeHistoryArtistName: {
    color: 'white',
    fontSize: scaleFont(11),
    textAlign: 'left', // Align text to the left

  },
  closeModalButton: {
    marginTop: '5%',
    backgroundColor: '#1DB954',
    borderRadius: 30,
    paddingVertical: '3%',
    paddingHorizontal: '3%',
    width: width * 0.4, 
    alignItems: 'center',
    alignSelf: 'center'
  },
  closeModalButtonText: {
    alignText: 'center',
    color: 'black',
    fontSize: scaleFont(14),
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
