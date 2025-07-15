import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, TextInput as RNTextInput, ImageBackground, Dimensions, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/AuthStack';
import apiService from '../services/api';

const { width, height } = Dimensions.get('window');
const INDIA_FLAG = 'https://flagcdn.com/in.svg';

const PhoneInputScreen: React.FC<{
  navigation: StackNavigationProp<AuthStackParamList, 'PhoneInput'>;
  route: RouteProp<AuthStackParamList, 'PhoneInput'>;
}> = ({ navigation, route }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { onLogin } = route.params;

  const handleNext = async () => {
    if (phone.length >= 10) {
      setLoading(true);
      try {
        const phoneNumber = '+91' + phone;
        const response = await apiService.sendOTP(phoneNumber);
        
        console.log('OTP sent successfully:', response);
        
        // Navigate to OTP screen with the phone number
        navigation.navigate('OTP', { 
          phoneNumber, 
          onLogin,
          otp: response.otp // For development - remove in production
        });
      } catch (error) {
        console.error('Error sending OTP:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP. Please try again.';
        Alert.alert(
          'Error',
          errorMessage,
          [{ text: 'OK' }]
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ImageBackground source={require('../assets/bg.png')} style={styles.bg}>
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.title}>Login / Signup</Text>
        <Text style={styles.subtitle}>Enter your phone number to start saving.</Text>
        <View style={styles.inputRow}>
          <View style={styles.flagBox}>
            <Image source={{ uri: INDIA_FLAG }} style={styles.flag} />
            <Text style={styles.countryCode}>+91</Text>
          </View>
          <RNTextInput
            style={styles.input}
            placeholder="Enter Phone Number"
            placeholderTextColor="#cbd5e1"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonLabel}
          onPress={handleNext}
          disabled={phone.length !== 10 || loading}
          loading={loading}
        >
          Send OTP
        </Button>
        <Text style={styles.terms}>By proceeding, you accept Terms and Conditions. Read the Privacy policy here.</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  content: {
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 32,
  },
  subtitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 24,
    width: '100%',
    height: 56,
  },
  flagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  flag: {
    width: 28,
    height: 20,
    borderRadius: 4,
    marginRight: 4,
  },
  countryCode: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    marginTop: 8,
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  terms: {
    color: '#fff',
    fontSize: 12,
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
    width: '100%',
    fontWeight: '400',
  },
});

export default PhoneInputScreen; 