import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TextInput as RNTextInput, Dimensions, Alert, ScrollView, TouchableOpacity, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/AuthStack';
import apiService from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const INDIA_FLAG = 'https://flagcdn.com/in.svg';

const PhoneInputScreen: React.FC<{
  navigation: StackNavigationProp<AuthStackParamList, 'PhoneInput'>;
  route: RouteProp<AuthStackParamList, 'PhoneInput'>;
}> = ({ navigation, route }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { onLogin } = route.params;

  // Animation values for bouncing icons in blue area
  const icon1Anim = new Animated.ValueXY({ x: 30, y: 100 });
  const icon2Anim = new Animated.ValueXY({ x: width - 80, y: 150 });
  const icon3Anim = new Animated.ValueXY({ x: 50, y: 200 });
  const icon4Anim = new Animated.ValueXY({ x: width - 100, y: 80 });
  const icon5Anim = new Animated.ValueXY({ x: 80, y: 120 });
  const icon6Anim = new Animated.ValueXY({ x: width - 120, y: 180 });
  const icon7Anim = new Animated.ValueXY({ x: 120, y: 90 });
  const icon8Anim = new Animated.ValueXY({ x: width - 60, y: 220 });

  useEffect(() => {
    // Bouncing animation for icons in blue area
    const blueAreaWidth = width - 60; // Full width minus padding
    const blueAreaHeight = 300; // Keep icons within the blue area only

    const createBounceAnimation = (anim: Animated.ValueXY, startX: number, startY: number) => {
      const bounceX = Animated.loop(
        Animated.sequence([
          Animated.timing(anim.x, {
            toValue: blueAreaWidth - 50,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.x, {
            toValue: 30,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ])
      );

      const bounceY = Animated.loop(
        Animated.sequence([
          Animated.timing(anim.y, {
            toValue: blueAreaHeight - 50,
            duration: 2500 + Math.random() * 1500,
            useNativeDriver: true,
          }),
          Animated.timing(anim.y, {
            toValue: 80,
            duration: 2500 + Math.random() * 1500,
            useNativeDriver: true,
          }),
        ])
      );

      return { bounceX, bounceY };
    };

    const icon1Bounce = createBounceAnimation(icon1Anim, 30, 100);
    const icon2Bounce = createBounceAnimation(icon2Anim, width - 80, 150);
    const icon3Bounce = createBounceAnimation(icon3Anim, 50, 200);
    const icon4Bounce = createBounceAnimation(icon4Anim, width - 100, 80);
    const icon5Bounce = createBounceAnimation(icon5Anim, 80, 120);
    const icon6Bounce = createBounceAnimation(icon6Anim, width - 120, 180);
    const icon7Bounce = createBounceAnimation(icon7Anim, 120, 90);
    const icon8Bounce = createBounceAnimation(icon8Anim, width - 60, 220);

    // Start bouncing animations
    icon1Bounce.bounceX.start();
    icon1Bounce.bounceY.start();
    icon2Bounce.bounceX.start();
    icon2Bounce.bounceY.start();
    icon3Bounce.bounceX.start();
    icon3Bounce.bounceY.start();
    icon4Bounce.bounceX.start();
    icon4Bounce.bounceY.start();
    icon5Bounce.bounceX.start();
    icon5Bounce.bounceY.start();
    icon6Bounce.bounceX.start();
    icon6Bounce.bounceY.start();
    icon7Bounce.bounceX.start();
    icon7Bounce.bounceY.start();
    icon8Bounce.bounceX.start();
    icon8Bounce.bounceY.start();

    return () => {
      icon1Bounce.bounceX.stop();
      icon1Bounce.bounceY.stop();
      icon2Bounce.bounceX.stop();
      icon2Bounce.bounceY.stop();
      icon3Bounce.bounceX.stop();
      icon3Bounce.bounceY.stop();
      icon4Bounce.bounceX.stop();
      icon4Bounce.bounceY.stop();
      icon5Bounce.bounceX.stop();
      icon5Bounce.bounceY.stop();
      icon6Bounce.bounceX.stop();
      icon6Bounce.bounceY.stop();
      icon7Bounce.bounceX.stop();
      icon7Bounce.bounceY.stop();
      icon8Bounce.bounceX.stop();
      icon8Bounce.bounceY.stop();
    };
  }, []);

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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd']}
          style={styles.gradient}
        >
          {/* Bouncing medical icons in blue area */}
          <View style={styles.bouncingIconsContainer}>
            <Animated.View style={[styles.bouncingIcon, { transform: icon1Anim.getTranslateTransform() }]}>
              <Text style={styles.iconText}>🏥</Text>
            </Animated.View>
            <Animated.View style={[styles.bouncingIcon, { transform: icon2Anim.getTranslateTransform() }]}>
              <Text style={styles.iconText}>👨‍⚕️</Text>
            </Animated.View>
            <Animated.View style={[styles.bouncingIcon, { transform: icon3Anim.getTranslateTransform() }]}>
              <Text style={styles.iconText}>💊</Text>
            </Animated.View>
            <Animated.View style={[styles.bouncingIcon, { transform: icon4Anim.getTranslateTransform() }]}>
              <Text style={styles.iconText}>🚑</Text>
            </Animated.View>
            <Animated.View style={[styles.bouncingIcon, { transform: icon5Anim.getTranslateTransform() }]}>
              <Text style={styles.iconText}>🩺</Text>
            </Animated.View>
            <Animated.View style={[styles.bouncingIcon, { transform: icon6Anim.getTranslateTransform() }]}>
              <Text style={styles.iconText}>🩹</Text>
            </Animated.View>
            <Animated.View style={[styles.bouncingIcon, { transform: icon7Anim.getTranslateTransform() }]}>
              <Text style={styles.iconText}>💉</Text>
            </Animated.View>
            <Animated.View style={[styles.bouncingIcon, { transform: icon8Anim.getTranslateTransform() }]}>
              <Text style={styles.iconText}>🩻</Text>
            </Animated.View>
          </View>

          {/* Login form */}
          <View style={styles.formContainer}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome to ExpressAid</Text>
              <Text style={styles.welcomeSubtitle}>
                Connect with qualified healthcare professionals for immediate medical assistance
              </Text>
            </View>

            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>Enter your mobile number</Text>
                <Text style={styles.inputDescription}>
                  We'll send you a secure OTP to verify your identity
                </Text>
              </View>
              
              <View style={styles.inputRow}>
                <View style={styles.flagBox}>
                  <Image source={{ uri: INDIA_FLAG }} style={styles.flag} />
                  <Text style={styles.countryCode}>+91</Text>
                </View>
                <RNTextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, phone.length === 10 && styles.buttonActive]}
              onPress={handleNext}
              disabled={phone.length !== 10 || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Sending OTP...</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={phone.length === 10 ? ['#3b82f6', '#1e40af'] : ['#cbd5e1', '#94a3b8']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Continue with OTP</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
    minHeight: height,
  },
  bouncingIconsContainer: {
    position: 'absolute',
    width: '100%',
    height: 300, // Keep icons within blue area only
    zIndex: 1,
  },
  bouncingIcon: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconText: {
    fontSize: 24,
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 24,
    paddingTop: 35,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    marginTop: 250, // Adjusted to prevent overlap with bouncing icons
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 35,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: 35,
  },
  inputHeader: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  inputDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    height: 65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  flagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  flag: {
    width: 26,
    height: 18,
    borderRadius: 2,
    marginRight: 8,
  },
  countryCode: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 17,
  },
  input: {
    flex: 1,
    fontSize: 19,
    color: '#1e293b',
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    borderRadius: 18,
    marginBottom: 35,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonActive: {
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#cbd5e1',
  },
  loadingText: {
    color: '#64748b',
    fontWeight: 'bold',
    fontSize: 18,
  },
  terms: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default PhoneInputScreen; 