import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Animated, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const scaleFont = (size) => (width / 375) * size;

const PlayPauseButton = ({ onTogglePlayback, initialIsPlaying }) => {
  const [isPlaying, setIsPlaying] = useState(initialIsPlaying);
  const rotation = new Animated.Value(isPlaying ? 1 : 0);

  // animate play/pause toggle
  useEffect(() => {
    Animated.timing(rotation, {
      toValue: isPlaying ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isPlaying]);

  // handle animation + toggle playback from recscreen.js
  const handlePress = () => {
    setIsPlaying((prevState) => !prevState);
    onTogglePlayback();
  };

  // render button
  return (
    <TouchableOpacity onPress={handlePress} testID="playPauseButton">
      <Animated.View
        style={{
          transform: [
            {
              rotate: rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '0deg'],
              }),
            },
          ],
        }}
      >
        <Ionicons name={isPlaying ? "pause" : "play"} size={scaleFont(50)} color="white" style = {{bottom: '70%'}}/>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default PlayPauseButton;
