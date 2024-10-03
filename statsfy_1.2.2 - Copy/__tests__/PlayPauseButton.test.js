import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PlayPauseButton from '../components/PlayPauseButton'; // Adjust the path as needed

// Mock Ionicons from expo-vector-icons
jest.mock('@expo/vector-icons', () => {
  return {
    Ionicons: () => 'Ionicons',
  };
});

describe('PlayPauseButton', () => {
  it('should render and toggle play/pause on press', () => {
    // Mock onTogglePlayback function
    const mockTogglePlayback = jest.fn();

    // Render component
    const { getByTestId } = render(
      <PlayPauseButton onTogglePlayback={mockTogglePlayback} initialIsPlaying={false} />
    );

    // Find the play button using the testID
    const playPauseButton = getByTestId('playPauseButton');

    // Ensure button renders correctly
    expect(playPauseButton).toBeTruthy();

    // Simulate a press on the button
    fireEvent.press(playPauseButton);

    // Ensure that the function was called
    expect(mockTogglePlayback).toHaveBeenCalled();
  });
});

