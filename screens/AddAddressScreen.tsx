import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Modal, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const mockAddress = {
  name: 'Sumadhura Vasantham',
  details: 'NCPR Industrial Layout, Doddanakundi Industrial Area ...',
};

const AddAddressScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState('');
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [location, setLocation] = useState<Region | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  
  // Address form state
  const [orderingFor, setOrderingFor] = useState<'Myself' | 'Someone else'>('Myself');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Hotel' | 'Other'>('Home');
  const [houseNumber, setHouseNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [tower, setTower] = useState('');
  const [landmark, setLandmark] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 9346048610');
  
  // Saved address state
  const [savedAddress, setSavedAddress] = useState({
    name: 'Sumadhura Vasantham',
    details: 'NCPR Industrial Layout, Doddanakundi Industrial Area ...',
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to add your address.');
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

  // When opening modal, prefill with last saved values
  const openDetailsModal = () => {
    if (!location) {
      Alert.alert('Error', 'Please select a location on the map before adding address details.');
      return;
    }
    setOrderingFor(orderingFor);
    setAddressType(addressType);
    setHouseNumber(houseNumber);
    setFloor(floor);
    setTower(tower);
    setLandmark(landmark);
    setName(name);
    setPhone(phone);
    setDetailsModalVisible(true);
  };

  // Save address handler
  const handleSaveAddress = async () => {
    try {
      // Validation: require houseNumber, floor, name, addressType, and location
      if (!location) {
        Alert.alert('Error', 'Location is required to save address');
        return;
      }
      if (!houseNumber || !houseNumber.trim()) {
        Alert.alert('Error', 'House number is required');
        return;
      }
      if (!floor || !floor.trim()) {
        Alert.alert('Error', 'Floor is required');
        return;
      }
      if (!name || !name.trim()) {
        Alert.alert('Error', 'Name is required');
        return;
      }
      if (!addressType || !addressType.trim()) {
        Alert.alert('Error', 'Please select address type (Home, Work, etc.)');
        return;
      }
      // Compose address string
      const details = `${houseNumber ? houseNumber + ', ' : ''}${floor ? 'Floor ' + floor + ', ' : ''}${tower ? tower + ', ' : ''}${landmark ? landmark + ', ' : ''}${addressType}`;
      const addressData = {
        name: name || (orderingFor === 'Myself' ? 'My Address' : 'Recipient'),
        address: address || details,
        type: addressType.toLowerCase(),
        latitude: location.latitude,
        longitude: location.longitude,
        landmark: landmark || '',
        city: '',
        state: '',
        pincode: '',
        isDefault: true // Set as default address
      };
      console.log('Saving address to backend:', addressData);
      const response = await apiService.addAddress(addressData);
      console.log('Address saved successfully:', response);
      setSavedAddress({
        name: addressData.name,
        details: addressData.address,
      });
      setDetailsModalVisible(false);
      Alert.alert('Success', 'Address saved successfully!');
      // Navigate back or to next screen
      navigation.goBack();
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnImproved}>
          <Text style={styles.backArrowImproved}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add address</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a new area, locality..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      
      {/* Map */}
      <View style={styles.mapContainer}>
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
      
      {/* Use current location */}
      <TouchableOpacity style={styles.useLocationBtn} onPress={getCurrentLocation}>
        <Text style={styles.useLocationText}>Use current location</Text>
      </TouchableOpacity>
      
      {/* Delivering your order to section at the bottom */}
      <View style={styles.addressBox}>
        <Text style={styles.deliverTitle}>Delivering your order to</Text>
        <View style={styles.addressCard}>
          <Text style={styles.addressPin}>📍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.addressName}>{savedAddress.name}</Text>
            <Text style={styles.addressDetails}>{address || savedAddress.details}</Text>
          </View>
          <TouchableOpacity style={styles.changeBtn} onPress={openDetailsModal}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Add more address details button at the very bottom */}
      <TouchableOpacity style={styles.addMoreBtnImproved} onPress={openDetailsModal}>
        <Text style={styles.addMoreTextImproved}>Add more address details ▶</Text>
      </TouchableOpacity>
      
      {/* Address Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.detailsModalHalfScreenOverlay}>
          <View style={styles.detailsModalHalfScreen}>
            <View style={styles.detailsModalHandle} />
            <ScrollView contentContainerStyle={styles.detailsModalScrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.detailsHeaderRow}>
                <Text style={styles.detailsTitle}>Enter complete address</Text>
                <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                  <Text style={styles.detailsClose}>×</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.detailsLabel}>Who you are ordering for?</Text>
              <View style={styles.detailsRadioRow}>
                <TouchableOpacity style={styles.detailsRadioBtn} onPress={() => setOrderingFor('Myself')}>
                  <View style={orderingFor === 'Myself' ? styles.detailsRadioCircleGreen : styles.detailsRadioCircleOutline} />
                  <Text style={styles.detailsRadioText}>Myself</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detailsRadioBtn} onPress={() => setOrderingFor('Someone else')}>
                  <View style={orderingFor === 'Someone else' ? styles.detailsRadioCircleGreen : styles.detailsRadioCircleOutline} />
                  <Text style={styles.detailsRadioText}>Someone else</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.detailsLabel}>Save address as *</Text>
              <View style={styles.detailsSaveAsRow}>
                <TouchableOpacity style={addressType === 'Home' ? styles.detailsSaveAsBtnActiveGreen : styles.detailsSaveAsBtnOutline} onPress={() => setAddressType('Home')}><Text style={addressType === 'Home' ? styles.detailsSaveAsTextActiveGreen : styles.detailsSaveAsText}>🏠 Home</Text></TouchableOpacity>
                <TouchableOpacity style={addressType === 'Work' ? styles.detailsSaveAsBtnActiveGreen : styles.detailsSaveAsBtnOutline} onPress={() => setAddressType('Work')}><Text style={addressType === 'Work' ? styles.detailsSaveAsTextActiveGreen : styles.detailsSaveAsText}>🏢 Work</Text></TouchableOpacity>
                <TouchableOpacity style={addressType === 'Hotel' ? styles.detailsSaveAsBtnActiveGreen : styles.detailsSaveAsBtnOutline} onPress={() => setAddressType('Hotel')}><Text style={addressType === 'Hotel' ? styles.detailsSaveAsTextActiveGreen : styles.detailsSaveAsText}>🏨 Hotel</Text></TouchableOpacity>
                <TouchableOpacity style={addressType === 'Other' ? styles.detailsSaveAsBtnActiveGreen : styles.detailsSaveAsBtnOutline} onPress={() => setAddressType('Other')}><Text style={addressType === 'Other' ? styles.detailsSaveAsTextActiveGreen : styles.detailsSaveAsText}>📍 Other</Text></TouchableOpacity>
              </View>
              <TextInput style={styles.detailsInputModern} placeholder="House number *" value={houseNumber} onChangeText={setHouseNumber} />
              <TextInput style={styles.detailsInputModern} placeholder="Floor *" value={floor} onChangeText={setFloor} />
              <TextInput style={styles.detailsInputModern} placeholder="Tower / Block (optional)" value={tower} onChangeText={setTower} />
              <TextInput style={styles.detailsInputModern} placeholder="Nearby landmark (optional)" value={landmark} onChangeText={setLandmark} />
              <Text style={styles.detailsLabel}>Enter your details for seamless delivery experience</Text>
              <TextInput style={styles.detailsInputModern} placeholder="Your name *" value={name} onChangeText={setName} />
              <TextInput style={styles.detailsInputModern} placeholder="Your phone number (optional)" value={phone} onChangeText={setPhone} />
            </ScrollView>
            <TouchableOpacity style={styles.saveAddressBtnGreen} onPress={handleSaveAddress}>
              <Text style={styles.saveAddressTextGreen}>Save address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  backBtnImproved: {
    padding: 8,
    marginRight: 8,
  },
  backArrowImproved: {
    fontSize: 24,
    color: '#222',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 18,
    color: '#888',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  useLocationBtn: {
    backgroundColor: '#2563eb',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  useLocationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addressBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  deliverTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  addressPin: {
    fontSize: 20,
    marginRight: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  addressDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  changeBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addMoreBtnImproved: {
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addMoreTextImproved: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal styles
  detailsModalHalfScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  detailsModalHalfScreen: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  detailsModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  detailsModalScrollContent: {
    padding: 20,
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  detailsClose: {
    fontSize: 24,
    color: '#666',
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    marginTop: 16,
  },
  detailsRadioRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailsRadioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  detailsRadioCircleGreen: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    marginRight: 8,
  },
  detailsRadioCircleOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 8,
  },
  detailsRadioText: {
    fontSize: 16,
    color: '#222',
  },
  detailsSaveAsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailsSaveAsBtnActiveGreen: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  detailsSaveAsBtnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  detailsSaveAsTextActiveGreen: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailsSaveAsText: {
    color: '#666',
    fontSize: 14,
  },
  detailsInputModern: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveAddressBtnGreen: {
    backgroundColor: '#22c55e',
    margin: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveAddressTextGreen: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default AddAddressScreen; 