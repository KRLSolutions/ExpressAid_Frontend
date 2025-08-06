import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import MapView, { Region, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SelectAddressScreen = ({ navigation, route }: any) => {
  const [location, setLocation] = useState<Region | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to select your address.');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setLocation(region);
      fetchAddress(region.latitude, region.longitude);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setLoading(false);
    }
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBt6vwj4W_smVmNXDPwHQLdFBVpHQgM78c`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const onRegionChangeComplete = (region: Region) => {
    setLocation(region);
    fetchAddress(region.latitude, region.longitude);
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    await getCurrentLocation();
  };

  const handleConfirm = () => {
    if (!address) {
      Alert.alert('No Address', 'Please select a valid address.');
      return;
    }
    
    // Return the selected address and location
    const selectedAddress = {
      address,
      latitude: location?.latitude,
      longitude: location?.longitude,
    };
    
    navigation.goBack();
    // You can also pass this data back through route params or a callback
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Address</Text>
        <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>

      {/* Use Current Location Button */}
      <View style={styles.useCurrentContainer}>
        <TouchableOpacity 
          style={styles.useCurrentButton} 
          onPress={handleUseCurrentLocation}
          disabled={loading}
        >
          <Ionicons name="locate" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.useCurrentButtonText}>
            {loading ? 'Getting Location...' : 'Use Current Location'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={{ flex: 1 }}>
        {loading || !location ? (
          <View style={styles.loadingContainer}>
            <Text>Loading map...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={location}
            region={location}
            onRegionChangeComplete={onRegionChangeComplete}
            showsUserLocation
            showsMyLocationButton
          >
            <Marker coordinate={location} />
          </MapView>
        )}
      </View>

      {/* Selected Address Display */}
      <View style={styles.addressBox}>
        <Ionicons name="location-sharp" size={22} color="#2563eb" style={{ marginRight: 8 }} />
        <Text style={styles.addressText} numberOfLines={2}>
          {address || 'Move the map or use current location to select an address'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 44 : 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  confirmButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  useCurrentContainer: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  useCurrentButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 200,
  },
  useCurrentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 14,
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  addressText: {
    fontSize: 15,
    color: '#222',
    flex: 1,
  },
});

export default SelectAddressScreen; 