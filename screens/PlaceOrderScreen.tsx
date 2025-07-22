import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, TouchableOpacity, Text, View, Image, ScrollView, StyleSheet, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useCart, useSelectedAddress } from '../CartContext';

console.log('🔧 PlaceOrderScreen component loaded!');

function getPaymentIcon(method: string) {
  if (method === 'phonepe') return require('../assets/phonepe.png');
  if (method === 'googlepay') return require('../assets/googlepay.png');
  return require('../assets/card.png');
}

const PlaceOrderScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  console.log('🎬 PlaceOrderScreen component rendered!');
  console.log('📋 Route params:', route?.params);
  console.log('📋 Navigation state:', navigation?.getState());
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(route?.params?.selectedPaymentMethod || 'phonepe');
  const [cardDetails, setCardDetails] = useState(route?.params?.cardDetails || null);
  const [upiId, setUpiId] = useState(route?.params?.upiId || null);
  const [userData, setUserData] = useState<any>(null);
  
  // Get cart data and selected address
  const { cart } = useCart();
  const { selectedAddress } = useSelectedAddress();
  
  console.log('🛒 Cart state in PlaceOrderScreen:', cart);
  console.log('📍 Selected address in PlaceOrderScreen:', selectedAddress);
  
  // Debug button state
  useEffect(() => {
    console.log('🔘 Place Order button state updated:', {
      loading,
      selectedAddress: !!selectedAddress,
      cartLength: cart.length,
      disabled: loading || !selectedAddress || cart.length === 0
    });
  }, [loading, selectedAddress, cart.length]);

  // Load user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const user = JSON.parse(userDataString);
          setUserData(user);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  // Calculate total amount from cart
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  
  // Get user details
  const userId = userData?.id || userData?._id || 'demoUser';
  const userPhone = userData?.phoneNumber || '9999999999';
  const userEmail = userData?.email || 'demo@example.com';

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
      orderAmount: totalAmount,
      userId: userId,
      userPhone: userPhone,
      userEmail: userEmail,
      returnTo: 'PlaceOrderScreen',
    });
  };

  const handlePlaceOrder = async () => {
    console.log('🚀 handlePlaceOrder function called!');
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

    // Validate cart has items
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before placing an order.');
      return;
    }

    // Validate address is selected
    if (!selectedAddress) {
      Alert.alert('No Address Selected', 'Please select a delivery address before placing your order.');
      return;
    }

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
      console.log('📞 About to call createCashfreeOrder API...');
      console.log('📤 API payload:', {
        orderAmount: totalAmount,
        customerId: userId,
        customerPhone: userPhone,
        customerEmail: userEmail,
        returnUrl: undefined,
        paymentMethod: selectedPaymentMethod,
      });
      console.log('🔍 API service object:', api);
      console.log('🔍 createCashfreeOrder method exists:', typeof api.createCashfreeOrder);
      
      // Test API connectivity
      try {
        console.log('🧪 Testing API connectivity...');
        const testResponse = await api.request('/health');
        console.log('✅ API connectivity test passed:', testResponse);
      } catch (testError) {
        console.error('❌ API connectivity test failed:', testError);
      }
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
      
      console.log('📞 Making the actual API call now...');
      
      // Use the new Cashfree payment session method
      const order = await api.createCashfreePaymentSession({
        orderAmount: totalAmount,
        customerId: userId,
        customerPhone: userPhone,
        customerEmail: userEmail
      });
      console.log('📞 API call completed!');
      
      console.log('🎯 Order API response:', JSON.stringify(order, null, 2));
      
      // Extract payment_session_id from the backend response
      const cashfreeResponse = order?.data;
      const sessionId = cashfreeResponse?.payment_session_id;
      const paymentUrl = cashfreeResponse?.payment_url;
      
      if (sessionId) {
        console.log('✅ Found payment session ID:', sessionId);
        console.log('✅ Payment URL:', paymentUrl);
        
        // Show payment options to user
        Alert.alert(
          'Cashfree Secure Payment',
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
                  if (paymentUrl) {
                    console.log('🔗 Opening Cashfree payment URL:', paymentUrl);
                    const supported = await Linking.canOpenURL(paymentUrl);
                    if (supported) {
                      await Linking.openURL(paymentUrl);
                    } else {
                      Alert.alert('Error', 'Cannot open payment page. Please try again.');
                    }
                  } else {
                    // Fallback to session URL
                    const fallbackUrl = `https://sandbox.cashfree.com/pg/view/payment/${sessionId}`;
                    console.log('🔗 Opening fallback payment URL:', fallbackUrl);
                    await Linking.openURL(fallbackUrl);
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
      
      {/* Order Summary Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <Text style={styles.headerSubtitle}>Review your order before payment</Text>
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
        {selectedAddress ? (
          <View style={styles.addressCard}>
            <Text style={styles.addressText}>
              {selectedAddress.formatted_address || selectedAddress.description || 'Selected Address'}
            </Text>
            {selectedAddress.name && (
              <Text style={styles.addressName}>{selectedAddress.name}</Text>
            )}
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.noAddressCard}
            onPress={() => navigation.navigate('SelectAddressScreen')}
          >
            <Text style={styles.noAddressText}>Select Delivery Address</Text>
            <Text style={styles.noAddressSubtext}>Tap to choose your address</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛒 Order Items</Text>
        {cart.length > 0 ? (
          <View style={styles.itemsContainer}>
            {cart.map((item, index) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemQty}>Qty: {item.qty}</Text>
                  <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCartCard}>
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <TouchableOpacity 
              style={styles.addItemsButton}
              onPress={() => navigation.navigate('SymptomEntryScreen')}
            >
              <Text style={styles.addItemsButtonText}>Add Services</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Order Total */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Order Total</Text>
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>₹{totalAmount}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee:</Text>
            <Text style={styles.totalValue}>₹0</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Total:</Text>
            <Text style={styles.finalTotalValue}>₹{totalAmount}</Text>
          </View>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Payment Method</Text>
        <TouchableOpacity
          style={styles.paymentMethodCard}
          onPress={handleSelectPaymentMethod}
          activeOpacity={0.8}
        >
          <Image source={getPaymentIcon(selectedPaymentMethod)} style={styles.paymentIcon} />
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentMethodText}>{getPaymentLabel()}</Text>
            <Text style={styles.paymentSubtext}>Tap to change payment method</Text>
          </View>
          <Image source={require('../assets/arrow-right.png')} style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>

      {/* Place Order Button */}
      <View style={styles.placeOrderSection}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (!selectedAddress || cart.length === 0) && styles.placeOrderButtonDisabled
          ]}
          onPress={() => {
            console.log('🔘 Place Order button clicked!');
            console.log('🔍 Button state:', {
              loading,
              selectedAddress: !!selectedAddress,
              cartLength: cart.length,
              disabled: loading || !selectedAddress || cart.length === 0
            });
            handlePlaceOrder();
          }}
          activeOpacity={0.8}
          disabled={loading || !selectedAddress || cart.length === 0}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.placeOrderButtonText}>
              Place Order • ₹{totalAmount}
            </Text>
          )}
        </TouchableOpacity>
        
        {!selectedAddress && (
          <Text style={styles.warningText}>⚠️ Please select a delivery address</Text>
        )}
        {cart.length === 0 && (
          <Text style={styles.warningText}>⚠️ Please add items to your cart</Text>
        )}
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
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  addressText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  addressName: {
    fontSize: 14,
    color: '#6b7280',
  },
  noAddressCard: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderStyle: 'dashed',
  },
  noAddressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    textAlign: 'center',
  },
  noAddressSubtext: {
    fontSize: 14,
    color: '#b45309',
    textAlign: 'center',
    marginTop: 4,
  },
  itemsContainer: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemQty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  emptyCartCard: {
    backgroundColor: '#fef2f2',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 12,
  },
  addItemsButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addItemsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  totalCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 16,
    color: '#1f2937',
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 8,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  paymentSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  placeOrderSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  placeOrderButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  warningText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
});

export default PlaceOrderScreen; 