import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  orderId: string;
  orderDetails: any;
}

const SearchingForNurseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, orderDetails } = route.params as RouteParams;

  const [countdown, setCountdown] = useState(20);
  const [orderStatus, setOrderStatus] = useState('searching');
  const [assignedNurse, setAssignedNurse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pulseAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    // Defensive: if orderId is missing, show error and go home
    if (!orderId) {
      Alert.alert('Error', 'Order not found. Please try again.', [
        { text: 'OK', onPress: () => (navigation as any).navigate('MainDrawer', { screen: 'Home' }) }
      ]);
    }

    // On mount, check order status immediately
    const fetchInitialStatus = async () => {
      setIsLoading(true);
      try {
        const response = await api.request(`/orders/${orderId}/status`);
        if (response.success) {
          const { status, assignedNurse: nurse } = response.order;
          console.log('Initial order status:', status, 'Nurse:', nurse);
          setOrderStatus(status);
          
          // If order is finished, navigate to home
          if (status === 'finished') {
            Alert.alert(
              'Order Completed',
              'Your order has been completed. Thank you for using our service!',
              [
                {
                  text: 'OK',
                  onPress: () => (navigation as any).navigate('MainDrawer', { screen: 'Home' }),
                },
              ]
            );
            return;
          }
          
          if (status === 'nurse_assigned' && nurse) {
            console.log('Nurse already assigned, setting countdown to 3 seconds');
            setAssignedNurse(nurse);
            // Show searching screen for at least 3 seconds even if nurse is assigned
            setCountdown(Math.min(countdown, 3));
          }
        }
      } catch (error: any) {
        console.error('Error fetching order status:', error);
        // If order not found (404), show error and navigate home
        if (error.message === 'Order not found' || error.message.includes('404')) {
          Alert.alert(
            'Order Not Found',
            'This order no longer exists. It may have been cancelled or completed.',
            [
              {
                text: 'OK',
                onPress: () => (navigation as any).navigate('MainDrawer', { screen: 'Home' }),
              },
            ]
          );
        } else {
          // For other errors, just log and continue with timer logic
          console.log('Order status check failed, continuing with timer...');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialStatus();

    // Start countdown timer
    let timer: NodeJS.Timeout | null = null;
    console.log('Starting countdown timer with initial value:', countdown);
    timer = setInterval(() => {
      setCountdown((prev) => {
        console.log('Countdown tick:', prev);
        if (prev <= 1) {
          if (timer) clearInterval(timer);
          console.log('Countdown finished, checking order status...');
          checkOrderStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    // Start animations
    startAnimations();
    return () => { if (timer) clearInterval(timer); };
  }, []);

  const startAnimations = () => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const checkOrderStatus = async () => {
    setIsLoading(true);
    try {
      const response = await api.request(`/orders/${orderId}/status`);
      
      if (response.success) {
        const { status, assignedNurse: nurse } = response.order;
        setOrderStatus(status);
        
        // If order is finished, navigate to home
        if (status === 'finished') {
          Alert.alert(
            'Order Completed',
            'Your order has been completed. Thank you for using our service!',
            [
              {
                text: 'OK',
                onPress: () => (navigation as any).navigate('MainDrawer', { screen: 'Home' }),
              },
            ]
          );
          return;
        }
        
        if (status === 'nurse_assigned' && nurse) {
          setAssignedNurse(nurse);
        } else if (status === 'no_nurses_available') {
          Alert.alert(
            'No Nurses Available',
            'Sorry, no nurses are currently available in your area. Please try again later.',
            [
              {
                text: 'OK',
                onPress: () => (navigation as any).navigate('MainDrawer', { screen: 'Home' }),
              },
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('Error checking order status:', error);
      // If order not found (404), show error and navigate home
      if (error.message === 'Order not found' || error.message.includes('404')) {
        Alert.alert(
          'Order Not Found',
          'This order no longer exists. It may have been cancelled or completed.',
          [
            {
              text: 'OK',
              onPress: () => (navigation as any).navigate('MainDrawer', { screen: 'Home' }),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to check order status. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderSearchingView = () => (
    <LinearGradient colors={["#e0e7ff", "#f1f5f9"]} style={styles.bgModern}>
      <View style={styles.centeredCardModern}>
        <Animated.View style={{
          transform: [{ scale: pulseAnim }],
          backgroundColor: '#2563eb22',
          borderRadius: 60,
          padding: 18,
          marginBottom: 18,
        }}>
          <Ionicons name="search" size={64} color="#2563eb" />
        </Animated.View>
        <Text style={styles.searchingTitleModern}>Searching for a nurse...</Text>
        <Text style={styles.searchingSubtitleModern}>We are finding the best nurse for your needs. Please wait a moment.</Text>
        <View style={styles.progressBarModernWrap}>
          <View style={[styles.progressBarModern, { width: `${(countdown / 20) * 100}%` }]} />
        </View>
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 24 }} />
      </View>
    </LinearGradient>
  );

  const renderNurseAssignedView = () => {
    // Generate a random distance between 5 and 10 km
    const fakeDistance = `${(Math.random() * 5 + 5).toFixed(1)} km`;
    // Always show 10 completed orders
    const completedOrders = 10;
    // Helper for experience display
    const getExperienceText = (exp: number | undefined) => {
      if (exp === 0 || exp === undefined || exp === null) return 'Experienced';
      if (exp === 1) return '1 year experience';
      return `${exp} years experience`;
    };
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#4CAF50', '#66BB6A']}
          style={styles.gradient}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => (navigation as any).navigate('MainDrawer', { screen: 'Home' })}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.content}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Nurse Assigned!</Text>
            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Your healthcare professional is on the way
            </Text>

            {/* Nurse Details Card */}
            <View style={styles.nurseCard}>
              <View style={styles.nurseHeader}>
                <View style={styles.nurseAvatar}>
                  <Ionicons name="person" size={40} color="#FF6B35" />
                </View>
                <View style={styles.nurseInfo}>
                  <Text style={styles.nurseName}>{assignedNurse.name}</Text>
                  <Text style={styles.nurseDetails}>
                    {getExperienceText(assignedNurse.experience)} • {assignedNurse.rating}⭐
                  </Text>
                </View>
              </View>

              {/* Specializations */}
              <View style={styles.specializationsContainer}>
                <Text style={styles.specializationsTitle}>Specializations:</Text>
                <View style={styles.specializationsList}>
                  {assignedNurse.specializations.slice(0, 3).map((spec: string, index: number) => (
                    <View key={index} style={styles.specializationTag}>
                      <Text style={styles.specializationText}>{spec}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{completedOrders}</Text>
                  <Text style={styles.statLabel}>Orders Completed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{fakeDistance}</Text>
                  <Text style={styles.statLabel}>Distance</Text>
                </View>
              </View>

              {/* ETA */}
              <View style={styles.etaContainer}>
                <Ionicons name="time" size={20} color="#666" />
                <Text style={styles.etaText}>
                  Estimated arrival: {new Date(assignedNurse.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => (navigation as any).navigate('MainDrawer', { screen: 'Orders' })}
              >
                <Text style={styles.primaryButtonText}>Track Order</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => (navigation as any).navigate('MainDrawer', { screen: 'Orders' })}
              >
                <Text style={styles.secondaryButtonText}>View All Orders</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (orderStatus === 'nurse_assigned' && assignedNurse) {
    return renderNurseAssignedView();
  }

  return renderSearchingView();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  successIconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  countdownLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  statusText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  nurseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  nurseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  nurseAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  nurseInfo: {
    flex: 1,
  },
  nurseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  nurseDetails: {
    fontSize: 14,
    color: '#666',
  },
  specializationsContainer: {
    marginBottom: 20,
  },
  specializationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  specializationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specializationTag: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  specializationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
  },
  etaText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 8,
    fontWeight: '500',
  },
  actionButtons: {
    width: '100%',
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 44,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 20,
    padding: 8,
  },
  bgModern: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  centeredCardModern: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 36,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    width: '88%',
    maxWidth: 400,
  },
  searchingTitleModern: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchingSubtitleModern: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 18,
    textAlign: 'center',
  },
  progressBarModernWrap: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarModern: {
    height: 8,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
});

export default SearchingForNurseScreen; 