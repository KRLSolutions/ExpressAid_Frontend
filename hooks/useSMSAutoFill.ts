import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid, NativeEventEmitter, NativeModules } from 'react-native';

interface UseSMSAutoFillProps {
  onOTPReceived: (otp: string) => void;
  phoneNumber: string;
}

export const useSMSAutoFill = ({ onOTPReceived, phoneNumber }: UseSMSAutoFillProps) => {
  const [smsPermission, setSmsPermission] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Request SMS permissions
  const requestSMSPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          {
            title: 'SMS Permission',
            message: 'This app needs access to SMS to auto-fill OTP codes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setSmsPermission(true);
          console.log('SMS permission granted');
          return true;
        } else {
          console.log('SMS permission denied');
          return false;
        }
      } catch (err) {
        console.warn('Error requesting SMS permission:', err);
        return false;
      }
    }
    return false;
  };

  // Extract OTP from SMS text
  const extractOTPFromSMS = (smsText: string): string | null => {
    // Common OTP patterns for ExpressAid
    const otpPatterns = [
      /(\d{6})/, // 6-digit OTP
      /OTP[:\s]*(\d{6})/i, // OTP: 123456
      /code[:\s]*(\d{6})/i, // code: 123456
      /verification[:\s]*(\d{6})/i, // verification: 123456
      /(\d{6})[^\d]*$/i, // 6 digits at the end
      /verification code is:\s*(\d{6})/i, // "verification code is: 123456"
      /ExpressAid.*?(\d{6})/i, // ExpressAid...123456
    ];

    for (const pattern of otpPatterns) {
      const match = smsText.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  // Start listening for SMS
  const startListening = async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await requestSMSPermission();
      if (hasPermission) {
        setIsListening(true);
        console.log('Started listening for SMS...');
      }
    }
  };

  // Stop listening for SMS
  const stopListening = () => {
    setIsListening(false);
    console.log('Stopped listening for SMS');
  };

  // Listen for real SMS events from native module
  useEffect(() => {
    if (isListening && smsPermission) {
      console.log('SMS auto-fill is active. Send an SMS with OTP to test.');
      
      // Listen for SMS events from native module
      const eventEmitter = new NativeEventEmitter(NativeModules.ReactNativeEventEmitter);
      const subscription = eventEmitter.addListener('SMS_OTP_RECEIVED', (otp: string) => {
        console.log('Real OTP received from SMS:', otp);
        console.log('Auto-filling OTP:', otp);
        onOTPReceived(otp);
        stopListening();
      });
      
      return () => {
        subscription.remove();
      };
    }
  }, [isListening, smsPermission, onOTPReceived]);

  return {
    smsPermission,
    isListening,
    startListening,
    stopListening,
    requestSMSPermission,
  };
}; 