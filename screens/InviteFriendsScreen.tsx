import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

const appLink = 'https://yourapp.com/invite'; // Placeholder link

const InviteFriendsScreen = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Expressaid! Get healthcare at your doorstep. Sign up here: ${appLink}`,
        url: appLink,
      });
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Friends</Text>
      </View>
      {/* Big Invite Card */}
      <Animated.View style={[styles.card, { opacity: fadeAnim }] }>
        <Feather name="users" size={48} color="#2563eb" style={{ alignSelf: 'center', marginBottom: 18 }} />
        <Text style={styles.title}>Invite your friends & family!</Text>
        <Text style={styles.subtitle}>Share the app link below and help your loved ones get healthcare at their doorstep.</Text>
        <TouchableOpacity style={styles.inviteBtn} onPress={handleShare} accessibilityLabel="Invite Friends">
          <Feather name="share-2" size={22} color="#fff" />
          <Text style={styles.inviteText}>Invite Friends</Text>
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
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 32, margin: 24, marginTop: 40, elevation: 5, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#444', marginBottom: 28, textAlign: 'center' },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, marginTop: 10 },
  inviteText: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 10 },
});

export default InviteFriendsScreen; 