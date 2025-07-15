import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/AuthStack';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

interface ProfileSetupScreenProps {
  navigation: StackNavigationProp<AuthStackParamList, 'ProfileSetup'>;
  route: RouteProp<AuthStackParamList, 'ProfileSetup'>;
}

export default function ProfileSetupScreen({ navigation, route }: ProfileSetupScreenProps) {
  const { phoneNumber, onLogin } = route.params;
  
  const [name, setName] = useState('');
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!sex) {
      Alert.alert('Error', 'Please select your sex');
      return false;
    }
    if (!age || parseInt(age) < 1 || parseInt(age) > 120) {
      Alert.alert('Error', 'Please enter a valid age (1-120)');
      return false;
    }
    return true;
  };

  const saveProfile = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          sex,
          age: parseInt(age),
          profileImage: 'https://via.placeholder.com/150x150/007AFF/FFFFFF?text=Photo', // Default image
        }),
      });

      if (response.success) {
        // Save updated user data
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        if (response.token) await AsyncStorage.setItem('userToken', response.token);
        if (response.user && response.user.userId) await AsyncStorage.setItem('userId', response.user.userId);
        // Call onLogin to complete the authentication flow
        onLogin(response.user);
      }
    } catch (error: any) {
      console.error('Profile save error:', error);
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../assets/bg.png')} style={styles.bg}>
      <View style={styles.overlay} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Add your personal details</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              autoCapitalize="words"
            />
          </View>

          {/* Sex Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sex</Text>
            <View style={styles.sexContainer}>
              <TouchableOpacity
                style={[styles.sexButton, sex === 'male' && styles.sexButtonActive]}
                onPress={() => setSex('male')}
              >
                <Ionicons 
                  name="male" 
                  size={24} 
                  color={sex === 'male' ? '#fff' : 'rgba(255,255,255,0.6)'} 
                />
                <Text style={[styles.sexButtonText, sex === 'male' && styles.sexButtonTextActive]}>
                  Male
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.sexButton, sex === 'female' && styles.sexButtonActive]}
                onPress={() => setSex('female')}
              >
                <Ionicons 
                  name="female" 
                  size={24} 
                  color={sex === 'female' ? '#fff' : 'rgba(255,255,255,0.6)'} 
                />
                <Text style={[styles.sexButtonText, sex === 'female' && styles.sexButtonTextActive]}>
                  Female
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.sexButton, sex === 'other' && styles.sexButtonActive]}
                onPress={() => setSex('other')}
              >
                <Ionicons 
                  name="person" 
                  size={24} 
                  color={sex === 'other' ? '#fff' : 'rgba(255,255,255,0.6)'} 
                />
                <Text style={[styles.sexButtonText, sex === 'other' && styles.sexButtonTextActive]}>
                  Other
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Age Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter your age"
              placeholderTextColor="rgba(255,255,255,0.6)"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={saveProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  formSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sexButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sexButtonActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  sexButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  sexButtonTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(124, 58, 237, 0.6)',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 