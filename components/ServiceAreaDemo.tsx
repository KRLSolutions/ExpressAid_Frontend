import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import ServiceAreaRestrictionModal from './ServiceAreaRestrictionModal';

const ServiceAreaDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const handleNotifyMe = () => {
    // Implement your notification logic here
    console.log('User wants to be notified when service is available');
    // You can:
    // 1. Save to AsyncStorage
    // 2. Send to your backend API
    // 3. Show a success message
    // 4. Add to notification queue
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.buttonText}>Show Service Area Restriction</Text>
      </TouchableOpacity>

      <ServiceAreaRestrictionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onNotifyMe={handleNotifyMe}
        currentLocation="Mumbai"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ServiceAreaDemo; 