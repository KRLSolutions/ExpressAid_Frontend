import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput as RNTextInput, TouchableOpacity, Dimensions, Alert, ScrollView, Animated, KeyboardAvoidingView, Platform, AppState } from 'react-native';
import { Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/AuthStack';
import apiService from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useSMSAutoFill } from '../hooks/useSMSAutoFill';

const { width, height } = Dimensions.get('window');
const OTP_LENGTH = 6;
const RESEND_TIME = 10;

const OTPScreen: React.FC<{
  navigation: StackNavigationProp<AuthStackParamList, 'OTP'>;
  route: RouteProp<AuthStackParamList, 'OTP'>;
}> = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(RESEND_TIME);
  const [loading, setLoading] = useState(false);
  const { phoneNumber, onLogin, otp: devOtp } = route.params;
  const inputRef = useRef<RNTextInput>(null);

  // Animation values for bouncing icons in blue area
  const icon1Anim = new Animated.ValueXY({ x: 30, y: 100 });
  const icon2Anim = new Animated.ValueXY({ x: width - 80, y: 150 });
  const icon3Anim = new Animated.ValueXY({ x: 50, y: 200 });
  const icon4Anim = new Animated.ValueXY({ x: width - 100, y: 80 });
  const icon5Anim = new Animated.ValueXY({ x: 80, y: 120 });
  const icon6Anim = new Animated.ValueXY({ x: width - 120, y: 180 });
  const icon7Anim = new Animated.ValueXY({ x: 120, y: 90 });
  const icon8Anim = new Animated.ValueXY({ x: width - 60, y: 220 });

  // SMS Auto-fill hook
  const { smsPermission, isListening, startListening, stopListening } = useSMSAutoFill({
    onOTPReceived: (receivedOtp) => {
      console.log('Auto-filling OTP:', receivedOtp);
      setOtp(receivedOtp);
    },
    phoneNumber,
  });

  // Auto-fill OTP in development mode
  useEffect(() => {
    if (devOtp) {
      setOtp(devOtp);
    }
  }, [devOtp]);

  // Start listening for SMS when component mounts
  useEffect(() => {
    startListening();
    
    // Cleanup when component unmounts
    return () => {
      stopListening();
    };
  }, []);

  // Add focus listener to handle input focus issues
  useEffect(() => {
    const handleFocus = () => {
      // Ensure input is properly focused when screen gains focus
      if (inputRef.current) {
        inputRef.current.setNativeProps({ editable: true });
      }
    };

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        handleFocus();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

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

  const handleOtpChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtp(numericValue);
  };

  const focusInput = () => {
    // Ensure input is focused and editable
    if (inputRef.current) {
      // First ensure the input is editable
      inputRef.current.setNativeProps({ editable: true });
      // Then focus it
      inputRef.current.focus();
      // Additional focus attempt with slight delay to ensure it works
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await apiService.sendOTP(phoneNumber);
      setTimer(RESEND_TIME);
      setOtp(''); // Clear previous OTP
      Alert.alert('Success', 'OTP resent successfully!');
      
      // Re-focus the input after resending
      setTimeout(() => {
        focusInput();
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length === OTP_LENGTH) {
      setLoading(true);
      try {
        const response = await apiService.verifyOTP(phoneNumber, otp);
        
        console.log('✅ OTP verified successfully:', response);
        console.log('🔑 Token received:', response.token ? `${response.token.substring(0, 20)}...` : 'null');
        
        // Verify token was saved
        const savedToken = await AsyncStorage.getItem('userToken');
        console.log('💾 Token saved to storage:', savedToken ? `${savedToken.substring(0, 20)}...` : 'null');
        
        // Check if user has profile
        if (response.user.hasProfile) {
          // User has complete profile, save userData and go to home
          await AsyncStorage.setItem('userData', JSON.stringify(response.user));
          console.log('💾 User data saved');
          onLogin(response.user);
        } else {
          // User needs to complete profile
          console.log('📝 User needs to complete profile');
          navigation.navigate('ProfileSetup', { phoneNumber, onLogin });
        }
      } catch (error) {
        console.error('❌ Error verifying OTP:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP. Please try again.';
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < OTP_LENGTH; i++) {
      boxes.push(
        <View key={i} style={[styles.otpBox, otp[i] && styles.otpBoxFilled]}>
          <Text style={[styles.otpText, otp[i] && styles.otpTextFilled]}>{otp[i] || ''}</Text>
        </View>
      );
    }
    return boxes;
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

          {/* OTP form */}
          <View style={styles.formContainer}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Verify OTP</Text>
              <Text style={styles.welcomeSubtitle}>
                Enter the 6-digit code sent to {phoneNumber}
              </Text>
            </View>

            <View style={styles.otpSection}>
              <View style={styles.otpHeader}>
                <Text style={styles.otpLabel}>Enter OTP Code</Text>
                <Text style={styles.otpDescription}>
                  We've sent a verification code to your mobile number
                </Text>
              </View>
              
              {/* Hidden input for actual OTP entry */}
              <RNTextInput
                ref={inputRef}
                style={styles.hiddenInput}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                autoFocus={true}
                editable={!loading}
                selectTextOnFocus={true}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
              />
              
              {/* Visual OTP boxes */}
              <TouchableOpacity 
                style={styles.otpContainer} 
                onPress={focusInput}
                activeOpacity={0.8}
                disabled={loading}
                onPressIn={() => {
                  // Immediate focus on press in for better responsiveness
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                {renderOtpBoxes()}
              </TouchableOpacity>

              <Text style={styles.otpTimer}>
                OTP valid till 00:{timer.toString().padStart(2, '0')}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, otp.length === OTP_LENGTH && styles.buttonActive]}
              onPress={handleVerify}
              disabled={otp.length !== OTP_LENGTH || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Verifying...</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={otp.length === OTP_LENGTH ? ['#3b82f6', '#1e40af'] : ['#cbd5e1', '#94a3b8']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Verify OTP</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            <View style={styles.resendSection}>
              <TouchableOpacity
                style={[styles.resendBtn, timer > 0 && styles.resendBtnDisabled]}
                onPress={handleResend}
                disabled={timer > 0 || loading}
                activeOpacity={0.8}
              >
                <Text style={[styles.resendText, timer > 0 && styles.resendTextDisabled]}>
                  {timer > 0 ? `Resend SMS in ${timer}s` : 'Resend SMS'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Auto-fill status */}
            {Platform.OS === 'android' && (
              <View style={styles.autoFillSection}>
                <Text style={styles.autoFillText}>
                  {smsPermission 
                    ? '💡 SMS auto-fill enabled' 
                    : '💡 Enable SMS permissions for auto-fill OTP'
                  }
                </Text>
                {isListening && (
                  <Text style={styles.listeningText}>
                    Listening for SMS...
                  </Text>
                )}
              </View>
            )}
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
  otpSection: {
    marginBottom: 35,
  },
  otpHeader: {
    marginBottom: 20,
  },
  otpLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  otpDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  otpBox: {
    width: 50,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxFilled: {
    backgroundColor: '#3b82f6',
    borderColor: '#1e40af',
  },
  otpText: {
    color: '#64748b',
    fontSize: 24,
    fontWeight: 'bold',
  },
  otpTextFilled: {
    color: '#ffffff',
  },
  otpTimer: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    borderRadius: 18,
    marginBottom: 25,
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
  resendSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resendBtnDisabled: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  resendText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 16,
  },
  resendTextDisabled: {
    color: '#94a3b8',
  },
  autoFillSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  autoFillText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  listeningText: {
    fontSize: 10,
    color: '#3b82f6',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default OTPScreen; 