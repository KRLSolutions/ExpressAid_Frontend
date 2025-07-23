import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }: any) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(-100)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo animation - slide down from top with scale and fade
    Animated.parallel([
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Text animation - fade in and slide up
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

    // Navigate after animations
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#2563eb', '#1d4ed8', '#1e40af']}
      style={styles.container}
    >
      {/* Animated Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [
              { translateY: logoTranslateY },
              { scale: logoScale },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoCircle,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Image 
            source={require('../assets/EA.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>

      {/* Animated Text */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={styles.appName}>ExpressAid</Text>
        <Text style={styles.tagline}>We combine Comfort & Care</Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
    marginTop: 4,
    fontWeight: '300',
    letterSpacing: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 100,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 4,
  },
});

export default SplashScreen; 