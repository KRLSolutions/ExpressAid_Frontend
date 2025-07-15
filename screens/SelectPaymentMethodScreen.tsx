import React, { useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, Image, StyleSheet, SectionListData, TextInput } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AppDrawerParamList } from '../navigation/AppStack';

type PaymentMethodItem = {
  key: string;
  label: string;
  icon: any;
  action?: string | null;
  onPress?: (navigation: any, route: any) => void;
  disabled?: boolean;
  error?: string;
  subtitle?: string;
};

type SectionType = {
  title: string;
  data: PaymentMethodItem[];
};

const BILL_TOTAL = 290; // You can pass this as a prop/param if needed

const SelectPaymentMethodScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const [showCardFields, setShowCardFields] = useState(false);
  const [showUpiField, setShowUpiField] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');

  const validateUpiId = (id: string) => /^[\w.-]+@[\w.-]+$/.test(id);

  const handleCardSubmit = () => {
    if (!cardNumber || !expiry || !cvv || !name) {
      alert('Please fill all card fields.');
      return;
    }
    if (route.params?.returnTo === 'CartScreen') {
      navigation.navigate('MainDrawer', { screen: 'Cart', params: { selectedPaymentMethod: 'card', cardDetails: { cardNumber, expiry, cvv, name } }, merge: true });
    } else {
      navigation.navigate({
        name: route.params?.returnTo || 'PlaceOrderScreen',
        params: { selectedPaymentMethod: 'card', cardDetails: { cardNumber, expiry, cvv, name } },
        merge: true,
      });
    }
  };

  const handleUpiSubmit = () => {
    if (!validateUpiId(upiId)) {
      alert('Please enter a valid UPI ID (e.g. name@bank).');
      return;
    }
    if (route.params?.returnTo === 'CartScreen') {
      navigation.navigate('MainDrawer', { screen: 'Cart', params: { selectedPaymentMethod: 'add_upi', upiId }, merge: true });
    } else {
      navigation.navigate({
        name: route.params?.returnTo || 'PlaceOrderScreen',
        params: { selectedPaymentMethod: 'add_upi', upiId },
        merge: true,
      });
    }
  };

  const paymentSections = [
    {
      title: 'Recommended',
      data: [
        {
          key: 'phonepe',
          label: 'PhonePe UPI',
          icon: require('../assets/phonepe.png'),
          action: null,
          onPress: (navigation: any, route: any) => {
            if (route.params?.returnTo === 'CartScreen') {
              navigation.navigate('MainDrawer', { screen: 'Cart', params: { selectedPaymentMethod: 'phonepe' }, merge: true });
            } else {
              navigation.navigate({
                name: route.params?.returnTo || 'PlaceOrderScreen',
                params: { selectedPaymentMethod: 'phonepe' },
                merge: true,
              });
            }
          },
        },
        {
          key: 'googlepay',
          label: 'Google Pay',
          icon: require('../assets/googlepay.png'),
          action: null,
          onPress: (navigation: any, route: any) => {
            if (route.params?.returnTo === 'CartScreen') {
              navigation.navigate('MainDrawer', { screen: 'Cart', params: { selectedPaymentMethod: 'googlepay' }, merge: true });
            } else {
              navigation.navigate({
                name: route.params?.returnTo || 'PlaceOrderScreen',
                params: { selectedPaymentMethod: 'googlepay' },
                merge: true,
              });
            }
          },
        },
      ],
    },
    {
      title: 'Cards',
      data: [
        {
          key: 'add_card',
          label: 'Add credit or debit cards',
          icon: require('../assets/card.png'),
          action: 'ADD',
          onPress: () => setShowCardFields((v) => !v),
        },
      ],
    },
    {
      title: 'Pay by any UPI app',
      data: [
        {
          key: 'add_upi',
          label: 'Add new UPI ID',
          icon: require('../assets/googlepay.png'),
          action: 'ADD',
          onPress: () => setShowUpiField((v) => !v),
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fb' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginLeft: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 24 }}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Bill total: ₹{BILL_TOTAL}</Text>
      </View>
      <SectionList
        sections={paymentSections}
        keyExtractor={(item: PaymentMethodItem) => item.key}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderSectionHeader={({ section }: { section: SectionType }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }: { item: PaymentMethodItem }) => (
          <>
            <TouchableOpacity
              style={[styles.row, item.disabled && styles.disabledRow]}
              onPress={() => item.onPress && item.onPress(navigation, route)}
              disabled={item.disabled}
            >
              <Image source={item.icon} style={styles.icon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{item.label}</Text>
                {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
                {item.error && <Text style={styles.error}>{item.error}</Text>}
              </View>
              {item.action && <Text style={styles.action}>{item.action}</Text>}
            </TouchableOpacity>
            {/* Inline Card Fields */}
            {item.key === 'add_card' && showCardFields && (
              <View style={styles.inputBlock}>
                <TextInput
                  style={styles.input}
                  placeholder="Card Number"
                  keyboardType="number-pad"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  maxLength={19}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Expiry (MM/YY)"
                  value={expiry}
                  onChangeText={setExpiry}
                  maxLength={5}
                />
                <TextInput
                  style={styles.input}
                  placeholder="CVV"
                  keyboardType="number-pad"
                  value={cvv}
                  onChangeText={setCvv}
                  maxLength={4}
                  secureTextEntry
                />
                <TextInput
                  style={styles.input}
                  placeholder="Name on Card"
                  value={name}
                  onChangeText={setName}
                />
                <TouchableOpacity style={styles.roundedButton} onPress={handleCardSubmit}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Inline UPI Field */}
            {item.key === 'add_upi' && showUpiField && (
              <View style={styles.inputBlock}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. name@bank"
                  value={upiId}
                  onChangeText={setUpiId}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.roundedButton} onPress={handleUpiSubmit}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: { fontSize: 18, fontWeight: 'bold' },
  sectionHeader: { fontWeight: 'bold', fontSize: 16, marginTop: 24, marginLeft: 16, marginBottom: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 12, marginVertical: 4, borderRadius: 12, padding: 16,
  },
  disabledRow: { opacity: 0.5 },
  icon: { width: 32, height: 32, marginRight: 16 },
  label: { fontSize: 16, fontWeight: '500' },
  subtitle: { fontSize: 13, color: '#888' },
  error: { color: '#e11d48', fontSize: 13, marginTop: 4 },
  action: { color: '#22c55e', fontWeight: 'bold', fontSize: 15, marginLeft: 12 },
  inputBlock: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  roundedButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});

export default SelectPaymentMethodScreen; 