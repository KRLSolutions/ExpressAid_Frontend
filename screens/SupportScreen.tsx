import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const categories = ['Nurse', 'Pharmacy', 'Payment', 'Other'];

const SupportScreen = ({ navigation }: any) => {
  const [category, setCategory] = useState(categories[0]);
  const [message, setMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = () => {
    Alert.alert('Submitted', 'Your report has been sent.');
    setMessage('');
    setCategory(categories[0]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
      </View>
      <Animated.View style={[styles.card, { opacity: fadeAnim }] }>
        <Text style={styles.title}>Support</Text>
        <TouchableOpacity style={styles.emailRow} onPress={() => {}}>
          <Feather name="mail" size={18} color="#2563eb" />
          <Text style={styles.emailText}>support@yourapp.com</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Report a problem</Text>
        <View style={styles.formRow}>
          <Text style={styles.label}>Category</Text>
          <Picker
            selectedValue={category}
            style={styles.picker}
            onValueChange={(itemValue: string) => setCategory(itemValue)}
          >
            {categories.map(cat => (
              <Picker.Item label={cat} value={cat} key={cat} />
            ))}
          </Picker>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue..."
            multiline
          />
        </View>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 16, paddingHorizontal: 18, backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, zIndex: 10 },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, margin: 24, marginTop: 32, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 10 },
  emailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  emailText: { color: '#2563eb', fontSize: 16, marginLeft: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2563eb', marginBottom: 8 },
  formRow: { marginBottom: 14 },
  label: { fontSize: 15, color: '#444', marginBottom: 4 },
  picker: { height: 40, width: '100%' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, minHeight: 60, fontSize: 15, backgroundColor: '#f8fafc' },
  submitBtn: { backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default SupportScreen; 