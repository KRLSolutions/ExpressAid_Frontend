import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const { width } = Dimensions.get('window');

interface VitalsData {
  systolic: string;
  diastolic: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
  bloodSugar: string;
}

const VitalsEntryScreen: React.FC = () => {
  const [vitals, setVitals] = useState<VitalsData>({
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
    bloodSugar: '',
  });
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const updateVital = (field: keyof VitalsData, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const validateVitals = () => {
    const errors: string[] = [];

    if (vitals.systolic && vitals.diastolic) {
      const systolic = parseInt(vitals.systolic);
      const diastolic = parseInt(vitals.diastolic);
      
      if (systolic < 70 || systolic > 200) {
        errors.push('Systolic pressure must be between 70-200 mmHg');
      }
      if (diastolic < 40 || diastolic > 130) {
        errors.push('Diastolic pressure must be between 40-130 mmHg');
      }
      if (systolic <= diastolic) {
        errors.push('Systolic pressure must be higher than diastolic');
      }
    }

    if (vitals.heartRate) {
      const heartRate = parseInt(vitals.heartRate);
      if (heartRate < 40 || heartRate > 200) {
        errors.push('Heart rate must be between 40-200 bpm');
      }
    }

    if (vitals.temperature) {
      const temp = parseFloat(vitals.temperature);
      if (temp < 35 || temp > 42) {
        errors.push('Temperature must be between 35-42°C');
      }
    }

    if (vitals.oxygenSaturation) {
      const o2 = parseInt(vitals.oxygenSaturation);
      if (o2 < 70 || o2 > 100) {
        errors.push('Oxygen saturation must be between 70-100%');
      }
    }

    if (vitals.bloodSugar) {
      const sugar = parseInt(vitals.bloodSugar);
      if (sugar < 50 || sugar > 500) {
        errors.push('Blood sugar must be between 50-500 mg/dL');
      }
    }

    return errors;
  };

  const saveVitals = async () => {
    const errors = validateVitals();
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    // Check if at least one vital is entered
    const hasAnyVital = Object.values(vitals).some(value => value.trim() !== '');
    if (!hasAnyVital) {
      Alert.alert('Error', 'Please enter at least one vital sign');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        const vitalsData: any = {};
        
        if (vitals.systolic && vitals.diastolic) {
          vitalsData.systolic = parseInt(vitals.systolic);
          vitalsData.diastolic = parseInt(vitals.diastolic);
        }
        if (vitals.heartRate) vitalsData.heartRate = parseInt(vitals.heartRate);
        if (vitals.temperature) vitalsData.temperature = parseFloat(vitals.temperature);
        if (vitals.oxygenSaturation) vitalsData.oxygenSaturation = parseInt(vitals.oxygenSaturation);
        if (vitals.bloodSugar) vitalsData.bloodSugar = parseInt(vitals.bloodSugar);

        const response = await api.request('/health/vitals', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(vitalsData),
        });

        if (response.success) {
          Alert.alert(
            'Success',
            'Your vital signs have been saved!',
            [{ text: 'OK' }]
          );
          // Clear form
          setVitals({
            systolic: '',
            diastolic: '',
            heartRate: '',
            temperature: '',
            oxygenSaturation: '',
            bloodSugar: '',
          });
        }
      }
    } catch (error) {
      console.error('Error saving vitals:', error);
      Alert.alert('Error', 'Failed to save vital signs');
    } finally {
      setLoading(false);
    }
  };

  const getVitalColor = (field: keyof VitalsData, value: string) => {
    if (!value) return '#e5e7eb';
    
    const numValue = parseFloat(value);
    
    switch (field) {
      case 'systolic':
      case 'diastolic':
        if (field === 'systolic') {
          if (numValue < 120) return '#4CAF50';
          if (numValue < 130) return '#FF9800';
          return '#F44336';
        } else {
          if (numValue < 80) return '#4CAF50';
          if (numValue < 90) return '#FF9800';
          return '#F44336';
        }
      case 'heartRate':
        if (numValue >= 60 && numValue <= 100) return '#4CAF50';
        return '#FF9800';
      case 'temperature':
        if (numValue >= 36.1 && numValue <= 37.2) return '#4CAF50';
        if (numValue > 37.5) return '#F44336';
        return '#FF9800';
      case 'oxygenSaturation':
        if (numValue >= 95) return '#4CAF50';
        return '#FF9800';
      case 'bloodSugar':
        if (numValue >= 70 && numValue <= 140) return '#4CAF50';
        return '#FF9800';
      default:
        return '#e5e7eb';
    }
  };

  const getVitalStatus = (field: keyof VitalsData, value: string) => {
    if (!value) return '';
    
    const numValue = parseFloat(value);
    
    switch (field) {
      case 'systolic':
        if (numValue < 120) return 'Normal';
        if (numValue < 130) return 'Elevated';
        return 'High';
      case 'diastolic':
        if (numValue < 80) return 'Normal';
        if (numValue < 90) return 'Elevated';
        return 'High';
      case 'heartRate':
        if (numValue >= 60 && numValue <= 100) return 'Normal';
        return 'Check';
      case 'temperature':
        if (numValue >= 36.1 && numValue <= 37.2) return 'Normal';
        if (numValue > 37.5) return 'Fever';
        return 'Check';
      case 'oxygenSaturation':
        if (numValue >= 95) return 'Normal';
        return 'Low';
      case 'bloodSugar':
        if (numValue >= 70 && numValue <= 140) return 'Normal';
        return 'Check';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* Header */}
      <LinearGradient
        colors={['#2563eb', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="pulse" size={32} color="#fff" />
          <Text style={styles.headerTitle}>Vital Signs</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          
          {/* Blood Pressure Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pulse" size={24} color="#F44336" />
              <Text style={styles.sectionTitle}>Blood Pressure</Text>
            </View>
            
            <View style={styles.bpContainer}>
              <View style={styles.bpInputGroup}>
                <Text style={styles.inputLabel}>Systolic (mmHg)</Text>
                <View style={[styles.inputWrapper, { borderColor: getVitalColor('systolic', vitals.systolic) }]}>
                  <TextInput
                    style={styles.textInput}
                    value={vitals.systolic}
                    onChangeText={(value) => updateVital('systolic', value)}
                    placeholder="120"
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                  <Text style={styles.inputUnit}>mmHg</Text>
                </View>
                {vitals.systolic && (
                  <View style={[styles.statusBadge, { backgroundColor: getVitalColor('systolic', vitals.systolic) }]}>
                    <Text style={styles.statusText}>{getVitalStatus('systolic', vitals.systolic)}</Text>
                  </View>
                )}
              </View>

              <View style={styles.bpDivider}>
                <Text style={styles.bpDividerText}>/</Text>
              </View>

              <View style={styles.bpInputGroup}>
                <Text style={styles.inputLabel}>Diastolic (mmHg)</Text>
                <View style={[styles.inputWrapper, { borderColor: getVitalColor('diastolic', vitals.diastolic) }]}>
                  <TextInput
                    style={styles.textInput}
                    value={vitals.diastolic}
                    onChangeText={(value) => updateVital('diastolic', value)}
                    placeholder="80"
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                  <Text style={styles.inputUnit}>mmHg</Text>
                </View>
                {vitals.diastolic && (
                  <View style={[styles.statusBadge, { backgroundColor: getVitalColor('diastolic', vitals.diastolic) }]}>
                    <Text style={styles.statusText}>{getVitalStatus('diastolic', vitals.diastolic)}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Other Vitals */}
          <View style={styles.vitalsGrid}>
            {/* Heart Rate */}
            <View style={styles.vitalCard}>
              <View style={styles.vitalHeader}>
                <Ionicons name="heart" size={20} color="#E91E63" />
                <Text style={styles.vitalTitle}>Heart Rate</Text>
              </View>
              <View style={[styles.inputWrapper, { borderColor: getVitalColor('heartRate', vitals.heartRate) }]}>
                <TextInput
                  style={styles.textInput}
                  value={vitals.heartRate}
                  onChangeText={(value) => updateVital('heartRate', value)}
                  placeholder="72"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.inputUnit}>bpm</Text>
              </View>
              {vitals.heartRate && (
                <View style={[styles.statusBadge, { backgroundColor: getVitalColor('heartRate', vitals.heartRate) }]}>
                  <Text style={styles.statusText}>{getVitalStatus('heartRate', vitals.heartRate)}</Text>
                </View>
              )}
            </View>

            {/* Temperature */}
            <View style={styles.vitalCard}>
              <View style={styles.vitalHeader}>
                <Ionicons name="thermometer" size={20} color="#FF9800" />
                <Text style={styles.vitalTitle}>Temperature</Text>
              </View>
              <View style={[styles.inputWrapper, { borderColor: getVitalColor('temperature', vitals.temperature) }]}>
                <TextInput
                  style={styles.textInput}
                  value={vitals.temperature}
                  onChangeText={(value) => updateVital('temperature', value)}
                  placeholder="36.8"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.inputUnit}>°C</Text>
              </View>
              {vitals.temperature && (
                <View style={[styles.statusBadge, { backgroundColor: getVitalColor('temperature', vitals.temperature) }]}>
                  <Text style={styles.statusText}>{getVitalStatus('temperature', vitals.temperature)}</Text>
                </View>
              )}
            </View>

            {/* Oxygen Saturation */}
            <View style={styles.vitalCard}>
              <View style={styles.vitalHeader}>
                <Ionicons name="air" size={20} color="#2196F3" />
                <Text style={styles.vitalTitle}>O₂ Saturation</Text>
              </View>
              <View style={[styles.inputWrapper, { borderColor: getVitalColor('oxygenSaturation', vitals.oxygenSaturation) }]}>
                <TextInput
                  style={styles.textInput}
                  value={vitals.oxygenSaturation}
                  onChangeText={(value) => updateVital('oxygenSaturation', value)}
                  placeholder="98"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.inputUnit}>%</Text>
              </View>
              {vitals.oxygenSaturation && (
                <View style={[styles.statusBadge, { backgroundColor: getVitalColor('oxygenSaturation', vitals.oxygenSaturation) }]}>
                  <Text style={styles.statusText}>{getVitalStatus('oxygenSaturation', vitals.oxygenSaturation)}</Text>
                </View>
              )}
            </View>

            {/* Blood Sugar */}
            <View style={styles.vitalCard}>
              <View style={styles.vitalHeader}>
                <Ionicons name="water" size={20} color="#9C27B0" />
                <Text style={styles.vitalTitle}>Blood Sugar</Text>
              </View>
              <View style={[styles.inputWrapper, { borderColor: getVitalColor('bloodSugar', vitals.bloodSugar) }]}>
                <TextInput
                  style={styles.textInput}
                  value={vitals.bloodSugar}
                  onChangeText={(value) => updateVital('bloodSugar', value)}
                  placeholder="100"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.inputUnit}>mg/dL</Text>
              </View>
              {vitals.bloodSugar && (
                <View style={[styles.statusBadge, { backgroundColor: getVitalColor('bloodSugar', vitals.bloodSugar) }]}>
                  <Text style={styles.statusText}>{getVitalStatus('bloodSugar', vitals.bloodSugar)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveVitals}
            disabled={loading}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.saveGradient}
            >
              {loading ? (
                <Text style={styles.saveButtonText}>Saving...</Text>
              ) : (
                <>
                  <Ionicons name="save" size={24} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Vital Signs</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Normal Ranges Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Normal Ranges</Text>
            
            <View style={styles.rangesGrid}>
              <View style={styles.rangeItem}>
                <Text style={styles.rangeTitle}>Blood Pressure</Text>
                <Text style={styles.rangeValue}>&lt; 120/80 mmHg</Text>
              </View>
              
              <View style={styles.rangeItem}>
                <Text style={styles.rangeTitle}>Heart Rate</Text>
                <Text style={styles.rangeValue}>60-100 bpm</Text>
              </View>
              
              <View style={styles.rangeItem}>
                <Text style={styles.rangeTitle}>Temperature</Text>
                <Text style={styles.rangeValue}>36.1-37.2°C</Text>
              </View>
              
              <View style={styles.rangeItem}>
                <Text style={styles.rangeTitle}>O₂ Saturation</Text>
                <Text style={styles.rangeValue}>≥ 95%</Text>
              </View>
              
              <View style={styles.rangeItem}>
                <Text style={styles.rangeTitle}>Blood Sugar</Text>
                <Text style={styles.rangeValue}>70-140 mg/dL</Text>
              </View>
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={24} color="#FFC107" />
              <Text style={styles.tipsTitle}>Tips for Accurate Readings</Text>
            </View>
            <Text style={styles.tipText}>
              • Rest for 5 minutes before taking blood pressure{'\n'}
              • Measure heart rate when relaxed{'\n'}
              • Use a reliable thermometer for temperature{'\n'}
              • Ensure proper fit for oxygen saturation monitor{'\n'}
              • Test blood sugar as recommended by your doctor
            </Text>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  bpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bpInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '600',
  },
  inputUnit: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginLeft: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  bpDivider: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  bpDividerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64748b',
  },
  vitalsGrid: {
    marginBottom: 20,
  },
  vitalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vitalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  rangesGrid: {
    gap: 12,
  },
  rangeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rangeTitle: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  rangeValue: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

export default VitalsEntryScreen;