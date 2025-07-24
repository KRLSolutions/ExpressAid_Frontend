import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import { url } from '../BackendURl';

interface ChooseAddressModalProps {
  visible: boolean;
  onClose: () => void;
  onAddNew: () => void;
  onSelect: (address: any) => void;
}

interface Suggestion {
  place_id: string;
  description: string;
}

// Replace with your actual Google API key
const GOOGLE_API_KEY = 'AIzaSyBt6vwj4W_smVmNXDPwHQLdFBVpHQgM78c'; // <-- Replace with your actual key if needed

// Use backend proxy for Places API
const BACKEND_BASE_URL = url; // Use Android emulator localhost

const ChooseAddressModal: React.FC<ChooseAddressModalProps> = ({ visible, onClose, onAddNew, onSelect }) => {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  
  // Map and search states
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });
  
  const searchInputRef = useRef<TextInput>(null);
  const mapRef = useRef<MapView>(null);

  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [extraDetails, setExtraDetails] = useState({
    forWhom: 'Myself',
    addressType: 'Home',
    houseNumber: '',
    floor: '',
    block: '',
    landmark: '',
  });

  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [someoneElseName, setSomeoneElseName] = useState('');
  const [someoneElsePhone, setSomeoneElsePhone] = useState('');

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [loadingMap, setLoadingMap] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchAddresses();
      requestLocationPermission();
    }
  }, [visible]);

  // Function to request location permission and get current location
  const requestLocationPermission = async () => {
    console.log('[Permission] Requesting location permission...');
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log('[Permission] Permission status:', status);
      if (status === 'granted') {
        // 1. Try last known location first (almost instant)
        let loc = await Location.getLastKnownPositionAsync();
        if (!loc) {
          // 2. Fallback to current position, low accuracy for speed
          loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        }
        if (loc) {
          console.log('[Permission] Got location:', loc);
          const region = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setUserLocation(region);
          setMapRegion(region);
          // Get address from coordinates
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc.coords.latitude},${loc.coords.longitude}&key=AIzaSyBt6vwj4W_smVmNXDPwHQLdFBVpHQgM78c`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              setCurrentAddress(data.results[0].formatted_address);
            }
          } catch (error) {
            console.error('Error fetching address:', error);
          }
        }
        return true;
      } else {
        console.log('[Permission] Permission denied');
        Alert.alert(
          'Location Permission Required',
          'Please allow location access to use your current location for address selection.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('[Permission] Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
      return false;
    }
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Session Expired', 'Please login again to continue.', [
          {
            text: 'OK',
            onPress: () => {
              try {
                navigation.reset({ index: 0, routes: [{ name: 'PhoneInputScreen' as never }] });
              } catch {
                navigation.reset({ index: 0, routes: [{ name: 'PhoneInput' as never }] });
              }
            },
          },
        ]);
        onClose();
        return;
      }
      const res = await api.getAddresses();
      setAddresses(res.addresses || []);
    } catch (e: any) {
      if (e.message === 'Invalid token' || e.message === 'Token required') {
        await AsyncStorage.multiRemove(['userId', 'userToken', 'userData']);
        Alert.alert('Session Expired', 'Please login again to continue.', [
          {
            text: 'OK',
            onPress: () => {
              try {
                navigation.reset({ index: 0, routes: [{ name: 'PhoneInputScreen' as never }] });
              } catch {
                navigation.reset({ index: 0, routes: [{ name: 'PhoneInput' as never }] });
              }
            },
          },
        ]);
        onClose();
      } else {
        setAddresses([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Use backend proxy for Places API
  const getPlacesSuggestions = async (query: string): Promise<Suggestion[]> => {
    if (query.length < 3) return [];
    const url = `${BACKEND_BASE_URL}/api/places/autocomplete?input=${encodeURIComponent(query)}`;
    console.log('[Autocomplete] Fetching:', url);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('[Autocomplete] Status:', response.status);
      if (!response.ok) {
        console.log('[Autocomplete] Response not ok:', response.statusText);
        return [];
      }
      const data = await response.json();
      console.log('[Autocomplete] Response:', data);
      if (data.status !== 'OK') {
        console.log('[Autocomplete] Status not OK:', data.status);
        return [];
      }
      const mapped = data.predictions.map((item: any) => ({
        place_id: item.place_id,
        description: item.description,
      }));
      console.log('[Autocomplete] Suggestions:', mapped);
      return mapped;
    } catch (err) {
      console.log('[Autocomplete] Error:', err);
      return [];
    }
  };

  const getLatLongFromPlaceId = async (placeId: string) => {
    const url = `${BACKEND_BASE_URL}/api/places/details?place_id=${encodeURIComponent(placeId)}`;
    console.log('[PlaceDetails] Fetching:', url);
    try {
      const response = await fetch(url);
      console.log('[PlaceDetails] Status:', response.status);
      const data = await response.json();
      console.log('[PlaceDetails] Response:', data);
      if (data.status !== 'OK') return null;
      const location = data.result.geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
        address: data.result.formatted_address,
      };
    } catch (err) {
      console.log('[PlaceDetails] Error:', err);
      return null;
    }
  };

  const handleSearchTextChange = async (text: string) => {
    setSearchText(text);
    setShowSuggestions(true);
    if (text.length >= 3) {
      const suggestions = await getPlacesSuggestions(text);
      setSuggestions(suggestions);
      console.log('[UI] Set suggestions:', suggestions);
      
      // If no suggestions from API, show some common addresses
      if (suggestions.length === 0) {
        const commonAddresses = [
          { place_id: 'manual_1', description: 'Home Address' },
          { place_id: 'manual_2', description: 'Work Address' },
          { place_id: 'manual_3', description: 'Current Location' },
        ];
        setSuggestions(commonAddresses);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = async (suggestion: Suggestion) => {
    setShowSuggestions(false);
    setSearchText(suggestion.description);
    console.log('[UI] Suggestion selected:', suggestion);
    
    // Handle manual addresses
    if (suggestion.place_id.startsWith('manual_')) {
      setCurrentAddress(suggestion.description);
      return;
    }
    
    const locationData = await getLatLongFromPlaceId(suggestion.place_id);
    if (!locationData) return;
    setMapRegion({
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setCurrentAddress(locationData.address || suggestion.description);
  };

  const handleMapRegionChange = (region: Region) => {
    setMapRegion(region);
    // Reverse geocoding to get address from coordinates
    const getAddressFromCoordinates = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${region.latitude},${region.longitude}&key=AIzaSyBt6vwj4W_smVmNXDPwHQLdFBVpHQgM78c`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setCurrentAddress(data.results[0].formatted_address);
        }
      } catch (error) {
        console.error('Error getting address from coordinates:', error);
      }
    };
    
    // Debounce the reverse geocoding to avoid too many requests
    setTimeout(getAddressFromCoordinates, 1000);
  };

  const handleSetAddress = () => {
    if (currentAddress) {
      const newAddress = {
        type: 'Home',
        address: currentAddress,
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      };
      
      // Add to addresses list
      setAddresses(prev => [...prev, newAddress]);
      setShowMapPicker(false);
      setSearchText('');
      setCurrentAddress('');
      setSuggestions([]);
    }
  };

  const handleChangeAddress = () => {
    setSearchText('');
    setShowSuggestions(true);
    searchInputRef.current?.focus();
  };

  const handleZoomIn = () => {
    setMapRegion(prev => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta / 2,
      longitudeDelta: prev.longitudeDelta / 2,
    }));
  };

  const handleZoomOut = () => {
    setMapRegion(prev => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta * 2,
      longitudeDelta: prev.longitudeDelta * 2,
    }));
  };

  const handleSaveFullAddress = () => {
    // Implementation of handleSaveFullAddress
  };

  const handleSelectAddress = (address: any) => {
    setSelectedAddressId(address._id || address.id);
    onSelect(address);
    onClose();
  };

  const handleSaveAddress = async (addressData: any) => {
    setLoading(true);
    try {
      // Construct the address data in the format expected by the backend
      const addressPayload = {
        type: addressData.addressType?.toLowerCase() || 'home',
        address: currentAddress || 'Selected address',
        houseNumber: addressData.houseNumber || '',
        floor: addressData.floor || '',
        block: addressData.block || '',
        landmark: addressData.landmark || '',
        city: '', // You can extract from currentAddress if needed
        state: '', // You can extract from currentAddress if needed
        pincode: '', // You can extract from currentAddress if needed
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
        isDefault: false,
        name: extraDetails.forWhom === 'Someone else' ? someoneElseName : 'My Address' // Add the required name field
      };
      // Validation: address and houseNumber must not be empty
      if (!addressPayload.address || !addressPayload.houseNumber) {
        Alert.alert('Missing Info', 'Please enter a valid address and house number.');
        setLoading(false);
        return;
      }

      console.log('Saving address:', addressPayload);
      const result = await api.addAddress(addressPayload);
      console.log('Address saved successfully:', result);
      // Select the new address immediately
      if (result && result.address) {
        onSelect(result.address);
      }
      await fetchAddresses();
      setShowDetailsSheet(false);
      onClose();
    } catch (e: any) {
      console.error('Error saving address:', e);
      const errorMessage = e.message || 'Failed to save address. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Before the Modal for map picker
  if (visible && showMapPicker) {
    console.log('[UI] Map picker modal rendered:', visible && showMapPicker);
  }

  return (
    <>
      {/* Main Address Selection Modal */}
      <Modal
        visible={visible && !showMapPicker}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Select delivery location</Text>
            <TouchableOpacity
              style={styles.addButtonModern}
              onPress={async () => {
                console.log('[UI] Add New Address button pressed');
                setShowMapPicker(true);
                setLoadingMap(true);
                const hasPermission = await requestLocationPermission();
                console.log('[UI] Location permission result:', hasPermission);
                setLoadingMap(false);
              }}
            >
              <Text style={styles.addButtonTextModern}>Add New Address</Text>
            </TouchableOpacity>
            <Text style={styles.savedTitle}>Your saved addresses</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={addresses || []}
                keyExtractor={item => item._id || item.id || Math.random().toString()}
                renderItem={({ item }) => (
                  <View style={[styles.addressCardModern, selectedAddressId === (item._id || item.id) && { borderColor: '#2563eb', borderWidth: 2 }]}> 
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => handleSelectAddress(item)}>
                      <Text style={styles.addressLabelModern}>{item.type || 'Address'}{' '}
                        <Text style={styles.addressDistanceModern}>{item.distance ? `${item.distance} km away` : ''}</Text>
                      </Text>
                      <Text style={styles.addressDetailModern}>{item.address}</Text>
                      {item.phone && <Text style={styles.addressPhoneModern}>Phone number: {item.phone}</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editAddressBtnModern}>
                      <Ionicons name="create-outline" size={20} color="#2563eb" />
                      <Text style={styles.editAddressTextModern}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>No addresses found. Add a new address.</Text>}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Map Picker Modal */}
      <Modal
        visible={visible && showMapPicker}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <View style={styles.mapModalContainer}>
          <Text style={styles.mapModalTitle}>Select Address</Text>
          
          <TouchableOpacity onPress={() => setShowMapPicker(false)}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>

          {loadingMap ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={{ marginTop: 16, color: '#2563eb' }}>Getting your location...</Text>
            </View>
          ) : (
            <>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={16} color="#777" />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search address or enter manually"
                  placeholderTextColor="#aaa"
                  value={searchText}
                  onChangeText={(text) => {
                    setSearchText(text);
                    setCurrentAddress(text);
                    handleSearchTextChange(text);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
                <TouchableOpacity
                  style={styles.useCurrentLocationButton}
                  onPress={requestLocationPermission}
                >
                  <Ionicons name="location" size={20} color="#2563eb" />
                  <Text style={styles.useCurrentLocationText}>Use Current</Text>
                </TouchableOpacity>
              </View>

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.place_id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionSelect(item)}
                    >
                      <Text style={styles.suggestionText}>{item.description}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionsList}
                />
              )}

              {/* Map */}
              <View style={styles.mapContainer}>
                <MapView
                  ref={mapRef}
                  apiKey={GOOGLE_API_KEY}
                  style={styles.map}
                  region={mapRegion}
                  onRegionChangeComplete={handleMapRegionChange}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                >
                  <Marker coordinate={mapRegion} />
                  {userLocation && (
                    <Marker
                      coordinate={userLocation}
                      pinColor="#22c55e"
                      title="Your Location"
                    />
                  )}
                </MapView>
                
                {/* Zoom Controls */}
                <View style={styles.zoomControls}>
                  <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
                    <Ionicons name="add" size={24} color="#222" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
                    <Ionicons name="remove" size={24} color="#222" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Address Display and Buttons */}
              <View style={styles.addressContainer}>
                <Text style={styles.addressText} numberOfLines={2}>
                  {currentAddress || 'Select an address from the map or search above'}
                </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.changeButton]}
                    onPress={handleChangeAddress}
                  >
                    <Text style={styles.buttonText}>Change</Text>
                  </TouchableOpacity>
                  {!currentAddress && (
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: '#22c55e' }]}
                      onPress={() => {
                        setCurrentAddress(searchText);
                      }}
                    >
                      <Text style={styles.buttonText}>Use Entered Address</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {currentAddress && (
                  <TouchableOpacity
                    style={styles.enhancedAddDetailsButton}
                    onPress={() => setShowDetailsSheet(true)}
                  >
                    <View style={styles.enhancedAddDetailsButtonContent}>
                      <MaterialCommunityIcons name="plus-circle" size={24} color="#ffffff" />
                      <Text style={styles.enhancedAddDetailsButtonText}>Add More Address Details</Text>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#ffffff" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </Modal>
      
      {/* Details Modal - Now properly layered on top */}
      <Modal
        visible={showDetailsSheet}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowDetailsSheet(false);
          setSomeoneElseName('');
          setSomeoneElsePhone('');
          setExtraDetails({
            forWhom: 'Myself',
            addressType: 'Home',
            houseNumber: '',
            floor: '',
            block: '',
            landmark: '',
          });
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.enhancedCenteredModal}>
            <View style={styles.enhancedSheetTitleRow}>
              <Text style={styles.enhancedSheetTitle}>Enter Complete Address</Text>
              <TouchableOpacity 
                style={styles.enhancedCloseButton}
                onPress={() => {
                  setShowDetailsSheet(false);
                  setSomeoneElseName('');
                  setSomeoneElsePhone('');
                  setExtraDetails({
                    forWhom: 'Myself',
                    addressType: 'Home',
                    houseNumber: '',
                    floor: '',
                    block: '',
                    landmark: '',
                  });
                }}
              >
                <Text style={styles.enhancedCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.enhancedScrollContent}
            >
              <View style={styles.enhancedSection}>
                <Text style={styles.enhancedSectionTitle}>Who you are ordering for?</Text>
                <View style={styles.enhancedRadioContainer}>
                  <TouchableOpacity
                    style={[styles.enhancedRadioButton, extraDetails.forWhom === 'Myself' && styles.enhancedRadioButtonSelected]}
                    onPress={() => setExtraDetails({ ...extraDetails, forWhom: 'Myself' })}
                  >
                    <View style={[styles.enhancedRadioCircle, extraDetails.forWhom === 'Myself' && styles.enhancedRadioCircleSelected]}>
                      {extraDetails.forWhom === 'Myself' && <View style={styles.enhancedRadioDot} />}
                    </View>
                    <Text style={[styles.enhancedRadioText, extraDetails.forWhom === 'Myself' && styles.enhancedRadioTextSelected]}>Myself</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.enhancedRadioButton, extraDetails.forWhom === 'Someone else' && styles.enhancedRadioButtonSelected]}
                    onPress={() => setExtraDetails({ ...extraDetails, forWhom: 'Someone else' })}
                  >
                    <View style={[styles.enhancedRadioCircle, extraDetails.forWhom === 'Someone else' && styles.enhancedRadioCircleSelected]}>
                      {extraDetails.forWhom === 'Someone else' && <View style={styles.enhancedRadioDot} />}
                    </View>
                    <Text style={[styles.enhancedRadioText, extraDetails.forWhom === 'Someone else' && styles.enhancedRadioTextSelected]}>Someone else</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {extraDetails.forWhom === 'Someone else' && (
                <View style={styles.enhancedSection}>
                  <Text style={styles.enhancedSectionTitle}>Recipient Details</Text>
                  <TextInput
                    style={styles.enhancedInput}
                    placeholder="Name of recipient *"
                    placeholderTextColor="#9ca3af"
                    value={someoneElseName}
                    onChangeText={setSomeoneElseName}
                  />
                  <TextInput
                    style={styles.enhancedInput}
                    placeholder="Phone number *"
                    placeholderTextColor="#9ca3af"
                    value={someoneElsePhone}
                    onChangeText={setSomeoneElsePhone}
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              <View style={styles.enhancedSection}>
                <Text style={styles.enhancedSectionTitle}>Save address as *</Text>
                <View style={styles.enhancedAddressTypeContainer}>
                  <TouchableOpacity
                    style={[styles.enhancedAddressTypeButton, extraDetails.addressType === 'Home' && styles.enhancedAddressTypeButtonSelected]}
                    onPress={() => setExtraDetails({ ...extraDetails, addressType: 'Home' })}
                  >
                    <MaterialCommunityIcons 
                      name="home" 
                      size={24} 
                      color={extraDetails.addressType === 'Home' ? '#ffffff' : '#6b7280'} 
                    />
                    <Text style={[styles.enhancedAddressTypeText, extraDetails.addressType === 'Home' && styles.enhancedAddressTypeTextSelected]}>Home</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.enhancedAddressTypeButton, extraDetails.addressType === 'Work' && styles.enhancedAddressTypeButtonSelected]}
                    onPress={() => setExtraDetails({ ...extraDetails, addressType: 'Work' })}
                  >
                    <FontAwesome5 
                      name="building" 
                      size={22} 
                      color={extraDetails.addressType === 'Work' ? '#ffffff' : '#6b7280'} 
                    />
                    <Text style={[styles.enhancedAddressTypeText, extraDetails.addressType === 'Work' && styles.enhancedAddressTypeTextSelected]}>Work</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.enhancedAddressTypeButton, extraDetails.addressType === 'Hotel' && styles.enhancedAddressTypeButtonSelected]}
                    onPress={() => setExtraDetails({ ...extraDetails, addressType: 'Hotel' })}
                  >
                    <FontAwesome5 
                      name="hotel" 
                      size={22} 
                      color={extraDetails.addressType === 'Hotel' ? '#ffffff' : '#6b7280'} 
                    />
                    <Text style={[styles.enhancedAddressTypeText, extraDetails.addressType === 'Hotel' && styles.enhancedAddressTypeTextSelected]}>Hotel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.enhancedAddressTypeButton, extraDetails.addressType === 'Other' && styles.enhancedAddressTypeButtonSelected]}
                    onPress={() => setExtraDetails({ ...extraDetails, addressType: 'Other' })}
                  >
                    <MaterialCommunityIcons 
                      name="map-marker" 
                      size={24} 
                      color={extraDetails.addressType === 'Other' ? '#ffffff' : '#6b7280'} 
                    />
                    <Text style={[styles.enhancedAddressTypeText, extraDetails.addressType === 'Other' && styles.enhancedAddressTypeTextSelected]}>Other</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.enhancedSection}>
                <Text style={styles.enhancedSectionTitle}>Address Details</Text>
                <TextInput
                  style={styles.enhancedInput}
                  placeholder="House number *"
                  placeholderTextColor="#9ca3af"
                  value={extraDetails.houseNumber}
                  onChangeText={t => setExtraDetails({ ...extraDetails, houseNumber: t })}
                />
                <TextInput
                  style={styles.enhancedInput}
                  placeholder="Floor *"
                  placeholderTextColor="#9ca3af"
                  value={extraDetails.floor}
                  onChangeText={t => setExtraDetails({ ...extraDetails, floor: t })}
                />
                <TextInput
                  style={styles.enhancedInput}
                  placeholder="Tower / Block (optional)"
                  placeholderTextColor="#9ca3af"
                  value={extraDetails.block}
                  onChangeText={t => setExtraDetails({ ...extraDetails, block: t })}
                />
                <TextInput
                  style={styles.enhancedInput}
                  placeholder="Nearby landmark (optional)"
                  placeholderTextColor="#9ca3af"
                  value={extraDetails.landmark}
                  onChangeText={t => setExtraDetails({ ...extraDetails, landmark: t })}
                />
              </View>
            </ScrollView>
            <View style={styles.enhancedButtonContainer}>
              <TouchableOpacity
                style={styles.enhancedSaveButton}
                onPress={() => {
                  setShowDetailsSheet(false);
                  handleSaveAddress(extraDetails);
                }}
              >
                <Text style={styles.enhancedSaveButtonText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: '60%',
    maxHeight: '80%',
  },
  closeBtn: {
    alignSelf: 'center',
    marginBottom: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -18,
    left: '47%',
    zIndex: 2,
  },
  closeText: {
    fontSize: 28,
    color: '#222',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#222',
  },
  addButtonModern: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  addButtonTextModern: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  savedTitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 8,
    marginTop: 8,
    fontWeight: 'bold',
  },
  addressCardModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 2,
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addressLabelModern: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  addressDistanceModern: {
    color: '#64748b',
    fontWeight: '400',
    fontSize: 13,
  },
  addressDetailModern: {
    color: '#222',
    fontSize: 15,
    marginBottom: 2,
  },
  addressPhoneModern: {
    color: '#64748b',
    fontSize: 13,
  },
  editAddressBtnModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  editAddressTextModern: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  // Map Modal Styles
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#222',
  },
  cancelButton: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#222',
  },
  useCurrentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  useCurrentLocationText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 4,
  },
  suggestionsList: {
    maxHeight: 150,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  map: {
    flex: 1,
    minHeight: 200,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
    gap: 10,
  },
  zoomButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 2,
    alignItems: 'center',
  },
  addressContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addressText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeButton: {
    backgroundColor: '#6b7280',
    borderRadius: 12,
    shadowColor: '#6b7280',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addDetailsButtonGreen: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  addDetailsButtonGreenText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  closeSheet: {
    fontSize: 28,
    color: '#888',
    fontWeight: 'bold',
  },
  sheetLabel: {
    fontSize: 15,
    color: '#888',
    marginBottom: 4,
    marginTop: 10,
    fontWeight: 'bold',
  },
  saveBtnGreen: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnGreenText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  addressTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 8,
    marginRight: 8,
  },
  addressTypeSelected: {
    backgroundColor: '#e0e7ff',
  },
  addressTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 4,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  radio: {
    padding: 12,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 8,
  },
  radioSelected: {
    backgroundColor: '#2563eb',
  },
  radioText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  radioTextSelected: {
    color: '#fff',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  centeredModal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Enhanced Modal Styles
  enhancedCenteredModal: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    margin: 16,
    maxHeight: '90%',
    minHeight: '70%',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  enhancedSheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  enhancedSheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  enhancedCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enhancedCloseText: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '600',
  },
  enhancedScrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  enhancedSection: {
    marginBottom: 32,
  },
  enhancedSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  enhancedRadioContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  enhancedRadioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  enhancedRadioButtonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  enhancedRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  enhancedRadioCircleSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#ffffff',
  },
  enhancedRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  enhancedRadioText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  enhancedRadioTextSelected: {
    color: '#1e40af',
    fontWeight: '600',
  },
  enhancedInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  enhancedAddressTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  enhancedAddressTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  enhancedAddressTypeButtonSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  enhancedAddressTypeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  enhancedAddressTypeTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  enhancedButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  enhancedSaveButton: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  enhancedSaveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  enhancedAddDetailsButton: {
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginTop: 16,
    shadowColor: '#22c55e',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  enhancedAddDetailsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  enhancedAddDetailsButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: -0.3,
    flex: 1,
    textAlign: 'center',
  },
});

export default ChooseAddressModal; 