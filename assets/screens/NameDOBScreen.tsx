import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/AuthStack';
import apiService from '../services/api';

type NameDOBScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'NameDOB'>;
  route: RouteProp<AuthStackParamList, 'NameDOB'>;
};

const NameDOBScreen: React.FC<NameDOBScreenProps> = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const { phoneNumber, onLogin } = route.params;

  const handleSubmit = async () => {
    if (name && dob) {
      setLoading(true);
      try {
        // Update user profile
        await apiService.updateProfile(name, dob);
        
        // Call onLogin to switch to AppStack (Home screen)
        onLogin();
      } catch (error) {
        console.error('Error updating profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update profile. Please try again.';
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>Complete your profile</Text>
      <TextInput
        label="Full Name"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 16 }}
      />
      <TextInput
        label="Date of Birth (YYYY-MM-DD)"
        value={dob}
        onChangeText={setDob}
        style={{ marginBottom: 16 }}
        placeholder="1990-01-01"
      />
      <Button mode="contained" onPress={handleSubmit} disabled={!name || !dob || loading} loading={loading}>
        Finish
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
});

export default NameDOBScreen; 