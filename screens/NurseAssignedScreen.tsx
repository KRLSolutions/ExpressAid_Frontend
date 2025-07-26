import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const { width } = Dimensions.get('window');

const NurseAssignedScreen = ({ route }: any) => {
  const { order } = route.params || {};
  const navigation = useNavigation();
  const mapRef = useRef<any>(null);
  const [eta, setEta] = useState('');
  const [distance, setDistance] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{latitude: number, longitude: number}>>([]);
  // Fixed distance for consistent display
  const [fakeDistance] = useState('6.5 km');
  // Countdown timer (15:00)
  const [timer, setTimer] = useState(15 * 60); // seconds

  const userLocation = order?.address
    ? { latitude: order.address.latitude, longitude: order.address.longitude }
    : { latitude: 12.9716, longitude: 77.5946 };

  const nurseLocation = order?.nurse?.location?.coordinates
    ? { latitude: order.nurse.location.coordinates[1], longitude: order.nurse.location.coordinates[0] }
    : { latitude: 12.9716, longitude: 77.5946 };

  // Fetch directions from backend
  const fetchDirections = async () => {
    try {
      console.log('NurseAssignedScreen: Fetching directions...');
      console.log('Nurse location:', nurseLocation);
      console.log('User location:', userLocation);
      
      const data = await api.getDirections(
        { lat: nurseLocation.latitude, lng: nurseLocation.longitude },
        { lat: userLocation.latitude, lng: userLocation.longitude }
      );
      
      console.log('NurseAssignedScreen: Directions data received:', data);
      
      if (data.polyline) {
        // Decode polyline to get coordinates
        const coordinates = decodePolyline(data.polyline);
        console.log('NurseAssignedScreen: Decoded coordinates count:', coordinates.length);
        setRouteCoordinates(coordinates);
        setEta(data.duration?.text || 'Calculating...');
        setDistance(data.distance?.text || 'Calculating...');
        console.log('NurseAssignedScreen: Set ETA:', data.duration?.text, 'Distance:', data.distance?.text);
      } else {
        console.log('NurseAssignedScreen: No polyline in response');
      }
    } catch (error) {
      console.error('NurseAssignedScreen: Error fetching directions:', error);
      setEta('Unable to calculate');
      setDistance('Unable to calculate');
    }
  };

  // Decode Google polyline
  const decodePolyline = (encoded: string) => {
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let shift = 0, result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result >= 0x20);

      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result >= 0x20);

      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({
        latitude: lat / 1E5,
        longitude: lng / 1E5
      });
    }

    return poly;
  };

  useEffect(() => {
    if (order?.nurse && order?.address) {
      fetchDirections();
    }
  }, [order]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const timerMinutes = Math.floor(timer / 60).toString().padStart(2, '0');
  const timerSeconds = (timer % 60).toString().padStart(2, '0');

  // 5-star rating (default)
  const renderStars = () => (
    <View style={styles.starsRow}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={styles.star}>★</Text>
      ))}
    </View>
  );

  // Helper for experience display
  const getExperienceText = (exp: number | undefined) => {
    if (exp === 0 || exp === undefined || exp === null) return 'Experienced';
    if (exp === 1) return '1 year experience';
    return `${exp} years experience`;
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
              <TouchableOpacity style={styles.backBtn} onPress={() => (navigation as any).navigate('MainDrawer', { screen: 'Home' })}>
        <Text style={styles.backBtnText}>←</Text>
      </TouchableOpacity>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: (userLocation.latitude + nurseLocation.latitude) / 2,
          longitude: (userLocation.longitude + nurseLocation.longitude) / 2,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* User marker */}
        <Marker coordinate={userLocation} title="Your Location">
          <View style={styles.userMarker}>
            <Text style={styles.markerText}>📍</Text>
          </View>
        </Marker>
        {/* Nurse marker */}
        <Marker coordinate={nurseLocation} title={order?.nurse?.name || 'Nurse'}>
          <Image
            source={{ uri: order?.nurse?.profileImage || 'https://via.placeholder.com/60x60/007AFF/FFFFFF?text=N' }}
            style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#2563eb' }}
          />
        </Marker>
        {/* Route polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="#2563eb"
          />
        )}
      </MapView>

      {/* Floating Card - Modern UI */}
      <View style={styles.floatingCard}>
        {/* Title */}
        <Text style={styles.viewNurseTitle}>View Nurse</Text>
        {/* ETA and Distance Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerEta}>{eta ? `Nurse arriving in ${eta}` : 'Searching for nurse...'}</Text>
          {distance && <Text style={styles.headerDistance}>{distance}</Text>}
        </View>
        {/* Divider */}
        <View style={styles.divider} />
        {/* Nurse Details Card */}
        <View style={styles.nurseCard}>
          <Image
            source={{ uri: order?.nurse?.profileImage || 'https://via.placeholder.com/60x60/007AFF/FFFFFF?text=N' }}
            style={styles.nurseAvatar}
          />
          <View style={styles.nurseCardDetails}>
            <Text style={styles.nurseCardName}>{order?.nurse?.name || 'Nurse Assigned'}</Text>
            <Text style={styles.nurseCardPhone}>{order?.nurse?.phoneNumber || ''}</Text>
            <Text style={styles.nurseCardRole}>{getExperienceText(order?.nurse?.experience)}</Text>
            {renderStars()}
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        </View>
        {/* Custom Info Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2563eb' }}>10</Text>
            <Text style={{ fontSize: 13, color: '#64748b' }}>Orders Completed</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2563eb' }}>{fakeDistance}</Text>
            <Text style={{ fontSize: 13, color: '#64748b' }}>Distance</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2563eb' }}>{timerMinutes}:{timerSeconds}</Text>
            <Text style={{ fontSize: 13, color: '#64748b' }}>Arrival Timer</Text>
          </View>
        </View>
        {/* Order Details */}
        <View style={styles.orderDetailsRow}>
          <Text style={styles.orderDetailsTitle}>Order Details</Text>
          <Text style={styles.orderDetailsTotal}>₹{order?.total}</Text>
        </View>
        <Text style={styles.orderDetailsItems}>
          {order?.items?.map((item: any, index: number) =>
            `${item.name} (${item.quantity})${index < order.items.length - 1 ? ', ' : ''}`
          ).join('')}
        </Text>
        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]}><Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>💬 Chat</Text></TouchableOpacity>
        </View>
      </View>

      {/* Navigation Anchor */}
      <View style={styles.navigationAnchor}>
        <TouchableOpacity 
          style={styles.anchorButton}
          onPress={() => (navigation as any).navigate('MainDrawer', { screen: 'Home' })}
        >
          <Text style={styles.anchorButtonText}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.anchorButton}
          onPress={() => navigation.navigate('Cart' as never)}
        >
          <Text style={styles.anchorButtonText}>🛒 Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  userMarker: { backgroundColor: '#22c55e', borderRadius: 20, padding: 8, borderWidth: 2, borderColor: '#fff' },
  markerText: { fontSize: 16 },
  backBtn: { position: 'absolute', top: 44, left: 16, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 4 },
  backBtnText: { fontSize: 22, color: '#2563eb', fontWeight: 'bold' },
  floatingCard: { position: 'absolute', left: 0, right: 0, bottom: 80, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 16 },
  viewNurseTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 4, textAlign: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerEta: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  headerDistance: { fontSize: 15, color: '#2563eb', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 10 },
  nurseCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  nurseAvatar: { width: 54, height: 54, borderRadius: 27, marginRight: 12, borderWidth: 2, borderColor: '#2563eb' },
  nurseCardDetails: { flex: 1 },
  nurseCardName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  nurseCardPhone: { fontSize: 14, color: '#64748b', marginBottom: 2 },
  nurseCardRole: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  starsRow: { flexDirection: 'row', marginTop: 2 },
  star: { color: '#fbbf24', fontSize: 16, marginRight: 2 },
  callButton: { backgroundColor: '#f1f5f9', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16, marginLeft: 8 },
  callButtonText: { fontSize: 15, color: '#2563eb', fontWeight: 'bold' },
  orderDetailsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  orderDetailsTitle: { fontSize: 15, color: '#64748b' },
  orderDetailsTotal: { fontSize: 16, fontWeight: 'bold', color: '#2563eb' },
  orderDetailsItems: { fontSize: 14, color: '#222', marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionBtn: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  actionBtnPrimary: { backgroundColor: '#2563eb' },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  actionBtnTextPrimary: { color: '#fff' },
  navigationAnchor: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  anchorButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  anchorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
});

export default NurseAssignedScreen; 