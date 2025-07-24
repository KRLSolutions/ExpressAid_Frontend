import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Region, Marker } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { url } from '../../BackendURl';

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
const GOOGLE_API_KEY = 'AIzaSyD...'; // <-- Replace with your actual key if needed

// Use backend proxy for Places API
const BACKEND_BASE_URL = url; // Change to your backend IP if needed

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

  useEffect(() => {
    if (visible) {
      fetchAddresses();
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getCurrentPositionAsync({});
          const region = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setUserLocation(region);
          setMapRegion(region);
        }
      })();
    }
  }, [visible]);

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
      const response = await fetch(url);
      console.log('[Autocomplete] Status:', response.status);
      const data = await response.json();
      console.log('[Autocomplete] Response:', data);
      if (data.status !== 'OK') return [];
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
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = async (suggestion: Suggestion) => {
    setShowSuggestions(false);
    setSearchText(suggestion.description);
    console.log('[UI] Suggestion selected:', suggestion);
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
    // You can add reverse geocoding here to get address from coordinates
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

  if (showMapPicker) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <View style={styles.mapModalContainer}>
          <Text style={styles.mapModalTitle}>Select Address</Text>
          
          <TouchableOpacity onPress={() => setShowMapPicker(false)}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={16} color="#777" />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search address"
              placeholderTextColor="#aaa"
              value={searchText}
              onChangeText={handleSearchTextChange}
              onFocus={() => setShowSuggestions(true)}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
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
            
              style={style.map}
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
              {/* <TouchableOpacity
                style={[styles.button, styles.setAddressButton]}
                onPress={handleSetAddress}
              >
                <Text style={styles.buttonText}>Set Address</Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={[styles.button, styles.changeButton]}
                onPress={handleChangeAddress}
              >
                <Text style={styles.buttonText}>Change</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.addDetailsButtonGreen}
              onPress={() => setShowDetailsSheet(true)}
            >
              <Text style={styles.addDetailsButtonGreenText}>Add more address details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
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
            style={styles.addButton}
            onPress={() => setShowMapPicker(true)}
          >
            <Text style={styles.addButtonText}>Add New Address</Text>
          </TouchableOpacity>
          <Text style={styles.savedTitle}>Your saved addresses</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={addresses || []}
              keyExtractor={item => item._id || item.id || Math.random().toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.addressCard} onPress={() => onSelect(item)}>
                  <Text style={styles.addressLabel}>{item.type || 'Address'}{' '}
                    <Text style={styles.addressDistance}>{item.distance ? `${item.distance} km away` : ''}</Text>
                  </Text>
                  <Text style={styles.addressDetail}>{item.address}</Text>
                  {item.phone && <Text style={styles.addressPhone}>Phone number: {item.phone}</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>No addresses found. Add a new address.</Text>}
            />
          )}
        </View>
      </View>
      <Modal
        visible={showDetailsSheet}
        animationType="slide"
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
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle}>Enter complete address</Text>
              <TouchableOpacity onPress={() => {
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
              }}>
                <Text style={styles.closeSheet}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetLabel}>Who you are ordering for?</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.radio, extraDetails.forWhom === 'Myself' && styles.radioSelected]}
                onPress={() => setExtraDetails({ ...extraDetails, forWhom: 'Myself' })}
              >
                <Text style={[styles.radioText, extraDetails.forWhom === 'Myself' && styles.radioTextSelected]}>Myself</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radio, extraDetails.forWhom === 'Someone else' && styles.radioSelected]}
                onPress={() => setExtraDetails({ ...extraDetails, forWhom: 'Someone else' })}
              >
                <Text style={[styles.radioText, extraDetails.forWhom === 'Someone else' && styles.radioTextSelected]}>Someone else</Text>
              </TouchableOpacity>
            </View>
            {extraDetails.forWhom === 'Someone else' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Name of recipient *"
                  value={someoneElseName}
                  onChangeText={setSomeoneElseName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone number *"
                  value={someoneElsePhone}
                  onChangeText={setSomeoneElsePhone}
                  keyboardType="phone-pad"
                />
              </>
            )}
            <Text style={styles.sheetLabel}>Save address as *</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.addressTypeBtn, extraDetails.addressType === 'Home' && styles.addressTypeSelected]}
                onPress={() => setExtraDetails({ ...extraDetails, addressType: 'Home' })}
              >
                <MaterialCommunityIcons name="home" size={20} color={extraDetails.addressType === 'Home' ? '#2563eb' : '#888'} />
                <Text style={styles.addressTypeText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addressTypeBtn, extraDetails.addressType === 'Work' && styles.addressTypeSelected]}
                onPress={() => setExtraDetails({ ...extraDetails, addressType: 'Work' })}
              >
                <FontAwesome5 name="building" size={18} color={extraDetails.addressType === 'Work' ? '#2563eb' : '#888'} />
                <Text style={styles.addressTypeText}>Work</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addressTypeBtn, extraDetails.addressType === 'Hotel' && styles.addressTypeSelected]}
                onPress={() => setExtraDetails({ ...extraDetails, addressType: 'Hotel' })}
              >
                <FontAwesome5 name="hotel" size={18} color={extraDetails.addressType === 'Hotel' ? '#2563eb' : '#888'} />
                <Text style={styles.addressTypeText}>Hotel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addressTypeBtn, extraDetails.addressType === 'Other' && styles.addressTypeSelected]}
                onPress={() => setExtraDetails({ ...extraDetails, addressType: 'Other' })}
              >
                <MaterialCommunityIcons name="map-marker" size={20} color={extraDetails.addressType === 'Other' ? '#2563eb' : '#888'} />
                <Text style={styles.addressTypeText}>Other</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="House number *"
              value={extraDetails.houseNumber}
              onChangeText={t => setExtraDetails({ ...extraDetails, houseNumber: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Floor *"
              value={extraDetails.floor}
              onChangeText={t => setExtraDetails({ ...extraDetails, floor: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Tower / Block (optional)"
              value={extraDetails.block}
              onChangeText={t => setExtraDetails({ ...extraDetails, block: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Nearby landmark (optional)"
              value={extraDetails.landmark}
              onChangeText={t => setExtraDetails({ ...extraDetails, landmark: t })}
            />
            <TouchableOpacity
              style={styles.saveBtnGreen}
              onPress={() => {
                setShowDetailsSheet(false);
                handleSaveFullAddress();
              }}
            >
              <Text style={styles.saveBtnGreenText}>Save address</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Modal>
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
  addButton: {
    backgroundColor: '#fff',
    borderColor: '#2563eb',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  addButtonText: {
    color: '#2563eb',
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
  addressCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addressLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  addressDistance: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: 'bold',
  },
  addressDetail: {
    color: '#555',
    fontSize: 14,
    marginTop: 2,
  },
  addressPhone: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
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
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  addressText: {
    fontSize: 16,
    color: '#222',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeButton: {
    backgroundColor: '#6b7280',
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
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: '60%',
    maxHeight: '80%',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
});

export default ChooseAddressModal; 