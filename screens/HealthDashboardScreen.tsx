import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

interface HealthMetrics {
  hasData: boolean;
  height?: number;
  weight?: number;
  bmi?: number;
  bmiCategory?: string;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    category: string;
  };
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  bloodSugar?: number;
  targetWeight?: number;
  targetBMI?: number;
  activityLevel?: string;
  dailySteps?: number;
  measurements?: any[];
  conditions?: any[];
  medications?: any[];
  allergies?: any[];
  emergencyContacts?: any[];
}

const HealthDashboardScreen: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadHealthData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadHealthData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      
      if (token) {
        const response = await api.request('/health/metrics', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.success) {
          setHealthData(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading health data:', error);
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

  const getBloodPressureColor = (category: string) => {
    switch (category) {
      case 'Normal': return '#4CAF50';
      case 'Elevated': return '#FF9800';
      case 'High': return '#FF5722';
      case 'Very High': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getHeartRateColor = (rate: number) => {
    if (rate >= 60 && rate <= 100) return '#4CAF50';
    if (rate < 60 || rate > 100) return '#FF9800';
    return '#9E9E9E';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 36.1 && temp <= 37.2) return '#4CAF50';
    if (temp > 37.5) return '#F44336';
    return '#FF9800';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
        <View style={styles.loadingContainer}>
          <Ionicons name="heart" size={60} color="#2563eb" />
          <Text style={styles.loadingText}>Loading your health data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* Header */}
      <LinearGradient
        colors={['#2563eb', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="heart" size={32} color="#fff" />
            <Text style={styles.headerTitle}>Health Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={loadHealthData}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Welcome Section */}
          {!healthData?.hasData && (
            <View style={styles.welcomeCard}>
              <Ionicons name="fitness" size={48} color="#2563eb" />
              <Text style={styles.welcomeTitle}>Welcome to Your Health Dashboard</Text>
              <Text style={styles.welcomeSubtitle}>
                Start tracking your health metrics to get personalized insights and monitor your progress.
              </Text>
              <TouchableOpacity style={styles.getStartedButton}>
                <Text style={styles.getStartedButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* BMI Card */}
          {healthData?.hasData && healthData.bmi && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Ionicons name="scale" size={24} color="#2563eb" />
                  <Text style={styles.cardTitle}>Body Mass Index</Text>
                </View>
                <View style={[styles.bmiBadge, { backgroundColor: getBMIColor(healthData.bmiCategory || '') }]}>
                  <Text style={styles.bmiBadgeText}>{healthData.bmiCategory}</Text>
                </View>
              </View>
              
              <View style={styles.bmiContent}>
                <View style={styles.bmiValueContainer}>
                  <Text style={styles.bmiValue}>{healthData.bmi}</Text>
                  <Text style={styles.bmiUnit}>BMI</Text>
                </View>
                
                <View style={styles.bmiDetails}>
                  <View style={styles.bmiDetail}>
                    <Text style={styles.bmiDetailLabel}>Height</Text>
                    <Text style={styles.bmiDetailValue}>{healthData.height} cm</Text>
                  </View>
                  <View style={styles.bmiDetail}>
                    <Text style={styles.bmiDetailLabel}>Weight</Text>
                    <Text style={styles.bmiDetailValue}>{healthData.weight} kg</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Vitals Grid */}
          {healthData?.hasData && (
            <View style={styles.vitalsGrid}>
              <Text style={styles.sectionTitle}>Vital Signs</Text>
              
              {/* Blood Pressure */}
              {healthData.bloodPressure && (
                <View style={styles.vitalCard}>
                  <View style={styles.vitalHeader}>
                    <Ionicons name="pulse" size={20} color="#F44336" />
                    <Text style={styles.vitalTitle}>Blood Pressure</Text>
                  </View>
                  <Text style={styles.vitalValue}>
                    {healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic}
                  </Text>
                  <Text style={styles.vitalUnit}>mmHg</Text>
                  <View style={[styles.vitalBadge, { backgroundColor: getBloodPressureColor(healthData.bloodPressure.category) }]}>
                    <Text style={styles.vitalBadgeText}>{healthData.bloodPressure.category}</Text>
                  </View>
                </View>
              )}

              {/* Heart Rate */}
              {healthData.heartRate && (
                <View style={styles.vitalCard}>
                  <View style={styles.vitalHeader}>
                    <Ionicons name="heart" size={20} color="#E91E63" />
                    <Text style={styles.vitalTitle}>Heart Rate</Text>
                  </View>
                  <Text style={styles.vitalValue}>{healthData.heartRate}</Text>
                  <Text style={styles.vitalUnit}>bpm</Text>
                  <View style={[styles.vitalBadge, { backgroundColor: getHeartRateColor(healthData.heartRate) }]}>
                    <Text style={styles.vitalBadgeText}>
                      {healthData.heartRate >= 60 && healthData.heartRate <= 100 ? 'Normal' : 'Check'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Temperature */}
              {healthData.temperature && (
                <View style={styles.vitalCard}>
                  <View style={styles.vitalHeader}>
                    <Ionicons name="thermometer" size={20} color="#FF9800" />
                    <Text style={styles.vitalTitle}>Temperature</Text>
                  </View>
                  <Text style={styles.vitalValue}>{healthData.temperature}°C</Text>
                  <Text style={styles.vitalUnit}>Celsius</Text>
                  <View style={[styles.vitalBadge, { backgroundColor: getTemperatureColor(healthData.temperature) }]}>
                    <Text style={styles.vitalBadgeText}>
                      {healthData.temperature >= 36.1 && healthData.temperature <= 37.2 ? 'Normal' : 'Check'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Oxygen Saturation */}
              {healthData.oxygenSaturation && (
                <View style={styles.vitalCard}>
                  <View style={styles.vitalHeader}>
                    <Ionicons name="air" size={20} color="#2196F3" />
                    <Text style={styles.vitalTitle}>O₂ Saturation</Text>
                  </View>
                  <Text style={styles.vitalValue}>{healthData.oxygenSaturation}%</Text>
                  <Text style={styles.vitalUnit}>SpO₂</Text>
                  <View style={[styles.vitalBadge, { backgroundColor: healthData.oxygenSaturation >= 95 ? '#4CAF50' : '#FF9800' }]}>
                    <Text style={styles.vitalBadgeText}>
                      {healthData.oxygenSaturation >= 95 ? 'Normal' : 'Low'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Health Goals */}
          {healthData?.hasData && (healthData.targetWeight || healthData.targetBMI || healthData.dailySteps) && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="flag" size={24} color="#4CAF50" />
                <Text style={styles.cardTitle}>Health Goals</Text>
              </View>
              
              <View style={styles.goalsContainer}>
                {healthData.targetWeight && (
                  <View style={styles.goalItem}>
                    <Text style={styles.goalLabel}>Target Weight</Text>
                    <Text style={styles.goalValue}>{healthData.targetWeight} kg</Text>
                    {healthData.weight && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { 
                                width: `${Math.min(100, Math.max(0, ((healthData.weight - healthData.targetWeight) / healthData.targetWeight) * 100))}%`,
                                backgroundColor: healthData.weight <= healthData.targetWeight ? '#4CAF50' : '#FF9800'
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {healthData.dailySteps && (
                  <View style={styles.goalItem}>
                    <Text style={styles.goalLabel}>Daily Steps</Text>
                    <Text style={styles.goalValue}>{healthData.dailySteps.toLocaleString()}</Text>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              width: `${Math.min(100, (healthData.dailySteps / 10000) * 100)}%`,
                              backgroundColor: healthData.dailySteps >= 10000 ? '#4CAF50' : '#FF9800'
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>Goal: 10,000 steps</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionCard}>
                <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.actionGradient}>
                  <Ionicons name="add-circle" size={32} color="#fff" />
                  <Text style={styles.actionTitle}>Add Vitals</Text>
                  <Text style={styles.actionSubtitle}>Record new measurements</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.actionGradient}>
                  <Ionicons name="trending-up" size={32} color="#fff" />
                  <Text style={styles.actionTitle}>View History</Text>
                  <Text style={styles.actionSubtitle}>Track your progress</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.actionGradient}>
                  <Ionicons name="medical" size={32} color="#fff" />
                  <Text style={styles.actionTitle}>Medical Info</Text>
                  <Text style={styles.actionSubtitle}>Conditions & medications</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <LinearGradient colors={['#9C27B0', '#7B1FA2']} style={styles.actionGradient}>
                  <Ionicons name="settings" size={32} color="#fff" />
                  <Text style={styles.actionTitle}>Health Goals</Text>
                  <Text style={styles.actionSubtitle}>Set targets & track</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Health Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={24} color="#FFC107" />
              <Text style={styles.tipsTitle}>Health Tips</Text>
            </View>
            <Text style={styles.tipText}>
              • Monitor your BMI regularly to maintain a healthy weight{'\n'}
              • Keep your blood pressure below 120/80 mmHg{'\n'}
              • Aim for 10,000 steps daily for optimal health{'\n'}
              • Stay hydrated and maintain a balanced diet
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 16,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  getStartedButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  bmiBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bmiBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bmiContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bmiValueContainer: {
    alignItems: 'center',
    marginRight: 24,
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  bmiUnit: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  bmiDetails: {
    flex: 1,
  },
  bmiDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bmiDetailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  bmiDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
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
    marginBottom: 8,
  },
  vitalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  vitalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  vitalUnit: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  vitalBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  vitalBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  goalsContainer: {
    gap: 16,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  quickActions: {
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtitle: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.9,
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

export default HealthDashboardScreen;