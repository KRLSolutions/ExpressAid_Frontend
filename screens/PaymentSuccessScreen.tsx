import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  HomeScreen: undefined;
  SearchingForNurseScreen: { orderId: string };
  PaymentSuccessScreen: { amount: number; orderId: string };
};

type NavigationPropType = NavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const PaymentSuccessScreen = ({ route }: { route: any }) => {
  const navigation = useNavigation<NavigationPropType>();
  const [countdown, setCountdown] = useState(20);
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);
  const particleAnim = new Animated.Value(0);

  const { amount, orderId } = route.params || {};

  useEffect(() => {
    // Animate checkmark entrance
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate text fade in
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Animate particles
    Animated.timing(particleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigation.navigate('SearchingForNurseScreen', { orderId });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBackPress = () => {
    navigation.navigate('HomeScreen');
  };

  const handleSkipWait = () => {
    navigation.navigate('SearchingForNurseScreen', { orderId });
  };

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      {/* Success content */}
      <View style={styles.content}>
        {/* Animated checkmark */}
        <Animated.View
          style={[
            styles.checkmarkContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.checkmarkCircle}>
            <View style={styles.checkmarkInner}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          </View>
        </Animated.View>

        {/* Animated particles */}
        <Animated.View
          style={[
            styles.particlesContainer,
            {
              opacity: particleAnim,
            },
          ]}
        >
          {[...Array(12)].map((_, index) => (
            <View
              key={index}
                              style={[
                  styles.particle,
                  {
                    left: Math.random() * width,
                    top: Math.random() * (height * 0.4),
                  },
                ]}
            />
          ))}
        </Animated.View>

        {/* Success text */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: opacityAnim,
            },
          ]}
        >
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.amountText}>₹{amount || '1430'} Paid Successfully</Text>
          <Text style={styles.orderText}>Order ID: {orderId || 'ORDER_123'}</Text>
        </Animated.View>

        {/* Countdown and navigation */}
        <Animated.View
          style={[
            styles.navigationContainer,
            {
              opacity: opacityAnim,
            },
          ]}
        >
          <Text style={styles.countdownText}>
            Finding your nurse in {countdown} seconds...
          </Text>
          
          <TouchableOpacity style={styles.skipButton} onPress={handleSkipWait}>
            <Text style={styles.skipButtonText}>Skip Wait</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8fafc',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  checkmarkContainer: {
    marginBottom: 40,
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  checkmarkInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    opacity: 0.6,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  amountText: {
    fontSize: 20,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  orderText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  navigationContainer: {
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  skipButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  skipButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PaymentSuccessScreen; 