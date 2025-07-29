import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

interface HealthData {
  // Basic Info
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  
  // Physical Measurements
  height: string;
  weight: string;
  
  // Health Goals
  targetWeight: string;
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extremely Active';
  dailyStepsGoal: string;
  
  // Current Health Status
  currentSteps: string;
  sleepHours: string;
  waterIntake: string;
  
  // Vital Signs (optional)
  systolic: string;
  diastolic: string;
  heartRate: string;
  temperature: string;
  
  // Health Conditions
  hasConditions: boolean;
  conditions: string[];
  medications: string[];
  allergies: string[];
}

const HealthOnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [healthData, setHealthData] = useState<HealthData>({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    targetWeight: '',
    activityLevel: 'Sedentary',
    dailyStepsGoal: '10000',
    currentSteps: '5000',
    sleepHours: '7',
    waterIntake: '2.5',
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    hasConditions: false,
    conditions: [],
    medications: [],
    allergies: [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExistingHealthData();
  }, []);

  const loadExistingHealthData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      // Load health metrics
      const healthResponse = await api.request('/health/metrics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (healthResponse.success && healthResponse.data.hasData) {
        const data = healthResponse.data;
        setHealthData({
          name: '',
          age: '',
          gender: 'male',
          height: data.height?.toString() || '',
          weight: data.weight?.toString() || '',
          targetWeight: data.targetWeight?.toString() || '',
          activityLevel: data.activityLevel || 'Sedentary',
          dailyStepsGoal: data.dailySteps?.toString() || '10000',
          currentSteps: '5000',
          sleepHours: '7',
          waterIntake: '2.5',
          systolic: data.bloodPressure?.systolic?.toString() || '',
          diastolic: data.bloodPressure?.diastolic?.toString() || '',
          heartRate: data.heartRate?.toString() || '',
          temperature: data.temperature?.toString() || '',
          hasConditions: false,
          conditions: data.conditions?.map((c: any) => c.name) || [],
          medications: data.medications?.map((m: any) => m.name) || [],
          allergies: data.allergies?.map((a: any) => a.allergen) || [],
        });
      }

      // Load user profile
      const profileResponse = await api.request('/users/health-profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (profileResponse.success && profileResponse.data) {
        const profile = profileResponse.data;
        setHealthData(prev => ({
          ...prev,
          name: profile.name || '',
          age: profile.age?.toString() || '',
          gender: profile.gender || 'male',
          currentSteps: profile.currentSteps?.toString() || '5000',
          sleepHours: profile.sleepHours?.toString() || '7',
          waterIntake: profile.waterIntake?.toString() || '2.5',
          conditions: profile.conditions || [],
          medications: profile.medications || [],
          allergies: profile.allergies || [],
        }));
      }
    } catch (error) {
      console.error('Error loading existing health data:', error);
    }
  };

  const steps = [
    { title: 'Basic Info', icon: 'person' },
    { title: 'Measurements', icon: 'scale' },
    { title: 'Health Goals', icon: 'flag' },
    { title: 'Current Status', icon: 'heart' },
    { title: 'Vital Signs', icon: 'pulse' },
    { title: 'Health History', icon: 'medical' },
  ];

  const updateHealthData = (field: keyof HealthData, value: any) => {
    setHealthData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Info
        return healthData.name.trim() !== '' && healthData.age.trim() !== '';
      case 1: // Measurements
        return healthData.height.trim() !== '' && healthData.weight.trim() !== '';
      case 2: // Health Goals
        return healthData.targetWeight.trim() !== '';
      case 3: // Current Status
        return healthData.currentSteps.trim() !== '' && healthData.sleepHours.trim() !== '';
      case 4: // Vital Signs (optional)
        return true;
      case 5: // Health History (optional)
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        saveHealthData();
      }
    } else {
      Alert.alert('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveHealthData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      // Calculate BMI
      const height = parseFloat(healthData.height);
      const weight = parseFloat(healthData.weight);
      const heightInMeters = height / 100;
      const bmi = Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;

      // Save basic measurements
      await api.request('/health/basic-measurements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          height: height,
          weight: weight,
        }),
      });

      // Save health goals
      await api.request('/health/goals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetWeight: parseFloat(healthData.targetWeight),
          activityLevel: healthData.activityLevel,
          dailySteps: parseInt(healthData.dailyStepsGoal),
        }),
      });

      // Save vital signs if provided
      if (healthData.systolic && healthData.diastolic) {
        await api.request('/health/vitals', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systolic: parseInt(healthData.systolic),
            diastolic: parseInt(healthData.diastolic),
            heartRate: healthData.heartRate ? parseInt(healthData.heartRate) : undefined,
            temperature: healthData.temperature ? parseFloat(healthData.temperature) : undefined,
          }),
        });
      }

      // Save additional health data to user profile
      await api.request('/users/update-health-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: healthData.name,
          age: parseInt(healthData.age),
          gender: healthData.gender,
          currentSteps: parseInt(healthData.currentSteps),
          sleepHours: parseFloat(healthData.sleepHours),
          waterIntake: parseFloat(healthData.waterIntake),
          conditions: healthData.conditions,
          medications: healthData.medications,
          allergies: healthData.allergies,
        }),
      });

      Alert.alert(
        'Success!',
        'Your health profile has been created successfully.',
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving health data:', error);
      Alert.alert('Error', 'Failed to save health data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            index <= currentStep ? styles.activeStep : styles.inactiveStep
          ]}>
            <Ionicons
              name={step.icon as any}
              size={16}
              color={index <= currentStep ? '#fff' : '#9ca3af'}
            />
          </View>
          <Text style={[
            styles.stepText,
            index <= currentStep ? styles.activeStepText : styles.inactiveStepText
          ]}>
            {step.title}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tell us about yourself</Text>
      <Text style={styles.stepSubtitle}>This helps us personalize your health insights</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.textInput}
          value={healthData.name}
          onChangeText={(value) => updateHealthData('name', value)}
          placeholder="Enter your full name"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Age *</Text>
        <TextInput
          style={styles.textInput}
          value={healthData.age}
          onChangeText={(value) => updateHealthData('age', value)}
          placeholder="Enter your age"
          keyboardType="numeric"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Gender</Text>
        <View style={styles.genderContainer}>
          {['male', 'female', 'other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderButton,
                healthData.gender === gender && styles.selectedGender
              ]}
              onPress={() => updateHealthData('gender', gender)}
            >
              <Text style={[
                styles.genderText,
                healthData.gender === gender && styles.selectedGenderText
              ]}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderMeasurements = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Your Measurements</Text>
      <Text style={styles.stepSubtitle}>These help us calculate your BMI and health metrics</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Height (cm) *</Text>
          <TextInput
            style={styles.textInput}
            value={healthData.height}
            onChangeText={(value) => updateHealthData('height', value)}
            placeholder="170"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (kg) *</Text>
          <TextInput
            style={styles.textInput}
            value={healthData.weight}
            onChangeText={(value) => updateHealthData('weight', value)}
            placeholder="70"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {healthData.height && healthData.weight && (
        <View style={styles.bmiPreview}>
          <Text style={styles.bmiTitle}>Your BMI Preview</Text>
          <Text style={styles.bmiValue}>
            {Math.round((parseFloat(healthData.weight) / Math.pow(parseFloat(healthData.height) / 100, 2)) * 10) / 10}
          </Text>
          <Text style={styles.bmiCategory}>
            {(() => {
              const bmi = parseFloat(healthData.weight) / Math.pow(parseFloat(healthData.height) / 100, 2);
              if (bmi < 18.5) return 'Underweight';
              if (bmi < 25) return 'Normal weight';
              if (bmi < 30) return 'Overweight';
              return 'Obese';
            })()}
          </Text>
        </View>
      )}
    </View>
  );

  const renderHealthGoals = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Set Your Health Goals</Text>
      <Text style={styles.stepSubtitle}>What would you like to achieve?</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Target Weight (kg) *</Text>
        <TextInput
          style={styles.textInput}
          value={healthData.targetWeight}
          onChangeText={(value) => updateHealthData('targetWeight', value)}
          placeholder="65"
          keyboardType="numeric"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Activity Level</Text>
        <View style={styles.activityContainer}>
          {[
            'Sedentary',
            'Lightly Active',
            'Moderately Active',
            'Very Active',
            'Extremely Active'
          ].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.activityButton,
                healthData.activityLevel === level && styles.selectedActivity
              ]}
              onPress={() => updateHealthData('activityLevel', level)}
            >
              <Text style={[
                styles.activityText,
                healthData.activityLevel === level && styles.selectedActivityText
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Daily Steps Goal</Text>
        <TextInput
          style={styles.textInput}
          value={healthData.dailyStepsGoal}
          onChangeText={(value) => updateHealthData('dailyStepsGoal', value)}
          placeholder="10000"
          keyboardType="numeric"
          placeholderTextColor="#9ca3af"
        />
      </View>
    </View>
  );

  const renderCurrentStatus = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Current Health Status</Text>
      <Text style={styles.stepSubtitle}>How are you doing today?</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Today's Steps *</Text>
          <TextInput
            style={styles.textInput}
            value={healthData.currentSteps}
            onChangeText={(value) => updateHealthData('currentSteps', value)}
            placeholder="5000"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Sleep Hours *</Text>
          <TextInput
            style={styles.textInput}
            value={healthData.sleepHours}
            onChangeText={(value) => updateHealthData('sleepHours', value)}
            placeholder="7"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Water Intake (L)</Text>
        <TextInput
          style={styles.textInput}
          value={healthData.waterIntake}
          onChangeText={(value) => updateHealthData('waterIntake', value)}
          placeholder="2.5"
          keyboardType="numeric"
          placeholderTextColor="#9ca3af"
        />
      </View>
    </View>
  );

  const renderVitalSigns = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Vital Signs (Optional)</Text>
      <Text style={styles.stepSubtitle}>Do you have recent measurements?</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Blood Pressure (Systolic)</Text>
          <TextInput
            style={styles.textInput}
            value={healthData.systolic}
            onChangeText={(value) => updateHealthData('systolic', value)}
            placeholder="120"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Blood Pressure (Diastolic)</Text>
          <TextInput
            style={styles.textInput}
            value={healthData.diastolic}
            onChangeText={(value) => updateHealthData('diastolic', value)}
            placeholder="80"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Heart Rate (bpm)</Text>
          <TextInput
            style={styles.textInput}
            value={healthData.heartRate}
            onChangeText={(value) => updateHealthData('heartRate', value)}
            placeholder="72"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Temperature (°C)</Text>
          <TextInput
            style={styles.textInput}
            value={healthData.temperature}
            onChangeText={(value) => updateHealthData('temperature', value)}
            placeholder="36.8"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>
    </View>
  );

  const renderHealthHistory = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Health History (Optional)</Text>
      <Text style={styles.stepSubtitle}>Any conditions, medications, or allergies?</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Health Conditions</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={healthData.conditions.join(', ')}
          onChangeText={(value) => updateHealthData('conditions', value.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="e.g., Diabetes, Hypertension"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Medications</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={healthData.medications.join(', ')}
          onChangeText={(value) => updateHealthData('medications', value.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="e.g., Metformin, Lisinopril"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Allergies</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={healthData.allergies.join(', ')}
          onChangeText={(value) => updateHealthData('allergies', value.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="e.g., Penicillin, Peanuts"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderBasicInfo();
      case 1: return renderMeasurements();
      case 2: return renderHealthGoals();
      case 3: return renderCurrentStatus();
      case 4: return renderVitalSigns();
      case 5: return renderHealthHistory();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Profile Setup</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Ionicons name="arrow-back" size={20} color="#374151" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.nextButton, !validateStep(currentStep) && styles.disabledButton]}
          onPress={nextStep}
          disabled={!validateStep(currentStep) || loading}
        >
          <LinearGradient
            colors={validateStep(currentStep) ? ['#6366f1', '#4f46e5'] : ['#d1d5db', '#9ca3af']}
            style={styles.nextButtonGradient}
          >
            {loading ? (
              <Text style={styles.nextButtonText}>Saving...</Text>
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: '#6366f1',
  },
  inactiveStep: {
    backgroundColor: '#f3f4f6',
  },
  stepText: {
    fontSize: 10,
    textAlign: 'center',
  },
  activeStepText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  inactiveStepText: {
    color: '#9ca3af',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  selectedGender: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  genderText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedGenderText: {
    color: '#fff',
  },
  activityContainer: {
    gap: 8,
  },
  activityButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  selectedActivity: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  activityText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  selectedActivityText: {
    color: '#fff',
  },
  bmiPreview: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  bmiTitle: {
    fontSize: 14,
    color: '#0369a1',
    marginBottom: 8,
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0369a1',
  },
  bmiCategory: {
    fontSize: 16,
    color: '#0369a1',
    marginTop: 4,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default HealthOnboardingScreen;