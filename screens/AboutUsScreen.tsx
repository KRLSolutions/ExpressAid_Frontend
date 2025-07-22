import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

const AboutUsScreen = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }] }>
          <Text style={styles.title}>About Us</Text>
          <Text style={styles.mission}>
            “We bring healthcare to your doorstep. Certified nurses, verified doctors & trusted pharmacies — all just a tap away.”
          </Text>
          <Text style={styles.sectionTitle}>Our Vision</Text>
          <Text style={styles.text}>
            To make quality healthcare accessible, affordable, and convenient for every family. We believe in compassion, trust, and technology to deliver care where it matters most: your home.
          </Text>
          <Text style={styles.sectionTitle}>Company Background</Text>
          <Text style={styles.text}>
            Founded in 2023, our team is passionate about transforming healthcare delivery in India. We partner with certified professionals and trusted pharmacies to ensure safety and reliability.
          </Text>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactRow}>
            <Feather name="mail" size={18} color="#2563eb" />
            <TouchableOpacity onPress={() => Linking.openURL('mailto:support@yourapp.com')}>
              <Text style={styles.contactText}>support@yourapp.com</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contactRow}>
            <Feather name="phone" size={18} color="#2563eb" />
            <Text style={styles.contactText}>+91 98765 43210</Text>
          </View>
          <View style={styles.contactRow}>
            <Feather name="map-pin" size={18} color="#2563eb" />
            <Text style={styles.contactText}>Bangalore, India</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 16, paddingHorizontal: 18, backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, zIndex: 10 },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, margin: 24, marginTop: 32, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 10 },
  mission: { fontSize: 16, fontStyle: 'italic', color: '#2563eb', marginBottom: 18 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2563eb', marginTop: 18, marginBottom: 6 },
  text: { fontSize: 15, color: '#444', marginBottom: 8 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  contactText: { fontSize: 15, color: '#2563eb', marginLeft: 8 },
});

export default AboutUsScreen; 