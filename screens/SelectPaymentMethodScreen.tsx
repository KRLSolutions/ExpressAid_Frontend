import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const SelectPaymentMethodScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const BILL_TOTAL = route.params?.orderAmount || 290; // Get from route params
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');

  // Enhanced payment methods with Cashfree support
  const paymentSections = [
    {
      title: 'Recommended - Cashfree Secure',
      data: [
        {
          key: 'cashfree-all',
          label: 'Cashfree Secure Payment',
          subtitle: 'All UPI apps, Cards, Net Banking',
          icon: require('../assets/googlepay.png'),
          action: 'cashfree',
          description: 'Secure payment gateway supporting PhonePe, Google Pay, Paytm, BHIM, Cards, Net Banking'
        }
      ]
    },
    {
      title: 'Direct UPI Apps',
      data: [
        {
          key: 'phonepe',
          label: 'PhonePe UPI',
          subtitle: 'Fast & Secure UPI Payments',
          icon: require('../assets/phonepe.png'),
          action: 'upi',
          description: 'Pay directly with PhonePe UPI'
        },
        {
          key: 'googlepay',
          label: 'Google Pay',
          subtitle: 'Quick & Easy Payments',
          icon: require('../assets/googlepay.png'),
          action: 'upi',
          description: 'Pay directly with Google Pay'
        },
        {
          key: 'paytm',
          label: 'Paytm UPI',
          subtitle: 'India\'s Most-loved Payments App',
          icon: require('../assets/phonepe.png'), // Using phonepe icon as placeholder
          action: 'upi',
          description: 'Pay directly with Paytm UPI'
        },
        {
          key: 'bhim',
          label: 'BHIM UPI',
          subtitle: 'Government UPI App',
          icon: require('../assets/googlepay.png'), // Using googlepay icon as placeholder
          action: 'upi',
          description: 'Pay directly with BHIM UPI'
        }
      ]
    }
  ];

  const handlePaymentMethod = async (method: any) => {
    setSelectedMethod(method.key);
    setLoading(true);

    try {
      console.log('🎯 Selected payment method:', method);

      if (method.action === 'cashfree') {
        // Use Cashfree payment session for all payment methods
        await handleCashfreePayment();
      } else if (method.action === 'upi') {
        // Use direct UPI deep links
        await handleDirectUpiPayment(method.key);
      }
    } catch (error) {
      console.error('❌ Payment method selection failed:', error);
      Alert.alert('Payment Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCashfreePayment = async () => {
    try {
      console.log('💳 Creating Cashfree payment session...');
      
      // Get user details from route params or context
      const userId = route.params?.userId || 'USER_' + Date.now();
      const userPhone = route.params?.userPhone || '+919346048610';
      const userEmail = route.params?.userEmail || 'user@expressaid.com';

      const response = await api.createCashfreePaymentSession({
        orderAmount: BILL_TOTAL,
        customerId: userId,
        customerPhone: userPhone,
        customerEmail: userEmail
      });

      console.log('✅ Cashfree payment session created:', response);

      if (response.success && response.data.payment_url) {
        const paymentUrl = response.data.payment_url;
        
        Alert.alert(
          'Cashfree Payment',
          'Opening secure payment page. You can pay using any UPI app, card, or net banking.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setLoading(false)
            },
            {
              text: 'Open Payment',
              onPress: async () => {
                try {
                  const supported = await Linking.canOpenURL(paymentUrl);
                  if (supported) {
                    await Linking.openURL(paymentUrl);
                  } else {
                    Alert.alert('Error', 'Cannot open payment page. Please try again.');
                  }
                } catch (error) {
                  console.error('❌ Failed to open payment URL:', error);
                  Alert.alert('Error', 'Failed to open payment page. Please try again.');
                }
                setLoading(false);
              }
            }
          ]
        );
      } else {
        throw new Error('Failed to create payment session');
      }
    } catch (error) {
      console.error('❌ Cashfree payment failed:', error);
      Alert.alert('Payment Error', 'Failed to create payment session. Please try again.');
    }
  };

  const handleDirectUpiPayment = async (paymentMethod: string) => {
    try {
      console.log('📱 Creating direct UPI payment for:', paymentMethod);
      
      // Get user details from route params or context
      const userId = route.params?.userId || 'USER_' + Date.now();
      const userPhone = route.params?.userPhone || '+919346048610';
      const userEmail = route.params?.userEmail || 'user@expressaid.com';

      const response = await api.generateUpiUrl({
        orderAmount: BILL_TOTAL,
        customerId: userId,
        customerPhone: userPhone,
        customerEmail: userEmail,
        paymentMethod: paymentMethod
      });

      console.log('✅ UPI URL generated:', response);

      if (response.success && response.data.upiUrl) {
        const upiUrl = response.data.upiUrl;
        
        try {
          console.log('🔗 Attempting to open UPI app...');
          const supported = await Linking.canOpenURL(upiUrl);
          console.log('📱 Can open UPI URL:', supported);
          
          if (supported) {
            await Linking.openURL(upiUrl);
            console.log('✅ UPI app opened successfully');
          } else {
            Alert.alert(
              'UPI App Not Found',
              `${paymentMethod.toUpperCase()} app is not installed. Please install it or choose another payment method.`,
              [
                { text: 'OK', onPress: () => setLoading(false) },
                { 
                  text: 'Use Cashfree Instead', 
                  onPress: () => handleCashfreePayment() 
                }
              ]
            );
          }
        } catch (error) {
          console.error('❌ Failed to open UPI app:', error);
          Alert.alert('Error', 'Failed to open UPI app. Please try again.');
        }
      } else {
        throw new Error('Failed to generate UPI URL');
      }
    } catch (error) {
      console.error('❌ Direct UPI payment failed:', error);
      Alert.alert('Payment Error', 'Failed to generate UPI payment. Please try again.');
    }
  };

  const renderPaymentMethod = (method: any) => (
    <TouchableOpacity
      key={method.key}
      style={[
        styles.paymentMethod,
        selectedMethod === method.key && styles.selectedMethod
      ]}
      onPress={() => handlePaymentMethod(method)}
      disabled={loading}
    >
      <View style={styles.methodHeader}>
        <View style={styles.methodInfo}>
          <Text style={styles.methodLabel}>{method.label}</Text>
          <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
        </View>
        {loading && selectedMethod === method.key && (
          <ActivityIndicator size="small" color="#007AFF" />
        )}
      </View>
      <Text style={styles.methodDescription}>{method.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Payment Method</Text>
        <Text style={styles.subtitle}>Total Amount: ₹{BILL_TOTAL}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {paymentSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.map(renderPaymentMethod)}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Back to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 15,
  },
  paymentMethod: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  selectedMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  methodDescription: {
    fontSize: 13,
    color: '#868e96',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  backButton: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelectPaymentMethodScreen; 