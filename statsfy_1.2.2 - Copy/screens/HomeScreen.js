import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Dimensions, Image, TouchableOpacity, Modal, Alert, StatusBar } from 'react-native';
import { fetchTopTracks, fetchTopArtists, fetchTopGenres, fetchSummary, fetchTrackDetails, fetchTrackAudioFeatures, fetchArtistTopTracks } from '../Api'; // Ensure the import path is correct
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import ViewShot from 'react-native-view-shot'; // Import ViewShot
import * as FileSystem from 'expo-file-system'; // Import FileSystem to save the image
import * as Sharing from 'expo-sharing'; // Import Sharing to share the image
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import components
import { handleTrackPress, handleArtistPress,  TrackDetailsModal, ArtistTopTracksModal  } from '../components/Modals'
import TimeRangeSelector from '../components/TimeRangeSelector'; // Import TimeRangeSelector
import SummaryCard from '../components/SummaryCard'; // Import SummaryCard

const { width, height } = Dimensions.get('window');
const scaleFont = (size) => (width / 375) * size;

const HomeScreen = () => {
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const [summary, setSummary] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('short_term');
  const [currentSection, setCurrentSection] = useState(0);
  // track modal
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [trackDetails, setTrackDetails] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  // artist modal
  const [selectedArtistTracks, setSelectedArtistTracks] = useState([]);
  const [isArtistModalVisible, setIsArtistModalVisible] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null); // Add this state to track the selected artist
  //genre
  const [topGenreArtistImage, setTopGenreArtistImage] = useState(null); // New state to track artist image for top genre
  
  const ViewShotRef = useRef();
    // Hide status bar
    useEffect(() => {
      StatusBar.setHidden(true); // Hide status bar when the component is mounted
      return () => StatusBar.setHidden(false); // Show status bar again when the component is unmounted
    }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [tracks, artists, genres] = await Promise.all([
          fetchTopTracks(timeRange),
          fetchTopArtists(timeRange),
          fetchTopGenres(timeRange),
        ]);
        setTopTracks(tracks);
        setTopArtists(artists);
        setTopGenres(genres);

        // Fetch summary data limited to top 5
        const summaryData = await fetchSummary(timeRange, 5);
        setSummary(summaryData);
      
        // Fetch image for artist representing the top genre
        if (genres.length > 0) {
          const topGenre = genres[0]; // Get the top genre
          const artistForTopGenre = artists.find((artist) =>
            artist.genres.includes(topGenre)
          );

          if (artistForTopGenre && artistForTopGenre.images.length > 0) {
            setTopGenreArtistImage(artistForTopGenre.images[0].url);
          } else {
            setTopGenreArtistImage(null);
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [timeRange]);


  if (isLoading) {
    return (
      <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color="#1DB954" />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // tracks section
  const renderTrack = ({ item, index }) => (
    <TouchableOpacity onPress={() => handleTrackPress(item, 
      setSelectedTrack, 
      setTrackDetails, 
      setAudioFeatures, 
      setIsModalVisible)}>
      <View style={styles.card}>
        <Image source={{ uri: item.album.images[0].url }} style={styles.image} />
        <Text style={styles.indexText}>{index + 1}</Text>
        <View style={styles.info}>
          <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text style={styles.subText} numberOfLines={1} ellipsizeMode="tail">
            {item.artists.map((artist) => artist.name).join(', ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // artist section
  const renderArtist = ({ item, index }) => (
    <TouchableOpacity onPress={() => handleArtistPress(
      item,
      setSelectedArtist, 
      setSelectedArtistTracks, 
      setIsArtistModalVisible
    )}>
      <View style={styles.artistContainer}>
        <Image source={{ uri: item.images[0].url }} style={styles.artistImage} />
        <Text style={styles.artistName} numberOfLines={1} ellipsizeMode="tail">
          {index + 1}. {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // genre section
  const renderGenre = ({ item, index }) => (
  <View style={styles.genreContainer}>
  <LinearGradient
    colors={["#614385", "#516395"]} // Define the start and end colors of the gradient
    start={[0, 0]} // Start of the gradient (top-left)
    end={[1, 0]} // End of the gradient (top-right, for horizontal gradient)
    style={styles.genreGradient} // Apply the gradient style
  >
    <Text style={styles.genreText} numberOfLines={1} ellipsizeMode="tail">
      #{index+1} {item.toUpperCase()}
    </Text>
  </LinearGradient>
</View>
  );
  
  const renderSection = ({ item }) => {
    const headerText = {
      tracks: 'YOUR TOP TRACKS',
      artists: 'YOUR TOP ARTISTS',
      genres: 'YOUR FAVORITE GENRES',
      summary: 'RECAP',
    };

    return (
      <LinearGradient colors={['#040306', '#131624']} style={styles.gradient}>
        <View style={styles.section}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>{headerText[item.type]}</Text>
          </View>

          {/* import timerangeselector */}
          <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />

          {item.type === 'tracks' && (
            <FlatList
              data={topTracks}
              renderItem={renderTrack}
              keyExtractor={(item) => item.id}
              style={styles.flatList}
            />
          )}
          {item.type === 'artists' && (
            <FlatList
              data={topArtists}
              renderItem={renderArtist}
              keyExtractor={(item) => item.id}
              style={styles.flatList}
              numColumns={2} // Set to 2 columns
            />
          )}
          {item.type === 'genres' && (
            <View style={styles.genreSection}>
            {topGenreArtistImage && (
              <Image
                source={{ uri: topGenreArtistImage }}
                style={styles.topGenreArtistImage}
                onPress={() => handleArtistPress(item)}
              />
            )}
            <FlatList
              data={topGenres}
              renderItem={renderGenre}
              keyExtractor={(item, index) => index.toString()}
              style={styles.flatList}
            />
          </View>
          )}
          {item.type === 'summary' && (
                 <SummaryCard
                 summary={summary} // Pass summary data here
                 timeRange={timeRange} // Pass time range here
                 handleTrackPress={handleTrackPress}
                 handleArtistPress={handleArtistPress}
                 ViewShotRef={ViewShotRef}
                 setSelectedTrack={setSelectedTrack}
                 setTrackDetails={setTrackDetails}
                 setAudioFeatures={setAudioFeatures}
                 setIsModalVisible={setIsModalVisible}
                 setSelectedArtist={setSelectedArtist}  // Ensure this is passed correctly
                 setSelectedArtistTracks={setSelectedArtistTracks}  // Ensure this is passed correctly
                 setIsArtistModalVisible={setIsArtistModalVisible}  // Ensure this is passed correctly
               />
          )}
        </View>
      </LinearGradient>
    );
  };

  const sections = [
    { type: 'tracks' },
    { type: 'artists' },
    { type: 'genres' },
    { type: 'summary' },
  ];

  const handleViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentSection(viewableItems[0].index);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <StatusBar hidden={true} />

{/* compile and display everything */}
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item) => item.type}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        initialScrollIndex={currentSection}
        getItemLayout={(data, index) => ({ length: height, offset: height * index, index })}
        snapToInterval={height} // Ensure pages snap correctly
        decelerationRate="fast"
        style={styles.flatListContainer}
      />

      {/* Import the Modals */}
      <TrackDetailsModal
        visible={isModalVisible}
        selectedTrack={selectedTrack}
        trackDetails={trackDetails}
        audioFeatures={audioFeatures}
        onClose={() => setIsModalVisible(false)}
      />

      <ArtistTopTracksModal
        visible={isArtistModalVisible}
        selectedArtist={selectedArtist}
        selectedArtistTracks={selectedArtistTracks}
        onClose={() => setIsArtistModalVisible(false)}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
    // backgroundColor: '#1DB954',
  },
  gradient: {
    flex: 1,
  },
  section: {
    width,
    height,
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    backgroundColor: '#282828',
    paddingVertical: '2%',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: scaleFont(26),
    fontStyle: 'italic',
    fontWeight: 'bold',
  },

  errorText: {
    color: 'red',
    fontSize: scaleFont(12),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 10,
    padding: '1%',
    marginVertical: '1%',
    width: width * 0.9,
    height: height * 0.063,
  },

  image: {
    width: '12%',
    height: width * 0.10,
    borderRadius: 25,
    marginRight: '2%',
    marginLeft: '2%',
  },
  indexText: {
    color: 'white',
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    width: '10%', // Increase width to accommodate larger numbers
    textAlign: 'center',
    // marginRight: '4%',
    flexWrap: 'nowrap', // Prevent text wrapping
  },
  titleText: {
    color: 'white',
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    maxWidth: '85%', // Ensure the width is limited
  },
  subText: {
    color: 'white',
    fontSize: scaleFont(10),
    maxWidth: '85%', // Ensure the width is limited
  },

  info: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: '3%', // Add margin to separate from indexText
  },
  flatList: {
    flexGrow: 0,
  },
  flatListContainer: {
    flex: 1,
    width: '100%',
  },
  audioFeaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '4%', // Add some space above the columns
  },
  audioFeatureColumn: {
    flex: 1,
    alignItems: 'flex-start', // Align to the left
    marginHorizontal: '3%', // Add horizontal margin for spacing
  },

  artistContainer: {
    alignItems: 'center',
    marginVertical: '2%',
    width: width / 2 - width * 0.1, // Adjust width for two columns
  },
  artistImage: {
    width: width * 0.24,
    height: width * 0.24,
    borderRadius: width * 0.24 / 2, // Circular image
    marginBottom: '5%',
    // paddingBottom: '9%'
  },
  artistName: {
    color: 'white',
    fontSize: scaleFont(12),
    textAlign: 'center',
    maxWidth: width * 0.35,
  },
  genreText: {
    // backgroundColor: '#1DB954', // Highlight background color
    color: 'white', // Text color contrasting with the background
    fontSize: scaleFont(45), // Larger font size for emphasis
    fontWeight: '500',
    fontStyle: 'italic',

    paddingHorizontal: '2%', // Horizontal padding for the highlighted effect
    marginRight: '4.5%',
  },

  genreGradient: {
    marginBottom: '2%'
  },

  topGenreArtistImage: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: (width * 0.5) / 2, // Circular image
    marginBottom: '3%', // Space below the image

  },
    genreSection: {
      alignItems: 'center', // Center children horizontally
      justifyContent: 'center', // Center children vertically (if needed)
      marginVertical: '2%',
      width: '100%', // Ensure the section takes full width
    },

});

export default HomeScreen;
