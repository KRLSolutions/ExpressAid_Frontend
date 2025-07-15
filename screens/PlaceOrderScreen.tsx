import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, TouchableOpacity, Text, View, Image, ScrollView, StyleSheet, Linking } from 'react-native';
import api from '../services/api';

console.log('🔧 PlaceOrderScreen component loaded!');

function getPaymentIcon(method: string) {
  if (method === 'phonepe') return require('../assets/phonepe.png');
  if (method === 'googlepay') return require('../assets/googlepay.png');
  return require('../assets/card.png');
}

const PlaceOrderScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(route?.params?.selectedPaymentMethod || 'phonepe');
  const [cardDetails, setCardDetails] = useState(route?.params?.cardDetails || null);
  const [upiId, setUpiId] = useState(route?.params?.upiId || null);

  // TODO: Replace these with real values from context/store/props
  const totalAmount = 290;
  const userId = 'demoUser';
  const userPhone = '9999999999';
  const userEmail = 'demo@example.com';

  // Update selectedPaymentMethod, cardDetails, upiId if coming back from entry screens
  useEffect(() => {
    console.log('🔄 useEffect triggered with route.params:', route?.params);
    if (route?.params?.selectedPaymentMethod) {
      console.log('✅ Setting selectedPaymentMethod to:', route.params.selectedPaymentMethod);
      setSelectedPaymentMethod(route.params.selectedPaymentMethod);
      setCardDetails(null);
      setUpiId(null);
    } else {
      console.log('⚠️ No selectedPaymentMethod in route.params, keeping default');
    }
    if (route?.params?.cardDetails) {
      setCardDetails(route.params.cardDetails);
      setUpiId(null);
    }
    if (route?.params?.upiId) {
      setUpiId(route.params.upiId);
      setCardDetails(null);
    }
  }, [route?.params?.selectedPaymentMethod, route?.params?.cardDetails, route?.params?.upiId]);

  const handleSelectPaymentMethod = () => {
    navigation.navigate('SelectPaymentMethodScreen', {
      selectedMethod: selectedPaymentMethod,
      returnTo: 'PlaceOrderScreen',
    });
  };

  const handlePlaceOrder = async () => {
    // Alert.alert('Test', 'Place Order button clicked!');
    // console.log('🚀 Place Order button clicked!');
    console.log('📋 Current state:', {
      selectedPaymentMethod,
      totalAmount,
      userId,
      userPhone,
      userEmail,
      cardDetails,
      upiId
    });
    console.log('🔍 selectedPaymentMethod value:', selectedPaymentMethod);
    console.log('🔍 selectedPaymentMethod type:', typeof selectedPaymentMethod);
    console.log('🔍 route.params:', route?.params);

    if (selectedPaymentMethod === 'card' && !cardDetails) {
      console.log('💳 Card payment selected but no card details, navigating to CardEntryScreen');
      navigation.navigate('CardEntryScreen', { returnTo: 'PlaceOrderScreen' });
      return;
    }
    if (selectedPaymentMethod === 'add_upi' && !upiId) {
      console.log('📱 UPI payment selected but no UPI ID, navigating to UPIIDEntryScreen');
      navigation.navigate('UPIIDEntryScreen', { returnTo: 'PlaceOrderScreen' });
      return;
    }

    console.log('✅ All validations passed, starting order placement...');
    setLoading(true);
    
    try {
      console.log('📞 Calling createCashfreeOrder API...');
      console.log('📤 API payload:', {
        orderAmount: totalAmount,
        customerId: userId,
        customerPhone: userPhone,
        customerEmail: userEmail,
        returnUrl: undefined,
        paymentMethod: selectedPaymentMethod,
      });
      console.log('🔍 selectedPaymentMethod value:', selectedPaymentMethod);
      console.log('🔍 selectedPaymentMethod type:', typeof selectedPaymentMethod);

      // Ensure selectedPaymentMethod has a default value
      const paymentMethodToUse = selectedPaymentMethod || 'phonepe';
      console.log('🔧 Using payment method:', paymentMethodToUse);
      console.log('🔧 selectedPaymentMethod was:', selectedPaymentMethod);
      console.log('🔧 Default fallback to phonepe');
      
      // FORCE TEST: Always use phonepe for testing
      const finalPaymentMethod = 'phonepe';
      console.log('🔧 FORCED payment method for testing:', finalPaymentMethod);
      
              const order = await api.createCashfreeOrder({
          orderAmount: totalAmount,
          customerId: userId,
          customerPhone: userPhone,
          customerEmail: userEmail,
          returnUrl: undefined,
          paymentMethod: finalPaymentMethod,
        });
      
      console.log('🎯 Order API response:', JSON.stringify(order, null, 2));
      
      // Extract payment_session_id from the backend response
      // The backend returns the Cashfree response wrapped in a 'data' property
      const cashfreeResponse = order?.data;
      const sessionId = cashfreeResponse?.payment_session_id;
      
      if (sessionId) {
        console.log('✅ Found payment session ID:', sessionId);
        // For UPI payments, try to get UPI intent links first
        if (finalPaymentMethod === 'phonepe' || finalPaymentMethod === 'googlepay' || finalPaymentMethod === 'upi') {
          try {
            console.log('🔗 Getting UPI session links for:', finalPaymentMethod);
            const upiSession = await api.getUpiSessionLinks(sessionId, finalPaymentMethod);
            console.log('🔗 UPI session response:', JSON.stringify(upiSession, null, 2));
            
            if (upiSession.success && upiSession.data) {
              // Try to get app-specific UPI links from the response
              const payload = upiSession.data?.data?.payload || upiSession.data?.payload;
              console.log('🔗 UPI payload:', payload);
              
              let upiUrl = null;
              if (finalPaymentMethod === 'phonepe') upiUrl = payload?.phonepe;
              else if (finalPaymentMethod === 'googlepay') upiUrl = payload?.gpay;
              else upiUrl = payload?.default;
              
              if (upiUrl) {
                console.log('🔗 Opening UPI app with URL:', upiUrl);
                Linking.openURL(upiUrl);
                setLoading(false);
                return;
              } else {
                console.log('⚠️ No UPI URL found, falling back to payment URL');
              }
            } else {
              console.log('⚠️ UPI session failed, falling back to payment URL');
            }
          } catch (upiErr) {
            console.log('⚠️ Error getting UPI session links, falling back to payment URL:', upiErr);
          }
          
          // Fallback: Use the payment session URL
          console.log('🔗 Using fallback payment session for UPI payment');
          const paymentUrl = `https://sandbox.cashfree.com/pg/view/payment/${sessionId}`;
          console.log('🔗 Opening UPI payment URL:', paymentUrl);
          
          // Show a message to the user about what to expect
          Alert.alert(
            'UPI Payment',
            'Opening payment page. Please select PhonePe or Google Pay from the payment options.',
            [
              {
                text: 'OK',
                onPress: () => {
                  Linking.openURL(paymentUrl);
                  setLoading(false);
                }
              }
            ]
          );
          return;
        } else {
          navigation.navigate('CashfreePaymentScreen', {
            paymentSessionId: sessionId,
          });
        }
      } else {
        console.error('❌ No payment session ID found in response');
        console.error('🔍 Full response structure:', Object.keys(order || {}));
        console.error('🔍 Cashfree response structure:', cashfreeResponse ? Object.keys(cashfreeResponse) : 'No data property');
        console.error('🔍 Available fields in cashfreeResponse:', cashfreeResponse);
        Alert.alert(
          'Payment Error', 
          'Could not create payment order.\n\nResponse: ' + JSON.stringify(order, null, 2)
        );
      }
    } catch (e) {
      console.error('💥 Error in handlePlaceOrder:', e);
      Alert.alert('Error', 'Could not create payment order: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      console.log('🏁 Order placement attempt completed');
      setLoading(false);
    }
  };

  // --- UI ---
  const getPaymentLabel = () => {
    if (selectedPaymentMethod === 'phonepe') return 'PhonePe UPI';
    if (selectedPaymentMethod === 'googlepay') return 'Google Pay';
    if (selectedPaymentMethod === 'card') return cardDetails ? `Card: ****${cardDetails.cardNumber.slice(-4)}` : 'Credit/Debit Card';
    if (selectedPaymentMethod === 'add_upi') return upiId ? `UPI: ${upiId}` : 'UPI ID';
    return 'Payment Method';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.debugText}>🔧 Updated PlaceOrderScreen v2.0</Text>
      <View style={styles.header}>
        {/* ... your cart and address UI ... */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 16, margin: 12 }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 18,
              marginRight: 12,
              flex: 1,
            }}
            onPress={handleSelectPaymentMethod}
            activeOpacity={0.8}
          >
            <Image source={getPaymentIcon(selectedPaymentMethod)} style={{ width: 24, height: 24, marginRight: 8 }} />
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginRight: 8 }}>
              Payment Method: {getPaymentLabel()}
            </Text>
            <Image source={require('../assets/arrow-right.png')} style={{ width: 18, height: 18 }} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#2563eb',
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 24,
              minWidth: 120,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={()=>handlePlaceOrder()}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              Place Order ₹{totalAmount}
            </Text>
          </TouchableOpacity>
        </View>
        {loading && <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 24 }} />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fc',
  },
  debugText: {
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#ffeb3b',
    color: '#000',
    fontWeight: 'bold',
  },
  header: {
    flex: 1,
  },
});

export default PlaceOrderScreen; 