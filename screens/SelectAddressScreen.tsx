import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, TextInput, FlatList, Modal } from 'react-native';
import MapView, { Region, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface LocationItem {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const SelectAddressScreen = ({ navigation, route }: any) => {
  const [location, setLocation] = useState<Region | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<MapView>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getCurrentLocation();
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
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

  const searchPlaces = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=geocode&components=country:in&key=AIzaSyBt6vwj4W_smVmNXDPwHQLdFBVpHQgM78c`
      );
      const data = await response.json();
      if (data.predictions) {
        setSearchResults(data.predictions);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const onRegionChangeComplete = (region: Region) => {
    setLocation(region);
    fetchAddress(region.latitude, region.longitude);
  };

  const selectSearchResult = async (item: LocationItem) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&fields=geometry,formatted_address&key=AIzaSyBt6vwj4W_smVmNXDPwHQLdFBVpHQgM78c`
      );
      const data = await response.json();
      
      if (data.result && data.result.geometry) {
        const { lat, lng } = data.result.geometry.location;
        const region = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setLocation(region);
        mapRef.current?.animateToRegion(region, 1000);
        // Use formatted_address if available, otherwise use description
        setAddress(data.result.formatted_address || item.description);
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
      } else {
        Alert.alert('Error', 'Could not get location details for this address.');
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      Alert.alert('Error', 'Failed to get location details. Please try again.');
    }
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

  const renderSearchResult = ({ item }: { item: LocationItem }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectSearchResult(item)}
    >
      <Ionicons name="location-outline" size={20} color="#666" style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.searchResultMainText}>{item.structured_formatting.main_text}</Text>
        <Text style={styles.searchResultSecondaryText}>{item.structured_formatting.secondary_text}</Text>
      </View>
    </TouchableOpacity>
  );

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for an address..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            
            // Clear previous timeout
            if (searchTimeoutRef.current) {
              clearTimeout(searchTimeoutRef.current);
            }
            
            // Set new timeout for debounced search
            searchTimeoutRef.current = setTimeout(() => {
              searchPlaces(text);
            }, 300);
          }}
          onFocus={() => {
            if (searchQuery.length >= 2) {
              setShowSearchResults(true);
            }
          }}
          onBlur={() => {
            // Keep results visible for a moment to allow selection
            setTimeout(() => setShowSearchResults(false), 200);
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => {
            setSearchQuery('');
            setSearchResults([]);
            setShowSearchResults(false);
          }}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {showSearchResults && (
        <View style={styles.searchResultsContainer}>
          {isSearching ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>Searching...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.place_id}
              style={styles.searchResultsList}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No addresses found</Text>
            </View>
          )}
        </View>
      )}

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

      {/* Current Location Button */}
      <TouchableOpacity style={styles.currentLocationButton} onPress={getCurrentLocation}>
        <Ionicons name="locate" size={24} color="#2563eb" />
      </TouchableOpacity>

      {/* Selected Address Display */}
      <View style={styles.addressBox}>
        <Ionicons name="location-sharp" size={22} color="#2563eb" style={{ marginRight: 8 }} />
        <Text style={styles.addressText} numberOfLines={2}>
          {address || 'Move the map or search to select an address'}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    marginLeft: 8,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 250,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchResultsList: {
    borderRadius: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    minHeight: 60,
  },
  searchResultMainText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  searchResultSecondaryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default SelectAddressScreen; 