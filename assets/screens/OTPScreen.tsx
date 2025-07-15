import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput as RNTextInput, TouchableOpacity, ImageBackground, Dimensions, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/AuthStack';
import apiService from '../services/api';

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

  // Auto-fill OTP in development mode
  useEffect(() => {
    if (devOtp) {
      setOtp(devOtp);
    }
  }, [devOtp]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtp(numericValue);
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await apiService.sendOTP(phoneNumber);
      setTimer(RESEND_TIME);
      Alert.alert('Success', 'OTP resent successfully!');
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
        
        console.log('OTP verified successfully:', response);
        
        // Check if user has profile
        if (response.user.hasProfile) {
          // User has complete profile, go to home
          onLogin(response.user);
        } else {
          // User needs to complete profile
          navigation.navigate('ProfileSetup', { phoneNumber, onLogin });
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
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
          <Text style={styles.otpText}>{otp[i] || ''}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <ImageBackground source={require('../assets/bg.png')} style={styles.bg}>
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.title}>Verify</Text>
        <Text style={styles.subtitle}>Enter OTP</Text>
        <Text style={styles.info}>A 6-digit code has been sent to {phoneNumber}</Text>
        
        {/* Hidden input for actual OTP entry */}
        <RNTextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={otp}
          onChangeText={handleOtpChange}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          autoFocus={true}
        />
        
        {/* Visual OTP boxes */}
        <TouchableOpacity 
          style={styles.otpContainer} 
          onPress={() => inputRef.current?.focus()}
          activeOpacity={0.8}
        >
          {renderOtpBoxes()}
        </TouchableOpacity>
        
        <Text style={styles.otpTimer}>OTP valid till 00:{timer.toString().padStart(2, '0')}</Text>
        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonLabel}
          onPress={handleVerify}
          disabled={otp.length !== OTP_LENGTH || loading}
          loading={loading}
        >
          Verify
        </Button>
        <View style={styles.resendRow}>
          <TouchableOpacity
            style={styles.resendBtn}
            onPress={handleResend}
            disabled={timer > 0}
          >
            <Text style={styles.resendText}>Resend SMS {timer > 0 ? `in ${timer}` : ''}</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  info: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 24,
    textAlign: 'center',
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
    width: 40,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFilled: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: '#7c3aed',
  },
  otpText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  otpTimer: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
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
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  resendBtn: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  resendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OTPScreen; 