import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';

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
    // Common OTP patterns
    const otpPatterns = [
      /(\d{6})/, // 6-digit OTP
      /OTP[:\s]*(\d{6})/i, // OTP: 123456
      /code[:\s]*(\d{6})/i, // code: 123456
      /verification[:\s]*(\d{6})/i, // verification: 123456
      /(\d{6})[^\d]*$/i, // 6 digits at the end
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

  // Simulate SMS detection (in a real app, this would be replaced with actual SMS listener)
  useEffect(() => {
    if (isListening && smsPermission) {
      // This is a simulation - in production, you would use a native module
      // or library like react-native-sms-retriever
      const simulateSMSDetection = () => {
        // Simulate receiving an SMS with OTP
        // In real implementation, this would be triggered by actual SMS
        console.log('Simulating SMS detection...');
        
        // Example: Simulate receiving SMS after 5 seconds
        setTimeout(() => {
          const mockSMS = `Your ExpressAid OTP is 123456. Valid for 10 minutes.`;
          const extractedOTP = extractOTPFromSMS(mockSMS);
          
          if (extractedOTP) {
            console.log('OTP extracted from SMS:', extractedOTP);
            onOTPReceived(extractedOTP);
            stopListening();
          }
        }, 5000);
      };

      simulateSMSDetection();
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