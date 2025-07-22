import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const UPIIDEntryScreen = ({ navigation, route }) => {
  const [upiId, setUpiId] = useState('');

  const validateUpiId = (id) => {
    // Basic UPI ID regex: something@bank
    return /^[\w.-]+@[\w.-]+$/.test(id);
  };

  const handleSubmit = () => {
    if (!validateUpiId(upiId)) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. name@bank).');
      return;
    }
    navigation.navigate({
      name: route.params?.returnTo || 'PlaceOrderScreen',
      params: { upiId },
      merge: true,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter UPI ID</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. name@bank"
        value={upiId}
        onChangeText={setUpiId}
        autoCapitalize="none"
        autoCorrect={false}
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

export default UPIIDEntryScreen; 