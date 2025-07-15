import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeleteProfileScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDelete = () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            setLoading(true);
            try {
              await api.deleteProfile();
              await AsyncStorage.clear();
              setLoading(false);
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (err) {
              setLoading(false);
              Alert.alert('Error', 'Failed to delete profile. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Profile</Text>
      </View>
      <Animated.View style={[styles.card, { opacity: fadeAnim }] }>
        <Feather name="user-x" size={48} color="#ff3b30" style={{ alignSelf: 'center', marginBottom: 18 }} />
        <Text style={styles.title}>Delete Profile</Text>
        <Text style={styles.warning}>This will permanently delete your account and all data. This action cannot be undone.</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={loading} accessibilityLabel="Delete Profile">
          <Text style={styles.deleteText}>{loading ? 'Deleting...' : 'Delete Profile'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 16, paddingHorizontal: 18, backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, zIndex: 10 },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, margin: 24, marginTop: 32, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  title: { fontSize: 22, fontWeight: 'bold', color: '#ff3b30', marginBottom: 10, textAlign: 'center' },
  warning: { fontSize: 15, color: '#444', marginBottom: 24, textAlign: 'center' },
  deleteBtn: { backgroundColor: '#ff3b30', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default DeleteProfileScreen; 