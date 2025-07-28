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

interface BMICalculation {
  bmi: number;
  category: string;
  height: number;
  weight: number;
}

const BMICalculatorScreen: React.FC = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState<BMICalculation | null>(null);
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

  const calculateBMI = () => {
    const heightValue = parseFloat(height);
    const weightValue = parseFloat(weight);

    if (!heightValue || !weightValue) {
      Alert.alert('Error', 'Please enter both height and weight');
      return;
    }

    if (heightValue < 50 || heightValue > 300) {
      Alert.alert('Error', 'Height must be between 50-300 cm');
      return;
    }

    if (weightValue < 10 || weightValue > 500) {
      Alert.alert('Error', 'Weight must be between 10-500 kg');
      return;
    }

    const heightInMeters = heightValue / 100;
    const bmi = Math.round((weightValue / (heightInMeters * heightInMeters)) * 10) / 10;
    
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    const result: BMICalculation = {
      bmi,
      category,
      height: heightValue,
      weight: weightValue,
    };

    setBmiResult(result);
  };

  const saveToHealthProfile = async () => {
    if (!bmiResult) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        const response = await api.request('/health/basic-measurements', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            height: bmiResult.height,
            weight: bmiResult.weight,
          }),
        });

        if (response.success) {
          Alert.alert(
            'Success',
            'Your BMI has been saved to your health profile!',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error saving BMI:', error);
      Alert.alert('Error', 'Failed to save BMI to health profile');
    } finally {
      setLoading(false);
    }
  };

  const getBMIColor = (category: string) => {
    switch (category) {
      case 'Underweight': return '#FFB74D';
      case 'Normal weight': return '#4CAF50';
      case 'Overweight': return '#FF9800';
      case 'Obese': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getBMIDescription = (category: string) => {
    switch (category) {
      case 'Underweight':
        return 'You may need to gain weight. Consider consulting a healthcare provider for guidance on healthy weight gain.';
      case 'Normal weight':
        return 'Great! You\'re in the healthy weight range. Maintain your current lifestyle and regular exercise.';
      case 'Overweight':
        return 'Consider lifestyle changes like diet and exercise. Consult a healthcare provider for personalized advice.';
      case 'Obese':
        return 'It\'s recommended to consult a healthcare provider for a comprehensive weight management plan.';
      default:
        return '';
    }
  };

  const getBMITips = (category: string) => {
    switch (category) {
      case 'Underweight':
        return [
          'Eat nutrient-rich foods',
          'Include healthy fats in your diet',
          'Consider strength training',
          'Eat more frequently'
        ];
      case 'Normal weight':
        return [
          'Maintain regular exercise',
          'Eat a balanced diet',
          'Stay hydrated',
          'Get adequate sleep'
        ];
      case 'Overweight':
        return [
          'Increase physical activity',
          'Reduce calorie intake',
          'Eat more vegetables',
          'Limit processed foods'
        ];
      case 'Obese':
        return [
          'Consult a healthcare provider',
          'Start with walking',
          'Focus on portion control',
          'Keep a food diary'
        ];
      default:
        return [];
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
          <Ionicons name="calculator" size={32} color="#fff" />
          <Text style={styles.headerTitle}>BMI Calculator</Text>
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
          
          {/* Input Section */}
          <View style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Enter Your Measurements</Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={height}
                    onChangeText={setHeight}
                    placeholder="170"
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                  <Text style={styles.inputUnit}>cm</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="70"
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                  <Text style={styles.inputUnit}>kg</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.calculateButton}
              onPress={calculateBMI}
              disabled={!height || !weight}
            >
              <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                style={styles.calculateGradient}
              >
                <Ionicons name="calculator" size={24} color="#fff" />
                <Text style={styles.calculateButtonText}>Calculate BMI</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* BMI Result */}
          {bmiResult && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="analytics" size={28} color="#2563eb" />
                <Text style={styles.resultTitle}>Your BMI Result</Text>
              </View>

              <View style={styles.bmiDisplay}>
                <View style={styles.bmiValueContainer}>
                  <Text style={styles.bmiValue}>{bmiResult.bmi}</Text>
                  <Text style={styles.bmiLabel}>BMI</Text>
                </View>
                
                <View style={[styles.categoryBadge, { backgroundColor: getBMIColor(bmiResult.category) }]}>
                  <Text style={styles.categoryText}>{bmiResult.category}</Text>
                </View>
              </View>

              <View style={styles.measurementsDisplay}>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Height</Text>
                  <Text style={styles.measurementValue}>{bmiResult.height} cm</Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Weight</Text>
                  <Text style={styles.measurementValue}>{bmiResult.weight} kg</Text>
                </View>
              </View>

              <Text style={styles.descriptionText}>
                {getBMIDescription(bmiResult.category)}
              </Text>

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveToHealthProfile}
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
                      <Ionicons name="save" size={20} color="#fff" />
                      <Text style={styles.saveButtonText}>Save to Health Profile</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* BMI Categories Info */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>BMI Categories</Text>
            
            <View style={styles.categoryGrid}>
              <View style={[styles.categoryItem, { backgroundColor: '#FFB74D' }]}>
                <Text style={styles.categoryItemTitle}>Underweight</Text>
                <Text style={styles.categoryItemRange}>&lt; 18.5</Text>
              </View>
              
              <View style={[styles.categoryItem, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.categoryItemTitle}>Normal Weight</Text>
                <Text style={styles.categoryItemRange}>18.5 - 24.9</Text>
              </View>
              
              <View style={[styles.categoryItem, { backgroundColor: '#FF9800' }]}>
                <Text style={styles.categoryItemTitle}>Overweight</Text>
                <Text style={styles.categoryItemRange}>25.0 - 29.9</Text>
              </View>
              
              <View style={[styles.categoryItem, { backgroundColor: '#F44336' }]}>
                <Text style={styles.categoryItemTitle}>Obese</Text>
                <Text style={styles.categoryItemRange}>&gt; 30.0</Text>
              </View>
            </View>
          </View>

          {/* Health Tips */}
          {bmiResult && (
            <View style={styles.tipsCard}>
              <Text style={styles.sectionTitle}>Health Tips</Text>
              
              {getBMITips(bmiResult.category).map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimerCard}>
            <Ionicons name="information-circle" size={20} color="#64748b" />
            <Text style={styles.disclaimerText}>
              BMI is a screening tool and may not be accurate for everyone. 
              Consult a healthcare provider for personalized health advice.
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
  inputCard: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
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
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    marginLeft: 8,
  },
  calculateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  calculateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  bmiDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bmiValueContainer: {
    alignItems: 'center',
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  bmiLabel: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  measurementsDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  measurementItem: {
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
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
    fontSize: 16,
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
  categoryGrid: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  categoryItemTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryItemRange: {
    color: '#fff',
    fontSize: 14,
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
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  disclaimerCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});

export default BMICalculatorScreen;