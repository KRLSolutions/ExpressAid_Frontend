import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }: any) => {
  // Main content animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Particle system animations
  const particleAnim1 = useRef(new Animated.Value(0)).current;
  const particleAnim2 = useRef(new Animated.Value(0)).current;
  const particleAnim3 = useRef(new Animated.Value(0)).current;
  const particleAnim4 = useRef(new Animated.Value(0)).current;
  const particleAnim5 = useRef(new Animated.Value(0)).current;
  
  // Network connection animations
  const networkAnim1 = useRef(new Animated.Value(0)).current;
  const networkAnim2 = useRef(new Animated.Value(0)).current;
  const networkAnim3 = useRef(new Animated.Value(0)).current;
  
  // Concentric arcs animations
  const arcAnim1 = useRef(new Animated.Value(0)).current;
  const arcAnim2 = useRef(new Animated.Value(0)).current;
  const arcAnim3 = useRef(new Animated.Value(0)).current;
  const arcAnim4 = useRef(new Animated.Value(0)).current;
  
  // Floating dots animations
  const floatDots = useRef(Array.from({ length: 20 }, () => new Animated.Value(0))).current;
  
  // Loading animation
  const loadingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main content animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for main card
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Particle system animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim1, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim1, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim2, {
          toValue: 1,
          duration: 4000,
          delay: 500,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim2, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim3, {
          toValue: 1,
          duration: 3500,
          delay: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim3, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim4, {
          toValue: 1,
          duration: 4500,
          delay: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim4, {
          toValue: 0,
          duration: 4500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim5, {
          toValue: 1,
          duration: 3800,
          delay: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim5, {
          toValue: 0,
          duration: 3800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Network connection animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(networkAnim1, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(networkAnim1, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(networkAnim2, {
          toValue: 1,
          duration: 3200,
          delay: 800,
          useNativeDriver: true,
        }),
        Animated.timing(networkAnim2, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(networkAnim3, {
          toValue: 1,
          duration: 2800,
          delay: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(networkAnim3, {
          toValue: 0,
          duration: 2800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Concentric arcs animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(arcAnim1, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(arcAnim1, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(arcAnim2, {
          toValue: 1,
          duration: 2400,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.timing(arcAnim2, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(arcAnim3, {
          toValue: 1,
          duration: 2800,
          delay: 600,
          useNativeDriver: true,
        }),
        Animated.timing(arcAnim3, {
          toValue: 0,
          duration: 2800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(arcAnim4, {
          toValue: 1,
          duration: 3200,
          delay: 900,
          useNativeDriver: true,
        }),
        Animated.timing(arcAnim4, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating dots animations
    floatDots.forEach((dot, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 2000 + index * 200,
            delay: index * 100,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 2000 + index * 200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Loading animation
    Animated.loop(
      Animated.timing(loadingAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();

    // Navigate after animations
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 6000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Blue gradient background */}
      <LinearGradient
        colors={['#1e40af', '#2563eb', '#3b82f6']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Particle System - Left Side */}
      <View style={styles.particleContainer}>
        <Animated.View
          style={[
            styles.particle,
            {
              opacity: particleAnim1,
              transform: [
                {
                  translateY: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            {
              opacity: particleAnim2,
              transform: [
                {
                  translateY: particleAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -30],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            {
              opacity: particleAnim3,
              transform: [
                {
                  translateY: particleAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -25],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            {
              opacity: particleAnim4,
              transform: [
                {
                  translateY: particleAnim4.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -35],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            {
              opacity: particleAnim5,
              transform: [
                {
                  translateY: particleAnim5.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -15],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      {/* Network Connections - Center */}
      <View style={styles.networkContainer}>
        <Animated.View
          style={[
            styles.networkLine,
            {
              opacity: networkAnim1,
              transform: [
                {
                  scaleX: networkAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.networkLine,
            {
              opacity: networkAnim2,
              transform: [
                {
                  scaleX: networkAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.networkLine,
            {
              opacity: networkAnim3,
              transform: [
                {
                  scaleX: networkAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      {/* Concentric Arcs - Right Side */}
      <View style={styles.arcContainer}>
        <Animated.View
          style={[
            styles.concentricArc,
            {
              opacity: arcAnim1,
              transform: [
                {
                  scale: arcAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.concentricArc,
            {
              opacity: arcAnim2,
              transform: [
                {
                  scale: arcAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.concentricArc,
            {
              opacity: arcAnim3,
              transform: [
                {
                  scale: arcAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.concentricArc,
            {
              opacity: arcAnim4,
              transform: [
                {
                  scale: arcAnim4.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      {/* Floating Dots */}
      {floatDots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.floatingDot,
            {
              left: (index % 5) * (width / 5) + 20,
              top: Math.floor(index / 5) * (height / 4) + 100,
              opacity: dot,
              transform: [
                {
                  translateY: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -40],
                  }),
                },
                {
                  scale: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      {/* Main content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        {/* Glassmorphism card */}
        <Animated.View
          style={[
            styles.glassCard,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {/* Animated Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Animated.View
                style={[
                  styles.animatedIcon,
                  {
                    transform: [
                      {
                        rotate: loadingAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.iconDot1} />
                <View style={styles.iconDot2} />
                <View style={styles.iconDot3} />
                <View style={styles.iconDot4} />
              </Animated.View>
            </View>
          </View>

          {/* App name with modern typography */}
          <Text style={styles.appName}>ExpressAid</Text>
          
          {/* Tagline */}
          <Text style={styles.tagline}>Healthcare at Your Fingertips</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>Comfort & Care Combined</Text>
        </Animated.View>
      </Animated.View>

      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.loadingDot,
            {
              opacity: loadingAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 1, 0.3],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.loadingDot,
            {
              opacity: loadingAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 1, 0.3],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.loadingDot,
            {
              opacity: loadingAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 1, 0.3],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
    minWidth: 280,
    minHeight: 320,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  animatedIcon: {
    width: 50,
    height: 50,
    position: 'relative',
  },
  iconDot1: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginLeft: -4,
  },
  iconDot2: {
    position: 'absolute',
    top: '50%',
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginTop: -4,
  },
  iconDot3: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginLeft: -4,
  },
  iconDot4: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginTop: -4,
  },
  appName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
    opacity: 0.95,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '300',
    textAlign: 'center',
    opacity: 0.8,
    letterSpacing: 1,
  },
  particleContainer: {
    position: 'absolute',
    left: width * 0.1,
    top: height * 0.2,
    width: 100,
    height: 200,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  networkContainer: {
    position: 'absolute',
    left: width * 0.4,
    top: height * 0.3,
    width: 120,
    height: 120,
  },
  networkLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#ffffff',
    transformOrigin: 'left',
  },
  arcContainer: {
    position: 'absolute',
    right: width * 0.1,
    top: height * 0.2,
    width: 100,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  concentricArc: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ffffff',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  floatingDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    marginHorizontal: 6,
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default SplashScreen; 