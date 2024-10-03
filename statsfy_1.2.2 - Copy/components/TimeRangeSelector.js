import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const scaleFont = (size) => (width / 375) * size;

const TimeRangeSelector = ({ timeRange, setTimeRange }) => {
  return (
    <View style={styles.timeRangeSelector}>
      <TouchableOpacity onPress={() => setTimeRange('short_term')}>
        <Text style={timeRange === 'short_term' ? styles.activeTimeRange : styles.inactiveTimeRange}>
          LAST MONTH
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setTimeRange('medium_term')}>
        <Text style={timeRange === 'medium_term' ? styles.activeTimeRange : styles.inactiveTimeRange}>
          LAST 6 MONTHS
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setTimeRange('long_term')}>
        <Text style={timeRange === 'long_term' ? styles.activeTimeRange : styles.inactiveTimeRange}>
          ALL-TIME
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: '1%',
    paddingBottom: '1%',
    backgroundColor: '#282828',
    zIndex: 5,
    marginBottom: '2.5%',
  },
  activeTimeRange: {
    color: '#1DB954',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    shadowOpacity: 4,
    shadowRadius: 4,
    elevation: 0,
    shadowOffset: {
      width: 0,
      height: -4,
    },
  },
  inactiveTimeRange: {
    color: '#ddd',
    fontSize: scaleFont(13),
    shadowOpacity: 4,
    shadowRadius: 4,
    elevation: 0,
    shadowOffset: {
      width: 0,
      height: -4,
    },
  },
});

export default TimeRangeSelector;
