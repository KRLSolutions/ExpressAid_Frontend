import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

const mockNotifications = [
  { id: '1', icon: 'clipboard', text: 'Order #1234 confirmed', read: false },
  { id: '2', icon: 'user-check', text: 'Nurse assigned: Anita Sharma arriving in 15 mins', read: false },
  { id: '3', icon: 'package', text: 'Pharmacy order delivered', read: true },
  { id: '4', icon: 'bell', text: 'Promotional offer: 10% off on next order', read: true },
];

const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const markAll = (read: boolean) => {
    setNotifications(notifications.map(n => ({ ...n, read })));
  };

  const renderNotification = ({ item }: any) => (
    <Animated.View style={[styles.notificationCard, { opacity: fadeAnim }] }>
      <Feather name={item.icon} size={22} color={item.read ? '#888' : '#2563eb'} style={{ marginRight: 12 }} />
      <Text style={[styles.text, { fontWeight: item.read ? '400' : 'bold', color: item.read ? '#444' : '#222' }]}>{item.text}</Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
          <TouchableOpacity onPress={() => markAll(true)} style={styles.markBtn} accessibilityLabel="Mark all as read">
            <Feather name="check-circle" size={18} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => markAll(false)} style={styles.markBtn} accessibilityLabel="Mark all as unread">
            <Feather name="circle" size={18} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        style={{ marginTop: 12 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 16, paddingHorizontal: 18, backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, zIndex: 10 },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  markBtn: { marginLeft: 12, padding: 6 },
  notificationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 18, marginHorizontal: 18, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  text: { fontSize: 16 },
});

export default NotificationsScreen; 