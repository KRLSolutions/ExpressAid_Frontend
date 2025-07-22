import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const CardEntryScreen = ({ navigation, route }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (!cardNumber || !expiry || !cvv || !name) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    navigation.navigate({
      name: route.params?.returnTo || 'PlaceOrderScreen',
      params: { cardDetails: { cardNumber, expiry, cvv, name } },
      merge: true,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Card Details</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  input: {
    width: 260,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f3f4f6',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 12,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default CardEntryScreen; 