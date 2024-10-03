import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, StatusBar, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { spotifyCredentials } from '../Secret';
import Entypo from '@expo/vector-icons/Entypo';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native'; // Import LottieView

const { width } = Dimensions.get('window');
const scaleFont = (size) => (width / 375) * size;
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

    // Hide status bar
  useEffect(() => {
    StatusBar.setHidden(true); // Hide status bar when the component is mounted
    return () => StatusBar.setHidden(false); // Show status bar again when the component is unmounted
  }, []);
  
  // Log in
  useEffect(() => {
    const checkTokenValidity = async () => {
      const accessToken = await AsyncStorage.getItem('token');
      const expirationDate = await AsyncStorage.getItem('expirationDate');

      if (accessToken && expirationDate) {
        const currentTime = Date.now();
        if (currentTime < parseInt(expirationDate)) {
          setIsLoggedIn(true);
          navigation.replace('Main');
        }
      }
      setIsLoading(false);
    };

    checkTokenValidity();
  }, [navigation]);

  // Animation for welcome text and button
  useEffect(() => {
    Animated.sequence([
      Animated.timing(welcomeOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [welcomeOpacity, buttonOpacity]);

  // login details: scopes, redirect, etc.
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: spotifyCredentials.clientId,
      scopes: [
        'user-read-email',
        'user-library-read',
        'user-library-modify',
        'user-read-recently-played',
        'user-top-read',
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-modify-private',
      ],
      redirectUri: spotifyCredentials.redirectUri,
      responseType: 'token',
    },
    discovery
  );

  // the details of the session.
  useEffect(() => {
    const handleAuthResponse = async () => {
      if (response?.type === 'success' && response.params.access_token) {
        const { access_token, expires_in } = response.params;
        const expirationDate = Date.now() + expires_in * 1000; // 3600s = 1hr
        await AsyncStorage.setItem('token', access_token);
        await AsyncStorage.setItem('expirationDate', expirationDate.toString());
        setIsLoggedIn(true);
        navigation.replace('Main');
      } else {
        console.log('Login failed or was canceled:', response);
      }
    };

    handleAuthResponse();
  }, [response, navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1DB954" />
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        {/* Lottie Animation Background */}
        <LottieView
          source={require('../assets/wave_blue.json')} // Adjust path to your animation
          autoPlay
          loop
          style={styles.lottieBackground}
        />

        {/* 2nd wave */}
        <LottieView
          source={require('../assets/wave_purple.json')} // Adjust path to your animation
          autoPlay
          loop
          style={styles.wave2}
        />
        <View style={styles.landingPage}>
          <Animated.Text style={[styles.welcomeText, { opacity: welcomeOpacity }]}>
            WELCOME TO STATSFY
          </Animated.Text>
          <Text style={styles.descriptionText}>
            Sign in to see your Spotify statistics and discover new music!
          </Text>
          <Animated.View style={{ opacity: buttonOpacity }}>
            <TouchableOpacity
              disabled={!request}
              onPress={() => {
                promptAsync();
              }}
              style={styles.button}
            >
              <View style={styles.buttonContent}>
                <Entypo name="spotify" size={scaleFont(16)} color="black" />
                <Text style={styles.buttonText}> Sign in with Spotify</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  landingPage: {
    marginTop: '10%',
    alignItems: 'center',
    // justifyContent: 'center',
    flex: 1,
    paddingBottom: '15%',
  },
  welcomeText: {
    color: 'white',
    fontSize: scaleFont(28),
    fontWeight: 'bold',
    marginBottom: '3%',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  descriptionText: {
    color: 'white',
    fontSize: scaleFont(14),
    paddingLeft: '10%',
    paddingRight: '10%',
    textAlign: 'center',
    marginBottom: '4%',
  },
  button: {
    backgroundColor: '#1DB954',
    padding: '3%',
    width: width * 0.65,
    borderRadius: 35,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    marginLeft: '2%',
  },
  lottieBackground: {
    position: 'absolute',
    width: '130%',
    height: '177%',
    // bottom: 0
  },
  wave2: {
    position: 'absolute',
    width: '130%',
    height: '192%',
    // bottom: 0
  },
});

export default LoginScreen;
